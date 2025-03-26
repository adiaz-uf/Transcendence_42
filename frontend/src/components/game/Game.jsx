import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Gameplay from "./Gameplay";
import WebSocketManager from "../websocket";

const Game = () => {
  const { tournamentId, matchId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [webSocketClient, setWebSocketClient] = useState(null);
  const [gameMode, setGameMode] = useState("remote"); // Par défaut : remote

  useEffect(() => {
    // Récupérer le mode de jeu depuis le localStorage ou un autre mécanisme si nécessaire
    const storedGameMode = localStorage.getItem("gameMode") || "remote";
    setGameMode(storedGameMode);

    const wsClient = new WebSocketManager(
      `wss://${window.location.host}/ws/game`,
      matchId,
      storedGameMode // Passer le mode de jeu
    );
    setWebSocketClient(wsClient);
    wsClient.connect();
    wsClient.listenForGameUpdates((data) => {
      console.log("Received game state in Game:", data);
      if (data.game_state) {
        setGameState(data.game_state);
      } else {
        setGameState(data);
      }
    });

    return () => {
      wsClient.close();
      setWebSocketClient(null);
    };
  }, [matchId]);

  const InitGame = (state) => {
    setGameState(state);
    if (webSocketClient) {
      webSocketClient.close();
      setWebSocketClient(null);
    }
    navigate("/");
  };

  return (
    <Gameplay
      gameState={gameState}
      InitGame={InitGame}
      tournamentId={parseInt(tournamentId)}
      matchId={parseInt(matchId)}
      webSocketClient={webSocketClient}
      gameMode={gameMode} // Passer le mode de jeu
    />
  );
};

export default Game;
