// ==================== SERVICIO WEBSOCKET ====================
// Conexión con el servicio de mensajería en tiempo real (Go)

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.userId = null;
    this.isConnecting = false;
    this.messageQueue = [];
  }

  connect(userId) {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      console.log('WebSocket ya está conectado o conectando');
      return;
    }

    this.userId = userId;
    this.isConnecting = true;

    try {
      this.socket = new WebSocket(`${WS_URL}?user_id=${userId}`);

      this.socket.onopen = () => {
        console.log('✅ WebSocket conectado');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', { userId });
        
        // Enviar mensajes en cola
        this.flushMessageQueue();
      };

      this.socket.onclose = (event) => {
        console.log('❌ WebSocket desconectado:', event.code, event.reason);
        this.isConnecting = false;
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Intentar reconectar
        if (this.userId && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(this.userId), this.reconnectDelay);
        }
      };

      this.socket.onerror = (error) => {
        console.error('Error de WebSocket:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parseando mensaje:', error);
        }
      };
    } catch (error) {
      console.error('Error creando WebSocket:', error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.userId = null;
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevenir reconexión
  }

  handleMessage(data) {
    const { type, ...payload } = data;

    switch (type) {
      case 'message':
        this.emit('new_message', payload);
        // Enviar ACK automático
        this.sendAck(payload.message_id);
        break;
      
      case 'typing':
        this.emit('typing', payload);
        break;
      
      case 'read_receipt':
        this.emit('read_receipt', payload);
        break;
      
      case 'user_online':
        this.emit('user_online', payload);
        break;
      
      case 'user_offline':
        this.emit('user_offline', payload);
        break;
      
      default:
        this.emit(type || 'unknown', payload);
    }
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      return true;
    } else {
      // Agregar a cola si no está conectado
      this.messageQueue.push(message);
      console.warn('WebSocket no conectado, mensaje agregado a cola');
      return false;
    }
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  sendMessage(recipientId, content, conversationId = null) {
    return this.send({
      type: 'message',
      recipient_id: recipientId,
      content: content,
      conversation_id: conversationId,
      message_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  sendTyping(recipientId, conversationId) {
    return this.send({
      type: 'typing',
      recipient_id: recipientId,
      conversation_id: conversationId,
      user_id: this.userId,
    });
  }

  sendReadReceipt(conversationId) {
    return this.send({
      type: 'read',
      conversation_id: conversationId,
    });
  }

  sendAck(messageId) {
    return this.send({
      type: 'ack',
      message_id: messageId,
    });
  }

  // Sistema de eventos
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    // Retornar función para desuscribirse
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en listener de ${event}:`, error);
        }
      });
    }
  }

  // Estado de conexión
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  getConnectionState() {
    if (!this.socket) return 'DISCONNECTED';
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'DISCONNECTED';
      default: return 'UNKNOWN';
    }
  }
}

// Singleton
const wsService = new WebSocketService();

// Hook de React para usar WebSocket
export const useWebSocket = (userId) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [messages, setMessages] = React.useState([]);

  React.useEffect(() => {
    if (!userId) return;

    wsService.connect(userId);

    const unsubConnect = wsService.on('connected', () => setIsConnected(true));
    const unsubDisconnect = wsService.on('disconnected', () => setIsConnected(false));
    const unsubMessage = wsService.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubMessage();
    };
  }, [userId]);

  return {
    isConnected,
    messages,
    sendMessage: wsService.sendMessage.bind(wsService),
    sendTyping: wsService.sendTyping.bind(wsService),
    sendReadReceipt: wsService.sendReadReceipt.bind(wsService),
  };
};

export default wsService;
