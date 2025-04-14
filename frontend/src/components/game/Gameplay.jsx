import React, { useCallback, useRef, useState, useEffect} from "react";
import { useGameSetting } from "../contexts/GameContext";
import {useNavigate} from "react-router-dom";
import { useWebSocket } from "../contexts/ClientWSContext";
import  GameCanvas from "./GameCanvas";

const Gameplay = () => {
  const {matchId, setGameMode} = useGameSetting();
  const { gameState, ClientWS} = useWebSocket();
  const navigate = useNavigate();
  const [IsGameActive, setIsGameActive] = useState(false);
  
  // html ref for canvas
  const PlayerOneFrameRef = useRef(null);
  const SecondPlayerFrameRef = useRef(null);
  
  
  // Key stroke for each player
  const [pressedKeysPlayerOne, setPressedKeysPlayerOne] = useState(null);
  const [pressedKeysSecondPlayer, setPressedKeysSecondPlayer] = useState(null);

  const PlayOrStopGame = () => {
    if (!ClientWS){
      return
    }
    if (IsGameActive){
      ClientWS.sendStopGame();
    }
    else{
      ClientWS.sendPlayGame();
    }
    setIsGameActive(!IsGameActive);
  }
  
  useEffect(() => {
    if (!ClientWS) {
    } else {
    }
  }, [ClientWS]);

  const handleReturnToMenu = () => {
    ClientWS.sendStopGame();
    
    setGameMode(null);
    navigate("/");
  };
  
  // Key event handlers
  const handleKeyDownPlayers = (e) => {
    if (e.key === "w" || e.key === "s") {
      setPressedKeysPlayerOne(e.key);
    }
    else if (e.key === "ArrowUp" || e.key === "ArrowDown"){
      setPressedKeysSecondPlayer(e.key);
    }
  };
  const handleKeyUpPlayers = (e) => {
    if (e.key === "w" || e.key === "s") {
      setPressedKeysPlayerOne(null);
    }
    else if (e.key === "ArrowUp" || e.key === "ArrowDown"){
      setPressedKeysSecondPlayer(null);}
  };
  // What to do for when key of player one is pressed
  const sendPlayerMovesPlayerOne = useCallback((pressedKeysPlayerOne) => {
    if (pressedKeysPlayerOne) {
      ClientWS.sendPlayerMove(pressedKeysPlayerOne === "w" ? "up" : "down");
    }
    PlayerOneFrameRef.current = requestAnimationFrame(() => sendPlayerMovesPlayerOne(pressedKeysPlayerOne));
  }, [ClientWS]);
  // What to do for when key of player 2 is pressed
  const sendPlayerMovesSecondPlayer = useCallback((pressedKeysSecondPlayer) => {
    if (pressedKeysSecondPlayer) {
      ClientWS.sendPlayerMove(pressedKeysSecondPlayer === "ArrowUp" ? "up" : "down");
    }
    SecondPlayerFrameRef.current = requestAnimationFrame(() => sendPlayerMovesSecondPlayer(pressedKeysSecondPlayer));
  }, [ClientWS]);
  
  // Reload frame when key is pressed and clean when destroyed
  useEffect(() => {
    if (pressedKeysPlayerOne){
      PlayerOneFrameRef.current = requestAnimationFrame(() => sendPlayerMovesPlayerOne(pressedKeysPlayerOne));
    }
    else {
      cancelAnimationFrame(PlayerOneFrameRef.current);
    }
    return () => {
      cancelAnimationFrame(PlayerOneFrameRef.current);
    };
  }, [pressedKeysPlayerOne, sendPlayerMovesPlayerOne] );
  
  useEffect(() => {
    if (pressedKeysSecondPlayer) {
      SecondPlayerFrameRef.current = requestAnimationFrame(() => sendPlayerMovesSecondPlayer(pressedKeysSecondPlayer));
    } else {
      cancelAnimationFrame(SecondPlayerFrameRef.current);
    }
    return () => {
      cancelAnimationFrame(SecondPlayerFrameRef.current);
    };
  }, [pressedKeysSecondPlayer, sendPlayerMovesSecondPlayer]);
  
  // Canvas initialization
  useEffect(() => {    
    // add event function handlers for key presses
    window.addEventListener("keydown", handleKeyDownPlayers);
    window.addEventListener("keyup", handleKeyUpPlayers);

    // Cleanup on unmount or when dependencies change
    return () => {
      window.removeEventListener("keydown", handleKeyDownPlayers);
      window.removeEventListener("keyup", handleKeyUpPlayers);
    };
  }, []);
  
  return (
    <div className="gameplay-container">
      <div className="game-return">
        <button onClick={handleReturnToMenu}>
          Return to Menu
        </button>
        <button onClick={PlayOrStopGame}>
          {IsGameActive? "End":"Start"}
          </button>
      </div>
      <GameCanvas gameState={gameState} />
    </div>
  );
};

export default Gameplay;
  //   useEffect(() => {
    //     // Escucha de eventos de WebSocket para goles
    //     webSocketClient.socket.onmessage = (event) => {
      //       const data = JSON.parse(event.data);
      
      //       // Cuando se recibe el mensaje de un gol
      //       if (data.type === "goal") {
        //         const updatedGameState = { ...gameState };
        //         updatedGameState.players.left.score = data.left_score;  // Actualiza puntaje de la leftuierda
        //         updatedGameState.players.right.score = data.der_score;  // Actualiza puntaje de la derecha
        //         InitGame(updatedGameState);  // Actualiza el estado del juego
        //       }
        //     };
        
        //     return () => {
          //       // Cleanup cuando el componente se desmonte
          //       if (webSocketClient.socket) {
            //         webSocketClient.socket.onmessage = null;
            //       }
            //     };
            //   }, [gameState, InitGame]);
            
            // Handle game drawing