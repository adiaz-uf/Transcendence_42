class WebSocketManager {
  constructor(baseUrl, matchId, gameMode, token) {
    this.baseUrl = baseUrl;
    this.matchId = matchId;
    this.gameMode = gameMode || "remote";
    this.token = token; // Stocker le token
    this.socket = null;
    this.listeners = [];
  }

  connect() {
    // Ajouter le token dans les paramètres de l'URL ou dans les en-têtes
    const wsUrl = `${this.baseUrl}/${this.matchId}/?token=${this.token}`;
    this.socket = new WebSocket(wsUrl);
    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.socket.send(
        JSON.stringify({
          type: "init",
          game_mode: this.gameMode,
        })
      );
    };
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach((listener) => listener(data));
    };
    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
    };
    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
  }

  listenForGameUpdates(callback) {
    this.listeners.push(callback);
  }

  sendPlayerMove(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: "update",
          data,
        })
      );
    }
  }
}

export default WebSocketManager;
