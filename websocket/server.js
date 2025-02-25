const { Server } = require("socket.io");
const io = new Server(5000, { cors: { origin: "*" } });

let users = {}; // Store active users

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on("registerUser", (userId) => {
        users[userId] = socket.id;
        console.log(`User registered: ${userId} -> Socket ID: ${socket.id}`);
    });

    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        const userId = Object.keys(users).find(key => users[key] === socket.id);
        if (userId) {
            delete users[userId];
            console.log(`User ${userId} removed from active list`);
        }
    });

	socket.on("error", (error) => {
		console.error("WebSocket error:", error);
	});
});

console.log("WebSocket server running on port 5000");
