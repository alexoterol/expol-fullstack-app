// Realizado por Jose Chong

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"slices"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Cambiar para que valide bien despues
		},
	}

	userConnections = make(map[int64][]*Client)
	connectionMu    sync.RWMutex

	rdb *redis.Client
	ctx = context.Background()
)

type Client struct {
	ID         string
	UserID     int64
	Conn       *websocket.Conn
	Send       chan []byte
	LastPing   time.Time
	ConnectedAt time.Time
}

type Message struct {
	MessageID      string    `json:"message_id"`
	ConversationID int64     `json:"conversation_id"`
	UserID         int64     `json:"user_id"`
	RecipientID    int64     `json:"recipient_id"`
	Content        string    `json:"content"`
	CreatedAt      time.Time `json:"created_at"`
	Type           string    `json:"type"`
	DeliveredAt    *time.Time `json:"delivered_at,omitempty"`
}

type MessageAck struct {
	Type      string    `json:"type"`
	MessageID string    `json:"message_id"`
	UserID    int64     `json:"user_id"`
	Timestamp time.Time `json:"timestamp"`
}

func main() {
	initRedis()

	go subscribeToRedis()
	go cleanupDeadConnections()
	go processPendingMessages()

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", handleWebSocket)
	mux.HandleFunc("/health", handleHealth)
	mux.HandleFunc("/api/pending", handleGetPending)
    mux.HandleFunc("/api/test/send", handleTestSend)
	mux.HandleFunc("/api/test/redis", handleTestRedis)

	handler := corsMiddleware(mux)

	port := getEnv("PORT", "8080")

	log.Printf("WebSocket server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowedOrigins := []string{
			"http://localhost:3001",
			"http://localhost:5173",
		}
		if customOrigin := os.Getenv("ALLOWED_ORIGIN"); customOrigin != "" {
			allowedOrigins = append(allowedOrigins, customOrigin)
		}
		if slices.Contains(allowedOrigins, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func initRedis() {
	redisURL := getEnv("REDIS_URL", "redis://localhost:6379/1")
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatal("Error parsing Redis URL:", err)
	}
	rdb = redis.NewClient(opt)
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatal("Error connecting to Redis:", err)
	}
	log.Println("Connected to Redis")
}

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

	connectionMu.Lock()
	userConnections[userID] = append(userConnections[userID], client)
	connectionCount := len(userConnections[userID])
	connectionMu.Unlock()

	log.Printf("Client %s connected (User %d, total connections: %d)",
		client.ID, userID, connectionCount)

	setUserOnline(userID, true)

	go deliverPendingMessages(client)

	go client.readPump()
	go client.writePump()
}

func (c *Client) readPump() {
	defer func() {
		c.Conn.Close()
		removeConnection(c)
		log.Printf("Client %s disconnected (User %d)", c.ID, c.UserID)
	}()

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
				log.Printf("Error: %v", err)
			}
			break
		}
		handleClientMessage(c, message)
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
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
		log.Println("Error unmarshaling message:", err)
		return
	}

	msgType, ok := msg["type"].(string)
	if !ok {
		log.Println("Invalid message type")
		return
	}

	switch msgType {
	case "ack":
		if messageID, ok := msg["message_id"].(string); ok {
			markMessageDelivered(messageID, client.UserID)
		}

	case "typing":
		recipientID, ok := msg["recipient_id"].(float64)
		if !ok {
			return
		}
		broadcastToUser(int64(recipientID), data)

	case "read":
		conversationID, ok := msg["conversation_id"].(float64)
		if !ok {
			return
		}
		broadcastReadReceipt(client.UserID, int64(conversationID))
	}
}

func subscribeToRedis() {
	pubsub := rdb.Subscribe(ctx, "new_message")
	defer pubsub.Close()

	ch := pubsub.Channel()
	log.Println("Listening for messages from Redis...")

	for msg := range ch {
		var message Message
		if err := json.Unmarshal([]byte(msg.Payload), &message); err != nil {
			log.Println("Error unmarshaling Redis message:", err)
			continue
		}

		delivered := deliverMessage(&message)

		if !delivered {
			savePendingMessage(&message)
			log.Printf("Message %s queued for user %d (offline)",
				message.MessageID, message.RecipientID)
		} else {
			log.Printf("Message %s delivered to user %d",
				message.MessageID, message.RecipientID)
		}
	}
}

func deliverMessage(message *Message) bool {
	data, _ := json.Marshal(message)

	connectionMu.RLock()
	connections := userConnections[message.RecipientID]
	connectionMu.RUnlock()

	if len(connections) == 0 {
		return false
	}

	delivered := 0
	for _, client := range connections {
		select {
		case client.Send <- data:
			delivered++
		default:
			log.Printf("Client %s send buffer full", client.ID)
		}
	}

	return delivered > 0
}

