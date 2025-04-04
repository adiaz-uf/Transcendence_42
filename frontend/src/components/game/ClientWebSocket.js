import { ACCESS_TOKEN } from "../../constants"; //JWT auth ws

class ClientWebSocket {
    constructor(serverUrl, matchId) {
        if (ClientWebSocket.instance) {
            return ClientWebSocket.instance; // Ensure singleton instance
        }
        this.matchId = matchId;
        this.serverUrl = serverUrl;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 2000;
        this.gameUpdateCallback = null;
        this.userId = localStorage.getItem("userId");
        this.matchId = null;
        this.manualClose = false;

        ClientWebSocket.instance = this;
        this.connect()
    }

    connect() {

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.warn("WebSocket is already connected.");
            return;
        }

        this.socket = new WebSocket(this.serverUrl);

        this.socket.addEventListener("open", () => {
            console.log("Connected to WebSocket server");
            this.reconnectAttempts = 0;

            this.sendConnectToGame(this.matchId); 
            // Send initial connection message with matchId
        });

        this.socket.addEventListener("close", (event) => {
            console.log(`Disconnected from WebSocket server: ${event.reason}`);
            //this.handleReconnect();
        });

        this.socket.addEventListener("error", (error) => {
            console.error("WebSocket Error:", error);
        });

        this.socket.addEventListener("message", (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);

            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        });
    }

    close() {
        console.log("Closing WebSocket...");
        if (this.socket) {
            this.socket.removeEventListener("open", this.connect);
            this.socket.removeEventListener("message", this.gameUpdateCallback);
            //this.socket.removeEventListener("close", this.handleReconnect);
            this.socket.close();
            this.socket = null;
        }
    }
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                console.log(`Reconnecting... Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
                this.reconnectAttempts++;
                this.connect(this.matchId);
            }, this.reconnectDelay);
        } else {
            console.error("Maximum reconnection attempts reached. WebSocket will not reconnect.");
        }
    }

    sendMessage(message) {

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket not ready. Message not sent.");
        }
    }
    sendConnectToGame(matchId){
        this.sendMessage({"type":"connectToMatch", "matchId":matchId});
    }
    sendPlayGame(){
        this.sendMessage({"type":"game_active", "game_active":true});
    }

    sendStopGame(){
        this.sendMessage({"type":"game_active", "game_active":false});
    }

    sendPlayerMove(direction) {

        console.log("Sending: ", {
            type: "update",
            userId: this.userId,
            direction
        });
        this.sendMessage({
            type: "update",
            userId: this.userId,
            direction
        });
    }

    handleServerMessage(data) {
        if (data.type === "game_update") {
            if (this.gameUpdateCallback) {
                this.gameUpdateCallback(data);
            }
        } else if (data.type === "invite") {
            console.log("Someone invited you !");
        } else if (data.type === "Error") {
            console.error("Server Error:", data.message);
        } else {
            console.log("Unhandled server message:", data);
        }
    }


    listenForGameUpdates(callback) {
        this.gameUpdateCallback = callback;
    }
}

export default ClientWebSocket;
