package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

// ================= CONFIGURACIÓN GLOBAL =================

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // En producción, ajusta esto a tu dominio real
		},
	}

	// Mapa de conexiones: UserID -> Lista de Clientes (pestañas abiertas)
	userConnections = make(map[int64][]*Client)
	connectionMu    sync.RWMutex

	rdb *redis.Client
	ctx = context.Background()
)

// ================= ESTRUCTURAS =================

type Client struct {
	ID          string
	UserID      int64
	Conn        *websocket.Conn
	Send        chan []byte
	LastPing    time.Time
	ConnectedAt time.Time
}

type Message struct {
	MessageID      string     `json:"message_id"`
	ConversationID int64      `json:"conversation_id"`
	UserID         int64      `json:"user_id"`
	RecipientID    int64      `json:"recipient_id"`
	Content        string     `json:"content"`
	CreatedAt      time.Time  `json:"created_at"`
	Type           string     `json:"type"`
	DeliveredAt    *time.Time `json:"delivered_at,omitempty"`
	Sender         *User      `json:"sender,omitempty"`
}

type User struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type StatusUpdate struct {
	Type   string `json:"type"`
	UserID int64  `json:"user_id"`
	Online bool   `json:"online"`
}

type TypingIndicator struct {
	Type           string `json:"type"`
	UserID         int64  `json:"user_id"`
	ConversationID int64  `json:"conversation_id"`
}

// ================= MAIN =================