func broadcastToUser(userID int64, message []byte) {
	connectionMu.RLock()
	connections := userConnections[userID]
	connectionMu.RUnlock()

	for _, client := range connections {
		select {
		case client.Send <- message:
		default:
			log.Printf("Client %s send buffer full", client.ID)
		}
	}
}

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

	for _, connections := range userConnections {
		for _, client := range connections {
			if client.UserID != userID {
				select {
				case client.Send <- data:
				default:
				}
			}
		}
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
	if err != nil {
		return
	}

	if len(messages) == 0 {
		return
	}

	log.Printf("Delivering %d pending messages to user %d", len(messages), client.UserID)

	for _, msgData := range messages {
		select {
		case client.Send <- []byte(msgData):
		default:
			log.Printf("Could not deliver pending message to client %s", client.ID)
		}
	}

	rdb.Del(ctx, key)
}


func markMessageDelivered(messageID string, userID int64) {
	key := fmt.Sprintf("delivered:%s:%d", messageID, userID)
	rdb.Set(ctx, key, time.Now().Unix(), 7*24*time.Hour)
	log.Printf("✅ Message %s acknowledged by user %d", messageID, userID)
}

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
		log.Printf("User %d fully disconnected (no more connections)", client.UserID)
	}
}

func cleanupDeadConnections() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		connectionMu.Lock()

		for userID, connections := range userConnections {
			alive := []*Client{}
			for _, client := range connections {

				if time.Since(client.LastPing) < 2*time.Minute {
					alive = append(alive, client)
				} else {
					client.Conn.Close()
					log.Printf("Cleaned up dead connection %s (User %d)", client.ID, userID)
				}
			}

			if len(alive) > 0 {
				userConnections[userID] = alive
			} else {
				delete(userConnections, userID)
				setUserOnline(userID, false)
			}
		}

		connectionMu.Unlock()
	}
}

func processPendingMessages() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		keys, err := rdb.Keys(ctx, "pending:*").Result()
		if err != nil {
			continue
		}

		for _, key := range keys {
			var userID int64
			fmt.Sscanf(key, "pending:%d", &userID)

			connectionMu.RLock()
			isOnline := len(userConnections[userID]) > 0
			connectionMu.RUnlock()

			if isOnline {
				messages, _ := rdb.LRange(ctx, key, 0, -1).Result()
				for _, msgData := range messages {
					var message Message
					if err := json.Unmarshal([]byte(msgData), &message); err == nil {
						if deliverMessage(&message) {
							rdb.LRem(ctx, key, 1, msgData)
						}
					}
				}
			}
		}
	}
}

func setUserOnline(userID int64, online bool) {
	status := "offline"
	if online {
		status = "online"
	}
	key := fmt.Sprintf("user:%d:status", userID)
	rdb.Set(ctx, key, status, 5*time.Minute)
}

func handleGetPending(w http.ResponseWriter, r *http.Request) {
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

	key := fmt.Sprintf("pending:%d", userID)
	messages, err := rdb.LRange(ctx, key, 0, -1).Result()
	if err != nil {
		http.Error(w, "error fetching messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"user_id":  userID,
		"count":    len(messages),
		"messages": messages,
	})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	connectionMu.RLock()
	totalConnections := 0
	for _, connections := range userConnections {
		totalConnections += len(connections)
	}
	uniqueUsers := len(userConnections)
	connectionMu.RUnlock()

	response := map[string]any{
		"status":             "ok",
		"total_connections":  totalConnections,
		"unique_users":       uniqueUsers,
		"timestamp":          time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handleTestSend(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

    if r.Method == "OPTIONS" {
        w.WriteHeader(http.StatusOK)
        return
    }

    if r.Method != "POST" {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var message Message
    if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
        http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
        return
    }


    if message.RecipientID == 0 {
        http.Error(w, "recipient_id is required", http.StatusBadRequest)
        return
    }
    if message.UserID == 0 {
        http.Error(w, "user_id is required", http.StatusBadRequest)
        return
    }


    if message.MessageID == "" {
        message.MessageID = fmt.Sprintf("msg_%d", time.Now().UnixNano())
    }


    message.CreatedAt = time.Now()


    if message.Type == "" {
        message.Type = "message"
    }


    data, err := json.Marshal(message)
    if err != nil {
        http.Error(w, "Error marshaling message", http.StatusInternalServerError)
        return
    }

    if err := rdb.Publish(ctx, "new_message", data).Err(); err != nil {
        http.Error(w, fmt.Sprintf("Error publishing to Redis: %v", err), http.StatusInternalServerError)
        return
    }

    log.Printf("Test message published: %s to user %d", message.MessageID, message.RecipientID)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]any{
        "status":     "published",
        "message_id": message.MessageID,
        "recipient":  message.RecipientID,
        "timestamp":  message.CreatedAt,
    })
}

func handleTestRedis(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")

    pong, err := rdb.Ping(ctx).Result()
    if err != nil {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(map[string]any{
            "status": "error",
            "error":  err.Error(),
        })
        return
    }

    info, _ := rdb.Info(ctx, "stats").Result()

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]any{
        "status": "ok",
        "ping":   pong,
        "info":   info,
    })
}
