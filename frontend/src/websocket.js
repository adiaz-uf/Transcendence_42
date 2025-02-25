import { io } from "socket.io-client";

// Generate or retrieve a persistent user ID
let userId = localStorage.getItem("userId");
if (!userId) {
    userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("userId", userId);
}

const socket = io("wss://transcendence.local", {
    path: "/socket.io/",
    transports: ["websocket"],
    secure: true,
    reconnection: true,         // Enable auto-reconnect
    reconnectionAttempts: 10,   // Retry 10 times before failing
    reconnectionDelay: 2000,    // Wait 2 seconds between retries
});

export const connectWebSocket = () => {
    socket.on("connect", () => {
        console.log("Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
        console.warn("Disconnected from WebSocket server");
    });
};

export const joinGame = (gameId) => {
    socket.emit("joinGame", gameId);
};

export const sendPlayerMove = (key) => {
    socket.emit("playerMove", { key });
};

export const listenForGameUpdates = (callback) => {
    socket.on("updateGame", (data) => {
        callback(data);
    });
};

export default socket;

