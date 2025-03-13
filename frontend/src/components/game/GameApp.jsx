import React, { useState} from "react";
import Menu from "./Menu";

import { joinGame, sendPlayerMove, listenForGameUpdates } from '../../websocket';
import Gameplay from "./Gameplay";
import InvitePlayer from "./InvitePlayerModal";

// Función que setea la funcion a ejecutar cuando se recibe un mensaje del fd cliente
export const StateLinkerGameWebSocket = (setGameState) => {
  listenForGameUpdates((gameUpdate) => { // gameUpdate es la estructura que envia el servidor y que estamos recibiendo
    setGameState(prevState => ({
      ...prevState, // permite hacer un ´merge´ de los cambios
      ...gameUpdate
    }));
  });
};

export const startGame = (gameMode) => {
  joinGame(gameMode); 
};

export const handlePlayerMove = (key) => {
  sendPlayerMove(key);
};


// Componente Padre, guarda estado de selecion de juego y conexion websocket
const GameApp = () => {
  const [gameMode, setGameMode] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [gameState, setGameState] = useState({
    gameRunning: false,
    gameMode: 0,
    score1: 0,
    score2: 0,
    paddleLeft: { x: 10, y: 150 },
    paddleRight: { x: 780, y: 150 },
    ball: { x: 400, y: 200, dx: 0, dy: 0 }
  });

  // Función que se ejecutara el comp hijo ´Menu´ y hara lanzar una partida y cambiar la UI
  const handleGameModeSelect = (mode) => {
    setShowModal(true);
    setGameMode(mode);
    startGame(mode);
    StateLinkerGameWebSocket(setGameState);
  };
  const returnToMenu = () => {
    setGameMode(null);
  };

  const handleCloseModal = () => setShowModal(false);

  return (

    <div className="game-container">
      <InvitePlayer
        showModal={showModal} 
        handleCloseModal={() => setShowModal(false)} 
      />
      {gameMode === null ? (
        <div> 
          <Menu onGameModeSelect={handleGameModeSelect} />
        </div>
      ) : (
        <Gameplay 
          gameState={gameState} 
          setGameState={setGameState}
          gameMode={gameMode}
          returnToMenu={returnToMenu}
        />
      )}
    </div>
  );
};

export default GameApp;