import React, { useRef, useState, useEffect } from "react";
import webSocketClient from "../websocket";


// setGameState((prevState) => ({
//   ...prevState,
//   ...gameUpdate,
//   jugadores: {
//     ...prevState.jugadores,
//     ...gameUpdate.jugadores, // Merge jugadores if updated
//     izq: {
//       ...prevState.jugadores.izq,
//       ...(gameUpdate.jugadores?.izq || {}), // Merge izq if updated
//     },
//     der: {
//       ...prevState.jugadores.der,
//       ...(gameUpdate.jugadores?.der || {}), // Merge der if updated
//     },
//   },
//   pelota: {
//     ...prevState.pelota,
//     ...(gameUpdate.pelota || {}), // Merge pelota if updated
//   },
// }));

const PlayOrStopBtn = (InitGame) => {

  const handleClick = () => {
    if (webSocketClient.socket?.readyState === WebSocket.OPEN) {
      InitGame(null)
    } else {
      InitGame("local")
    }
  };

  return (
    <button onClick={handleClick}>
      {webSocketClient.socket?.readyState === WebSocket.OPEN ? "Stop" : "Play"}
    </button>
  );
};

const Gameplay = ({ gameState, InitGame }) => {
  // html ref for canvas
  const canvasRef = useRef(null);
  const GameFrameRef = useRef(null);

  // Key stroke for each player
  const [pressedKeysPlayerOne, setPressedKeysPlayerOne] = useState(null);
  const [pressedKeysSecondPlayer, setPressedKeysSecondPlayer] = useState(null);

    // Key event handlers
  const handleKeyDownPlayerOne = (e) => {
    if (e.key === "w" || e.key === "s") {
      setPressedKeysPlayerOne(e.key);
    }
  };

  const handleKeyDownSecondPlayer = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      setPressedKeysSecondPlayer(e.key);
    }
  };

  const handleKeyUpPlayerOne = (e) => {
    if (e.key === "w" || e.key === "s") {
      setPressedKeysPlayerOne(null);
    }
  };

  const handleKeyUpSecondPlayer = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      setPressedKeysSecondPlayer(null);
    }
  };

  const sendPlayerMovesPlayerOne = () => {
    if (pressedKeysPlayerOne) {
      webSocketClient.sendPlayerMove({ izq: pressedKeysPlayerOne === "w" ? "up" : "down" });
    }
  };

  const sendPlayerMovesSecondPlayer = () => {
    if (pressedKeysSecondPlayer) {
      webSocketClient.sendPlayerMove({ der: pressedKeysSecondPlayer === "ArrowUp" ? "up" : "down" });
    }
  };

  useEffect( () =>{
    sendPlayerMovesSecondPlayer()

  }, [pressedKeysSecondPlayer]); 

  useEffect( () =>{

    sendPlayerMovesPlayerOne()
  }, [pressedKeysPlayerOne]); 

  // Send movement to the server
  // const KeyLoop = () => {
  //   if (pressedKeysPlayerOne) {
  //     webSocketClient.sendPlayerMove({ izq: pressedKeysPlayerOne === "w" ? "up" : "down" });
  //   }
  //   if (pressedKeysSecondPlayer) {
  //     webSocketClient.sendPlayerMove({ der: pressedKeysSecondPlayer === "ArrowUp" ? "up" : "down" });
  //   }
  //   PlayerFrameRef.current = requestAnimationFrame(KeyLoop);
  // };


  // Canvas initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 800;
      canvas.height = 400;
    }

    window.addEventListener("keydown", handleKeyDownPlayerOne);
    window.addEventListener("keydown", handleKeyDownSecondPlayer);
    window.addEventListener("keyup", handleKeyUpPlayerOne);
    window.addEventListener("keyup", handleKeyUpSecondPlayer);

    //PlayerFrameRef.current = requestAnimationFrame(KeyLoop);
    // Cleanup on unmount or when dependencies change
    return () => {
      window.removeEventListener("keydown", handleKeyDownPlayerOne);
      window.removeEventListener("keydown", handleKeyDownSecondPlayer);
      window.removeEventListener("keyup", handleKeyUpPlayerOne);
      window.removeEventListener("keyup", handleKeyUpSecondPlayer);
    };
  }, []);
  
  // Handle game drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center line
      ctx.strokeStyle = "white";
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      // Only render if gameState exists
      if (gameState && gameState.jugadores && gameState.pelota) {
        // Draw paddles and ball
        ctx.fillStyle = "white";
        ctx.fillRect(gameState.jugadores.izq.x, gameState.jugadores.izq.y, 10, 100);
        ctx.fillRect(gameState.jugadores.der.x, gameState.jugadores.der.y, 10, 100);

        ctx.beginPath();
        ctx.arc(gameState.pelota.x, gameState.pelota.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw scores
        ctx.font = "24px Arial";
        ctx.fillText(`${gameState.jugadores.izq.score || 0}`, canvas.width / 4, 50);
        ctx.fillText(`${gameState.jugadores.der.score || 0}`, (3 * canvas.width) / 4, 50);
      }

    };

    GameFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(GameFrameRef.current);
  }, [gameState]);

  // <PlayOrStopBtn/>
  //<button onClick={() => {setGameMode(null)}}>Return to menu </button>
  return (
    <div className="gameplay-container">
      <div className="game-header">
        <PlayOrStopBtn InitGame={InitGame}/>
      </div>
      <canvas ref={canvasRef} className="game-canvas" />
      <p>Game State: {gameState ? JSON.stringify(gameState) : "Waiting for game data..."}</p>
    </div>
  );
};

export default Gameplay;

\