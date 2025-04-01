import React, { useCallback, useState } from "react";
import Gameplay from "./Gameplay";
import webSocketClient from "./ClientWebSocket";
import api from "../../api";
import Menu from "./Menu";
import InvitePlayer from "./InvitePlayerModal";
import Login from "../../pages/Login";  // Asegúrate de importar el componente Login
import { ACCESS_TOKEN } from "../../constants";
import MessageBox from '../MessageBox';
import GameBoard from "../GamesBoard";

// Parent component that holds game mode selection and WebSocket connection state
const GameApp = () => {
  const [gameMode, setGameMode] = useState(null); // Guardará el modo seleccionado (local o online)
  const [MatchId, setMatchId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("")
  const [showModal, setShowModal] = useState(false); // Controla el estado del modal
  const [showLogin, setShowLogin] = useState(false); // Controla la visibilidad del Login
  const [showBoard, setShowBoard] = useState(false); // Controls the visibility of the Board
  const [gameState, setGameState] = useState({
    
    game_active: true,
    // Players state
    players: {
      'left': { 'x': 10, 'y': 150, 'width': 15, 'height': 115, 'speed': 5, 'score': 0 },
      'right': { 'x': 880, 'y': 150, 'width': 15, 'height': 115, 'speed': 5, 'score': 0 }
    },
    // Ball state
    ball: { 'x': 400, 'y': 200, 'radio': 5, 'rx': 11, 'ry': -11 }
  });

  // WebSocket update listener
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
          ...prevState.pelota,
          ...(gameUpdate.pelota || {}), // Merge pelota if updated
        },
        pelota: { ...prevState.pelota, ...(gameUpdate.pelota || {}) } // Merge pelota if updated
      }));
    });
  });

  // Initialize game based on mode
  const InitGame = (mode) => {
    setGameMode(mode);
    if (mode === null) {
      webSocketClient.sendMessage({ type: 'game_active', game_active: false });
      webSocketClient.close();
    } else {
      webSocketClient.connect(MatchId);
      StateLinkerGameWebSocket(setGameState);
    }
  };

  // Close modal and start the game
  const handleCloseModal = () => {
    setShowModal(false);
    InitGame(selectedMode); // Start the game with the selected mode
  };

  const handleCloseBoard = () => {
    setShowBoard(false);
    InitGame(selectedMode); // Start the game with the selected mode
  };


  // Handle game mode selection
  const handleGameModeSelect = (mode) => {
    if (mode === "local")
    {
      setSelectedMode(mode); 
      api.post("matches/", { 
        player_left: localStorage.getItem('userId'),
        is_multiplayer:false}, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }}).then(response => {
          setMatchId(response.Match.id)
          }).catch(error => {
        setMessage(`Error with new Match`);
        setMessageType("error");
        });
      setShowModal(true); 
    }
    else if (mode === "online-create") {
      setShowModal(true);
      api.post("matches/", { 
        player_left: localStorage.getItem('userId'),
        is_multiplayer:true}, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }}).then(response => {
          setMatchId(response.Match.id)
          }).catch(error => {
        setMessage(`Error with new Match`);
        setMessageType("error");
        });
      setSelectedMode(mode);
    }
    else if (mode === "online-join") {
      setShowBoard(true);
      setSelectedMode(mode);
    }
  };

  return (<div className="game-container">
      {gameMode === null ? (
        <Menu onGameModeSelect={handleGameModeSelect} />
      ) : (
        <Gameplay gameState={gameState} InitGame={InitGame} />
      )}
      {message && (
        <MessageBox 
          message={message}
          type={messageType}
          onClose={() => setMessage(null)}
        />
        )}

      {/* Componente InvitePlayer */}
      <InvitePlayer 
        showModal={showModal} 
        handleCloseModal={handleCloseModal}
        gameMode={selectedMode}
      />
      <GameBoard 
        showBoard={showBoard}
        handleCloseBoard={handleCloseBoard}
      />
    </div>
  );
};

export default GameApp;
