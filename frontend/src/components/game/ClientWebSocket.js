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
        console.info('WebSocket connection state changed to:', state);
    }

    connect() {
        if (this.isConnecting) {
            return this.connectionPromise;
        }

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.setConnectionState('connected');
            return Promise.resolve();
        }

        this.isConnecting = true;
        this.setConnectionState('connecting');
        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                console.info("Attempting to connect to WebSocket server at:", this.serverUrl);
                this.socket = new WebSocket(this.serverUrl);

                this.socket.addEventListener("open", () => {
                    console.info("Connected to WebSocket server");
                    this.reconnectAttempts = 0;
                    this.isConnecting = false;
                    this.setConnectionState('connected');
                    resolve();
                });

                this.socket.addEventListener("close", (event) => {
                    console.warn(`WebSocket connection closed: ${event.reason} (code: ${event.code})`);
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
        console.info("Closing WebSocket connection...");
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        ClientWebSocket.instance = null;
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                console.warn(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
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
                console.info("WebSocket not connected, attempting to connect...");
                await this.connect();
            }
            
            if (this.socket.readyState === WebSocket.OPEN) {
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
        await this.sendMessage({"type": "game_active", "game_active": true});
    }

    async sendStopGame() {
        await this.sendMessage({"type": "game_active", "game_active": false});
    }

    async sendPlayerMove(side, direction) {
        await this.sendMessage({
            type: "update",
            userId: this.userId,
            side: side,
            direction: direction
        });
    }

    handleServerMessage(data) {
        if (data.type === "game_update") {
            if (this.gameUpdateCallback) {
                this.gameUpdateCallback(data);
            }
        } else if (data.type === "error") {
            console.error("Server Error:", data.message);
        }
    }

    listenForGameUpdates(callback) {
        this.gameUpdateCallback = callback;
    }
}

export default ClientWebSocket;
