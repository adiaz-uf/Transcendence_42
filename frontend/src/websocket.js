let userId = localStorage.getItem("userId");
if (!userId) {
    userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("userId", userId);
}

const SERVER_URL = `wss://${window.location.hostname}/ws/`;
let socket;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
const reconnectDelay = 2000; // 2 seconds

const connectWebSocket = () => {
    socket = new WebSocket(SERVER_URL);

    socket.addEventListener("open", () => {
        console.log("Connected to WebSocket server");
        reconnectAttempts = 0;
    });

    socket.addEventListener("close", (event) => {
        console.warn(`Disconnected from WebSocket server: ${event.reason}`);
        if (reconnectAttempts < maxReconnectAttempts) {
            setTimeout(() => {
                console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
                reconnectAttempts++;
                connectWebSocket();
            }, reconnectDelay);
        } else {
            console.error("Maximum reconnection attempts reached. WebSocket will not reconnect.");
        }
    });

    socket.addEventListener("error", (error) => {
        console.error("WebSocket Error:", error);
    });

    socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "gameUpdate" && gameUpdateCallback) {
            gameUpdateCallback(data);
        }
    });
};

connectWebSocket();

const sendMessage = (message) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.warn("WebSocket not ready. Message not sent.");
    }
};

export const joinGame = (gameId) => {
    sendMessage({ action: "joinGame", gameId, userId });
};

export const sendPlayerMove = (key) => {
    sendMessage({ action: "playerMove", key, userId });
};

let gameUpdateCallback = null;

export const listenForGameUpdates = (callback) => {
    gameUpdateCallback = callback;
};

export default socket;
