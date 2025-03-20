import React, { useCallback, useEffect, useState} from "react";
import Gameplay from "./Gameplay";
import webSocketClient from "../websocket";

import Menu from "./Menu";

import InvitePlayer from "./InvitePlayerModal";


// Componente Padre, guarda estado de selecion de juego y conexion websocket
const GameApp = () => {
  const [gameMode, setGameMode] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [gameState, setGameState] = useState({
    game_active: false,
    // Estado Jugadores
    jugadores: {
        'izq': {
            'x': 10,
            'y': 150,
            'width': 10,
            'height': 100,
            'speed': 5,
            'score': 0
        },
        'der': {
            'x': 780,
            'y': 150,
            'width': 10,
            'height': 100,
            'speed': 5,
            'score': 0
        }
    },
    // Estado Pelota
    pelota: {
        'x': 400,
        'y': 200,
        'radio': 5,
        'dx': 4,
        'dy': -4
    }
  });

  //Función que setea la funcion a ejecutar cuando se recibe un mensaje del fd cliente
  const StateLinkerGameWebSocket = useCallback((setGameState) => {
    webSocketClient.listenForGameUpdates((gameUpdate) => {
      console.log("Received game update:", gameUpdate);
      setGameState((prevState) => ({
        ...prevState,
        ...gameUpdate,
        jugadores: {
          ...prevState.jugadores,
          ...gameUpdate.jugadores, // Merge jugadores if updated
          izq: {
            ...prevState.jugadores.izq,
            ...(gameUpdate.jugadores?.izq || {}), // Merge izq if updated
          },
          der: {
            ...prevState.jugadores.der,
            ...(gameUpdate.jugadores?.der || {}), // Merge der if updated
          },
        },
        pelota: {
          ...prevState.pelota,
          ...(gameUpdate.pelota || {}), // Merge pelota if updated
        },
      }));
    });
  });

  const InitGame = (mode) => {

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
      // setGameState(prevState => ({
      //   ...prevState,
      //   game_active: true,
      // }));
      webSocketClient.connect()
      StateLinkerGameWebSocket(setGameState)
    }
  };

  const handleCloseModal = () => setShowModal(false);

  return (

    <div className="game-container">
      {gameMode === null ? 
      (<Menu onGameModeSelect={InitGame}/>) :
        <Gameplay gameState={gameState} InitGame={InitGame}/>}
    </div>
  );
};

export default GameApp;