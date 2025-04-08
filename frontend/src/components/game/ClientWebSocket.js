import { ACCESS_TOKEN } from "../../constants"; //JWT auth ws

class ClientWebSocket {
    constructor(serverUrl) {
        if (ClientWebSocket.instance) {
            return ClientWebSocket.instance; // Ensure singleton instance
        }

        // Use dynamic hostname from current window location
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const hostname = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : '';
        this.serverUrl = `${wsProtocol}//${hostname}${port}/game/`;
        console.log('WebSocket URL:', this.serverUrl);

        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.gameUpdateCallback = null;
        this.userId = localStorage.getItem("userId") || 'anonymous';
        this.isConnecting = false;
        this.connectionPromise = null;
        this.connectionState = 'disconnected';
        this.onConnectionStateChange = null;
        this.lastMessageTime = Date.now();
        this.messageCount = 0;

        ClientWebSocket.instance = this;
        this.connect();

        // Add heartbeat check
        setInterval(() => {
            if (this.connectionState === 'connected') {
                const now = Date.now();
                if (now - this.lastMessageTime > 5000) {
                    console.warn('No messages received for 5 seconds');
                }
            }
        }, 5000);
    }

    setConnectionState(state) {
        this.connectionState = state;
        if (this.onConnectionStateChange) {
            this.onConnectionStateChange(state);
        }
        console.log('WebSocket connection state changed to:', state);
    }

    connect() {
        if (this.isConnecting) {
            return this.connectionPromise;
        }

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.setConnectionState('connected');
            console.log("WebSocket is already connected.");
            return Promise.resolve();
        }

        this.isConnecting = true;
        this.setConnectionState('connecting');
        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                console.log("Attempting to connect to WebSocket server at:", this.serverUrl);
                this.socket = new WebSocket(this.serverUrl);

                this.socket.addEventListener("open", () => {
                    console.log("Connected to WebSocket server");
                    this.reconnectAttempts = 0;
                    this.isConnecting = false;
                    this.setConnectionState('connected');
                    resolve();
                });

                this.socket.addEventListener("close", (event) => {
                    console.log(`WebSocket connection closed: ${event.reason} (code: ${event.code})`);
                    this.isConnecting = false;
                    this.setConnectionState('disconnected');
                    
                    if (!event.wasClean) {
                        this.handleReconnect();
                    }
                });

                this.socket.addEventListener("error", (error) => {
                    console.error("WebSocket Error:", error);
                    this.isConnecting = false;
                    this.setConnectionState('error');
                    
                    if (this.gameUpdateCallback) {
                        this.gameUpdateCallback({
                            type: 'error',
                            message: 'Connection error. Please check your network connection.'
                        });
                    }
                    
                    reject(error);
                });

                this.socket.addEventListener("message", (event) => {
                    this.lastMessageTime = Date.now();
                    this.messageCount++;
                    try {
                        const data = JSON.parse(event.data);
                        console.log(`Message ${this.messageCount} received:`, data);
                        this.handleServerMessage(data);
                    } catch (error) {
                        console.error("Error parsing WebSocket message:", error);
                        if (this.gameUpdateCallback) {
                            this.gameUpdateCallback({ type: 'error', message: 'Invalid server message' });
                        }
                    }
                });
            } catch (error) {
                this.isConnecting = false;
                this.setConnectionState('error');
                console.error("WebSocket connection error:", error);
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    close() {
        console.log("Closing WebSocket connection...");
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        ClientWebSocket.instance = null;
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                console.log(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
                this.reconnectAttempts++;
                this.connect();
            }, this.reconnectDelay);
        } else {
            console.error("Maximum reconnection attempts reached. Please refresh the page.");
        }
    }

    async sendMessage(message) {
        try {
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                console.log("WebSocket not connected, attempting to connect...");
                await this.connect();
            }
            
            if (this.socket.readyState === WebSocket.OPEN) {
                console.log('Sending message:', message);
                this.socket.send(JSON.stringify(message));
            } else {
                throw new Error(`WebSocket is not in OPEN state (current state: ${this.socket.readyState})`);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            if (this.gameUpdateCallback) {
                this.gameUpdateCallback({ type: 'error', message: 'Failed to send message to server' });
            }
            throw error;
        }
    }

    async sendPlayGame() {
        console.log("Sending play game message");  // Debug log
        await this.sendMessage({"type": "game_active", "game_active": true});
        console.log("Play game message sent");  // Debug log
    }

    async sendStopGame() {
        console.log("Sending stop game message");  // Debug log
        await this.sendMessage({"type": "game_active", "game_active": false});
        console.log("Stop game message sent");  // Debug log
    }

    async sendPlayerMove(side, direction) {
        console.log(`Sending player move: ${side} paddle ${direction}`);  // Debug log
        await this.sendMessage({
            type: "update",
            userId: this.userId,
            side: side,
            direction: direction
        });
    }

    handleServerMessage(data) {
        console.log("Handling server message:", data);  // Debug log
        if (data.type === "game_update") {
            if (this.gameUpdateCallback) {
                this.gameUpdateCallback(data);
            }
        } else if (data.type === "error") {
            console.error("Server Error:", data.message);
        } else {
            console.log("Received server message:", data);
        }
    }

    listenForGameUpdates(callback) {
        this.gameUpdateCallback = callback;
    }
}

export default ClientWebSocket;
