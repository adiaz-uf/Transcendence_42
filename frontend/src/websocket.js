let userId = localStorage.getItem("userId");
if (!userId) {
    userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("userId", userId);
}

const socket = new WebSocket(`wss://${window.location.hostname}/socket.io/`);

socket.addEventListener("open", () => {
    console.log("Connected to WebSocket server");
});

socket.addEventListener("close", (event) => {
    console.warn(`Disconnected from WebSocket server: ${event.reason}`);
});

socket.addEventListener("error", (error) => {
    console.error("WebSocket Error:", error);
});

export const joinGame = (gameId) => {
    const message = JSON.stringify({ action: "joinGame", gameId });
    socket.send(message);
};

export const sendPlayerMove = (key) => {
    const message = JSON.stringify({ action: "playerMove", key });
    socket.send(message);
};

export const listenForGameUpdates = (callback) => {
    socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        callback(data);
    });
};

export default socket;
