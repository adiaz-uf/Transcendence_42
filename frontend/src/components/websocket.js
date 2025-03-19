
class WebSocketManager {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 2000;
        this.gameUpdateCallback = null;
        this.userId = this.getUserId();
        
        //this.connect();
    }

    getUserId() {
        let userId = localStorage.getItem("userId");
        if (!userId) {
            userId = `user-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("userId", userId);
        }
        return userId;
    }

    connect() {
        this.socket = new WebSocket(this.serverUrl);

        this.socket.addEventListener("open", () => {
            console.log("Connected to WebSocket server");
            this.reconnectAttempts = 0;
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
                if (this.gameUpdateCallback) {
                    this.gameUpdateCallback(data);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        });
    }

    close() {
        console.log("Closing WebSocket...");
        this.manualClose = true;
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
                this.connect();
            }, this.reconnectDelay);
        } else {
            console.error("Maximum reconnection attempts reached. WebSocket will not reconnect.");
        }
    }

    sendMessage(message) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket not ready. Message not sent.");
        }
    }

    //webSocketClient.sendPlayerMove({ 'data': {'izq': pressedKeysPlayerOne === "w" ? "up" : "down"} });

    sendPlayerMove(data) {
        let update = {'type':'update', 'data':data,'userId': this.userId}
        console.log(update)
        this.sendMessage(update);
    }

    listenForGameUpdates(callback) {
        this.gameUpdateCallback = callback;
    }
}

// Initialize WebSocketManager
const webSocketClient = new WebSocketManager(`wss://${window.location.hostname}/ws/game/`);

// export const connect = () => webSocketClient.connect();

// export const close = () => webSocketClient.close();
// // Export functions for external use
// export const sendPlayerMove = (update) => webSocketClient.sendPlayerMove(update);

// export const sendMessage = (message) => webSocketClient.sendMessage(message);

// export const listenForGameUpdates = (callback) => webSocketClient.listenForGameUpdates(callback);

export default webSocketClient;


// let userId = localStorage.getItem("userId");
// if (!userId) {
//     userId = `user-${Math.random().toString(36).substr(2, 9)}`;
//     localStorage.setItem("userId", userId);
// }

// const SERVER_URL = `wss://${window.location.hostname}/ws/game/`;
// let socket;
// let reconnectAttempts = 0;
// const maxReconnectAttempts = 10;
// const reconnectDelay = 2000; // 2 seconds

// const connectWebSocket = () => {
//     socket = new WebSocket(SERVER_URL);

//     socket.addEventListener("open", () => {
//         console.log("Connected to WebSocket server");
//         reconnectAttempts = 0;
//     });

//     socket.addEventListener("close", (event) => {
//         console.warn(`Disconnected from WebSocket server: ${event.reason}`);
//         // if (reconnectAttempts < maxReconnectAttempts) {
//         //     setTimeout(() => {
//         //         console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
//         //         reconnectAttempts++;
//         //         connectWebSocket();
//         //     }, reconnectDelay);
//         // } else {
//         //     console.error("Maximum reconnection attempts reached. WebSocket will not reconnect.");
//         // }
//     });

//     socket.addEventListener("error", (error) => {
//         console.error("WebSocket Error:", error);
//     });

// 	socket.addEventListener("message", (event) => {
// 		try {
// 			const data = JSON.parse(event.data);

// 			if (gameUpdateCallback)
// 				gameUpdateCallback(data);

// 		} catch (error) {
// 			console.error("Error during the WebSocket's parsing:", error);
// 		}
// 	});
// };

// connectWebSocket();

// export const sendMessage = (message) => {
//     if (socket.readyState === WebSocket.OPEN) {
//         socket.send(JSON.stringify(message));
//     } else {
//         console.warn("WebSocket not ready. Message not sent.");
//     }
// };

// // export const joinGame = (gameId) => {
// //     sendMessage({ action: "joinGame", gameId, userId });
// // };

// export const sendPlayerMove = (update) => {
//     sendMessage({update, userId });
// };

// let gameUpdateCallback = null;
// // Funcion que configura la funcion de recepcion de un mensaje del servidor
// export const listenForGameUpdates = (callback) => {
//     gameUpdateCallback = callback;
// };