func main() {
	initRedis()

	// Goroutines para mantenimiento
	go subscribeToRedis()
	go cleanupDeadConnections()
	go processPendingMessages()

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", handleWebSocket)
	mux.HandleFunc("/health", handleHealth)

	// API Endpoints
	mux.HandleFunc("/api/pending", handleGetPending)
	mux.HandleFunc("/api/online-users", handleGetOnlineUsers)

	// Test endpoints
	mux.HandleFunc("/api/test/send", handleTestSend)

	handler := corsMiddleware(mux)
	port := getEnv("PORT", "8080")

	log.Printf("🚀 WebSocket server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}

// ================= WEBSOCKET HANDLER =================

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		http.Error(w, "user_id required", http.StatusBadRequest)
		return
	}

	var userID int64
	if _, err := fmt.Sscanf(userIDStr, "%d", &userID); err != nil {
		http.Error(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	client := &Client{
		ID:          uuid.New().String(),
		UserID:      userID,
		Conn:        conn,
		Send:        make(chan []byte, 256),
		LastPing:    time.Now(),
		ConnectedAt: time.Now(),
	}

	// 1. REGISTRAR CONEXIÓN
	connectionMu.Lock()
	existingConnections := len(userConnections[userID])
	userConnections[userID] = append(userConnections[userID], client)
	connectionMu.Unlock()

	log.Printf("✅ Client %s connected (User %d)", client.ID, userID)

	// 2. ACTUALIZAR ESTADO REDIS
	setUserOnline(userID, true)

	// 3. BROADCAST "ONLINE"
	if existingConnections == 0 {
		log.Printf("📢 Broadcasting user %d is ONLINE", userID)
		broadcastUserStatus(userID, true)
	}

	// 4. ENVIAR LISTA DE USUARIOS ONLINE AL NUEVO CLIENTE
	sendOnlineUsersList(client)

	// 5. ENTREGAR MENSAJES PENDIENTES
	go deliverPendingMessages(client)

	// 6. INICIAR LOOPS
	go client.writePump()
	client.readPump()
}

// ================= LOGICA DE CLIENTE =================

func (c *Client) readPump() {
	defer func() {
		removeConnection(c)
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(4096)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		c.LastPing = time.Now()
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("❌ Error reading from user %d: %v", c.UserID, err)
			}
			break
		}
		handleClientMessage(c, message)
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(50 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func handleClientMessage(client *Client, data []byte) {
	var msg map[string]any
	if err := json.Unmarshal(data, &msg); err != nil {
		return
	}

	msgType, _ := msg["type"].(string)

	switch msgType {
	case "ack":
		if messageID, ok := msg["message_id"].(string); ok {
			markMessageDelivered(messageID, client.UserID)
		}

	case "typing":
		recipientID, ok := msg["recipient_id"].(float64)
		if !ok { return }

		typing := TypingIndicator{
			Type:           "typing",
			UserID:         client.UserID,
			ConversationID: int64(msg["conversation_id"].(float64)),
		}
		payload, _ := json.Marshal(typing)
		broadcastToUser(int64(recipientID), payload)

	case "read":
		// 🔥🔥🔥 AQUÍ ESTÁ EL FIX DEL VISTO EN BACKEND 🔥🔥🔥
		conversationID, ok := msg["conversation_id"].(float64)
		if !ok { return }

		log.Printf("👀 User %d read conversation %d", client.UserID, int64(conversationID))
		broadcastReadReceipt(client.UserID, int64(conversationID))
	}
}

// ================= GESTIÓN DE CONEXIONES =================

func removeConnection(client *Client) {
	connectionMu.Lock()
	defer connectionMu.Unlock()

	connections := userConnections[client.UserID]
	for i, c := range connections {
		if c.ID == client.ID {
			userConnections[client.UserID] = append(connections[:i], connections[i+1:]...)
			break
		}
	}

	if len(userConnections[client.UserID]) == 0 {
		delete(userConnections, client.UserID)
		setUserOnline(client.UserID, false)
		go func(uid int64) {
			broadcastUserStatus(uid, false)
		}(client.UserID)
	}
}

func broadcastUserStatus(userID int64, online bool) {
	status := StatusUpdate{
		Type:   "user_status",
		UserID: userID,
		Online: online,
	}
	data, _ := json.Marshal(status)

	connectionMu.RLock()
	defer connectionMu.RUnlock()

	for targetUserID, connections := range userConnections {
		if targetUserID == userID { continue } // No enviar a sí mismo
		for _, client := range connections {
			select {
			case client.Send <- data:
			default:
			}
		}
	}
}

func sendOnlineUsersList(client *Client) {
	connectionMu.RLock()
	defer connectionMu.RUnlock()
	for userID := range userConnections {
		if userID == client.UserID { continue }
		status := StatusUpdate{
			Type:   "user_status",
			UserID: userID,
			Online: true,
		}
		data, _ := json.Marshal(status)
		select {
		case client.Send <- data:
		default:
		}
	}
}

// 🔥🔥🔥 ESTA FUNCIÓN FALTABA EN TU CÓDIGO ANTERIOR 🔥🔥🔥
func broadcastReadReceipt(userID int64, conversationID int64) {
	receipt := map[string]any{
		"type":            "read_receipt",
		"user_id":         userID,
		"conversation_id": conversationID,
		"timestamp":       time.Now(),
	}
	data, _ := json.Marshal(receipt)

	connectionMu.RLock()
	defer connectionMu.RUnlock()

	// Enviar a todos MENOS al que lo leyó
	for uid, connections := range userConnections {
		if uid != userID {
			for _, client := range connections {
				select {
				case client.Send <- data:
				default:
				}
			}
		}
	}
}

func broadcastToUser(userID int64, message []byte) {
	connectionMu.RLock()
	connections := userConnections[userID]
	connectionMu.RUnlock()
	for _, client := range connections {
		select {
		case client.Send <- message:
		default:
		}
	}
}

// ================= REDIS =================

func subscribeToRedis() {
	pubsub := rdb.Subscribe(ctx, "new_message")
	defer pubsub.Close()
	ch := pubsub.Channel()
	for msg := range ch {
		var message Message
		if err := json.Unmarshal([]byte(msg.Payload), &message); err == nil {
			if !deliverMessage(&message) {
				savePendingMessage(&message)
			}
		}
	}
}

func deliverMessage(message *Message) bool {
	data, _ := json.Marshal(message)
	connectionMu.RLock()
	connections := userConnections[message.RecipientID]
	connectionMu.RUnlock()
	if len(connections) == 0 { return false }

	sent := 0
	for _, client := range connections {
		select {
		case client.Send <- data:
			sent++
		default:
		}
	}
	return sent > 0
}

func initRedis() {
	redisURL := getEnv("REDIS_URL", "redis://localhost:6379/1")
	opt, err := redis.ParseURL(redisURL)
	if err != nil { log.Fatal(err) }
	rdb = redis.NewClient(opt)
}

func setUserOnline(userID int64, online bool) {
	key := fmt.Sprintf("user:%d:status", userID)
	if online {
		rdb.Set(ctx, key, "online", 10*time.Minute)
	} else {
		rdb.Del(ctx, key)
	}
}

func savePendingMessage(message *Message) {
	key := fmt.Sprintf("pending:%d", message.RecipientID)
	data, _ := json.Marshal(message)
	rdb.LPush(ctx, key, data)
	rdb.Expire(ctx, key, 7*24*time.Hour)
}

func deliverPendingMessages(client *Client) {
	key := fmt.Sprintf("pending:%d", client.UserID)
	messages, err := rdb.LRange(ctx, key, 0, -1).Result()
	if err == nil {
		for i := len(messages) - 1; i >= 0; i-- {
			select {
			case client.Send <- []byte(messages[i]):
			default:
			}
		}
		rdb.Del(ctx, key)
	}
}

func markMessageDelivered(messageID string, userID int64) {
	log.Printf("✅ Message %s acknowledged by user %d", messageID, userID)
}

func cleanupDeadConnections() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		connectionMu.Lock()
		for userID, connections := range userConnections {
			active := []*Client{}
			for _, client := range connections {
				if time.Since(client.LastPing) < 2*time.Minute {
					active = append(active, client)
				} else {
					client.Conn.Close()
				}
			}
			if len(active) > 0 {
				userConnections[userID] = active
			} else {
				delete(userConnections, userID)
				setUserOnline(userID, false)
				go broadcastUserStatus(userID, false)
			}
		}
		connectionMu.Unlock()
	}
}

func processPendingMessages() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {}
}

// ================= HELPERS =================

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" { return value }
	return defaultValue
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		if r.Method == "OPTIONS" { w.WriteHeader(http.StatusOK); return }
		next.ServeHTTP(w, r)
	})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func handleGetPending(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"implemented_via_ws"}`))
}

func handleGetOnlineUsers(w http.ResponseWriter, r *http.Request) {
	connectionMu.RLock()
	defer connectionMu.RUnlock()
	users := make([]int64, 0, len(userConnections))
	for uid := range userConnections { users = append(users, uid) }
	json.NewEncoder(w).Encode(map[string]any{"online_users": users, "count": len(users)})
}

func handleTestSend(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" { http.Error(w, "Method not allowed", 405); return }
	var msg Message
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil { http.Error(w, err.Error(), 400); return }
	data, _ := json.Marshal(msg)
	rdb.Publish(ctx, "new_message", data)
	w.Write([]byte("Message published"))
}
