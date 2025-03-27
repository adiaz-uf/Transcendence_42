import React, { useCallback, useState } from "react";
import Gameplay from "./Gameplay";
import webSocketClient from "../websocket";
import Menu from "./Menu";
import InvitePlayer from "./InvitePlayerModal";
import Login from "../../pages/Login";  // Asegúrate de importar el componente Login

// Componente Padre, guarda estado de selección de juego y conexión websocket
const GameApp = () => {
  const [gameMode, setGameMode] = useState(null);
  const [showModal, setShowModal] = useState(false); // Controla el estado del modal
  const [selectedMode, setSelectedMode] = useState(null); // Guardará el modo seleccionado (local o online)
  const [showLogin, setShowLogin] = useState(false); // Controla la visibilidad del Login
  const [gameState, setGameState] = useState({
    game_active: true,
    jugadores: {
      izq: {
        x: 10,
        y: 150,
        width: 15,
        height: 115,
        speed: 5,
        score: 0
      },
      der: {
        x: 880,
        y: 150,
        width: 15,
        height: 115,
        speed: 5,
        score: 0
      }
    },
    pelota: {
      x: 400,
      y: 200,
      radio: 5,
      dx: 11,
      dy: -11
    }
  });

  const StateLinkerGameWebSocket = useCallback((setGameState) => {
    webSocketClient.listenForGameUpdates((gameUpdate) => {
      console.log("Received game update:", gameUpdate);
      setGameState((prevState) => ({
        ...prevState,
        ...gameUpdate,
        jugadores: {
          ...prevState.jugadores,
          ...gameUpdate.jugadores,
          izq: {
            ...prevState.jugadores.izq,
            ...(gameUpdate.jugadores?.izq || {}),
          },
          der: {
            ...prevState.jugadores.der,
            ...(gameUpdate.jugadores?.der || {}),
          },
        },
        pelota: {
          ...prevState.pelota,
          ...(gameUpdate.pelota || {}),
        },
      }));
    });
  });

  const InitGame = (mode) => {
    setGameMode(mode);
    if (mode === null) {
      webSocketClient.sendMessage({ type: 'game_active', game_active: false });
      webSocketClient.close();
    } else {
      webSocketClient.connect();
      StateLinkerGameWebSocket(setGameState);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false); // Cierra el modal
    InitGame(selectedMode); // Inicia el juego con el modo seleccionado
  };

  const handleGameModeSelect = (mode) => {
    setSelectedMode(mode); // Guarda el modo seleccionado (local o online)
    setShowModal(true); // Muestra el modal
  };

  const handleLoginSuccess = () => {
    setShowLogin(false); // Oculta el login después de un inicio de sesión exitoso
    InitGame(selectedMode); // Inicia el juego después del login
  };

  return (
    <div className="game-container">
      {gameMode === null ? (
        <Menu onGameModeSelect={handleGameModeSelect} />
      ) : (
        <Gameplay gameState={gameState} InitGame={InitGame} />
      )}

      {/* Componente InvitePlayer */}
      <InvitePlayer 
        showModal={showModal} 
        handleCloseModal={handleCloseModal}
        gameMode={selectedMode} // Pasa el modo de juego al modal
        setShowLogin={setShowLogin} // Pasa la función para mostrar el login
      />

      {/* Mostrar el componente Login solo si showLogin es true */}
      {showLogin && <Login route="/api/login" onLoginSuccess={handleLoginSuccess} />} 
    </div>
  );
};

export default GameApp;

