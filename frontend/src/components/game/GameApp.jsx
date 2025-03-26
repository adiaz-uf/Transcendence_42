import React, { useCallback, useEffect, useState} from "react";
import Gameplay from "./Gameplay";
import webSocketClient from "./websocket";
import api from "../../api";
import Menu from "./Menu";
import InvitePlayer from "./InvitePlayerModal";

const createLocalMatch = async () => {
  const token = localStorage.getItem("access_token");
  try {
      const response = await api.post(
          "/matches/local/",
          { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data)
      return response.data;
  } catch (error) {
      console.error("Match creation failed:", error);
  }
};

// Componente Padre, guarda estado de selecion de juego y conexion websocket
const GameApp = () => {
  const [gameMode, setGameMode] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [gameState, setGameState] = useState({
    game_active: true,
    // Estado players
    players: {
        'left': {
            'x': 10,
            'y': 150,
            'width': 15,
            'height': 115,
            'speed': 5,
            'score': 0
        },
        'right': {
            'x': 880,
            'y': 150,
            'width': 15,
            'height': 115,
            'speed': 5,
            'score': 0
        }
    },
    // Estado ball
    ball: {
        'x': 400,
        'y': 200,
        'radio': 5,
        'rx': 11,
        'ry': -11
    }
  });

  //Función que setea la funcion a ejecutar cuando se recibe un mensaje del fd cliente
  const StateLinkerGameWebSocket = useCallback((setGameState) => {
    webSocketClient.listenForGameUpdates((gameUpdate) => {
      console.log("Received game update:", gameUpdate);
      setGameState((prevState) => ({
        ...prevState,
        ...gameUpdate,
        players: {
          ...prevState.players,
          ...gameUpdate.players, // Merge players if updated
          left: {
            ...prevState.players.left,
            ...(gameUpdate.players?.left || {}), // Merge left if updated
          },
          right: {
            ...prevState.players.right,
            ...(gameUpdate.players?.right || {}), // Merge right if updated
          },
        },
        ball: {
          ...prevState.ball,
          ...(gameUpdate.ball || {}), // Merge ball if updated
        },
      }));
    });
  });

  const InitGame = async(mode) => {

    setGameMode(mode);
    if (mode === null)
    {
      // setGameState(prevState => ({
      //   ...prevState,
      //   game_active: false,
      // }));
      webSocketClient.sendMessage({'type':'game_active', 'game_active':false})
      webSocketClient.close()
    } else {

    //   await createLocalMatch()
      webSocketClient.connect()
      StateLinkerGameWebSocket(setGameState)
    }
  };

  return (
    <div className="game-container">
      {gameMode === null ? 
      (<Menu onGameModeSelect={InitGame}/>) :
        <Gameplay gameState={gameState} InitGame={InitGame}/>}
    </div>
  );
};

export default GameApp;