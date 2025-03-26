import React, { useRef, useState, useEffect } from "react";

const Gameplay = ({ gameState, InitGame, matchId, tournamentId, webSocketClient, gameMode }) => {
  const canvasRef = useRef(null);
  const GameFrameRef = useRef(null);
  const PlayerOneFrameRef = useRef(null);
  const SecondPlayerFrameRef = useRef(null);
  const [pressedKeysPlayerOne, setPressedKeysPlayerOne] = useState(null);
  const [pressedKeysSecondPlayer, setPressedKeysSecondPlayer] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);

  // Gestion des touches
  const handleKeyDownPlayers = (e) => {
    console.log("Key down:", e.key);
    if (e.key === "w" || e.key === "s") {
      setPressedKeysPlayerOne(e.key);
    }
    if (gameMode === "local" || (gameMode === "remote" && webSocketClient)) {
      if (e.key === "o" || e.key === "l") {
        setPressedKeysSecondPlayer(e.key);
      }
    }
  };

  const handleKeyUpPlayers = (e) => {
    console.log("Key up:", e.key);
    if (e.key === "w" || e.key === "s") {
      setPressedKeysPlayerOne(null);
    }
    if (gameMode === "local" || (gameMode === "remote" && webSocketClient)) {
      if (e.key === "o" || e.key === "l") {
        setPressedKeysSecondPlayer(null);
      }
    }
  };

  // Envoi des mouvements des joueurs
  const sendPlayerMovesPlayerOne = () => {
    if (pressedKeysPlayerOne && webSocketClient) {
      console.log("Sending move for player 1:", pressedKeysPlayerOne);
      webSocketClient.sendPlayerMove({
        izq: pressedKeysPlayerOne === "w" ? "up" : "down",
      });
    }
    PlayerOneFrameRef.current = requestAnimationFrame(sendPlayerMovesPlayerOne);
  };

  const sendPlayerMovesSecondPlayer = () => {
    if (pressedKeysSecondPlayer && webSocketClient) {
      console.log("Sending move for player 2:", pressedKeysSecondPlayer);
      webSocketClient.sendPlayerMove({
        der: pressedKeysSecondPlayer === "o" ? "up" : "down",
      });
    }
    SecondPlayerFrameRef.current = requestAnimationFrame(sendPlayerMovesSecondPlayer);
  };

  // Gestion des frames pour les mouvements
  useEffect(() => {
    if (pressedKeysPlayerOne) {
      PlayerOneFrameRef.current = requestAnimationFrame(sendPlayerMovesPlayerOne);
    } else {
      cancelAnimationFrame(PlayerOneFrameRef.current);
    }
    return () => {
      cancelAnimationFrame(PlayerOneFrameRef.current);
    };
  }, [pressedKeysPlayerOne, webSocketClient]);

  useEffect(() => {
    if (pressedKeysSecondPlayer) {
      SecondPlayerFrameRef.current = requestAnimationFrame(sendPlayerMovesSecondPlayer);
    } else {
      cancelAnimationFrame(SecondPlayerFrameRef.current);
    }
    return () => {
      cancelAnimationFrame(SecondPlayerFrameRef.current);
    };
  }, [pressedKeysSecondPlayer, webSocketClient]);

  // Initialisation du canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 800;
      canvas.height = 400;
    }

    window.addEventListener("keydown", handleKeyDownPlayers);
    window.addEventListener("keyup", handleKeyUpPlayers);

    return () => {
      window.removeEventListener("keydown", handleKeyDownPlayers);
      window.removeEventListener("keyup", handleKeyUpPlayers);
    };
  }, [webSocketClient, gameMode]);

  // Rendu du jeu
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
      // Board
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
      ctx.setLineDash([]);

      // Vérifier si le jeu est actif
      if (gameMode === "remote" && (!gameState || !gameState.game_active)) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Waiting for second player...", canvas.width / 2, canvas.height / 2);
        GameFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Check if game has ended
      if (gameState && gameState.game_active === false) {
        setGameEnded(true);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText(
          `Final Score: ${gameState.jugadores.izq.score} - ${gameState.jugadores.der.score}`,
          canvas.width / 2,
          canvas.height / 2 + 20
        );
        return;
      }

      // Render players and ball if gameState exists
      if (gameState && gameState.jugadores) {
        console.log("Rendering game state with jugadores:", gameState);

        // Player 1 (left)
        ctx.fillStyle = "white";
        ctx.fillRect(
          gameState.jugadores.izq.x,
          gameState.jugadores.izq.y,
          10,
          100
        );

        // Player 2 (right)
        ctx.fillRect(
          gameState.jugadores.der.x,
          gameState.jugadores.der.y,
          10,
          100
        );

        // Ball
        if (gameState.pelota) {
          ctx.beginPath();
          ctx.arc(gameState.pelota.x, gameState.pelota.y, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Scores
        ctx.font = "24px Arial";
        ctx.fillText(`${gameState.jugadores.izq.score || 0}`, canvas.width / 4, 50);
        ctx.fillText(`${gameState.jugadores.der.score || 0}`, (3 * canvas.width) / 4, 50);
      } else {
        console.log("No jugadores in game state:", gameState);
      }

      GameFrameRef.current = requestAnimationFrame(render);
    };

    GameFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(GameFrameRef.current);
  }, [gameState, gameMode]);

  return (
    <div className="gameplay-container">
      <button onClick={() => InitGame(null)} disabled={gameEnded}>
        Menu
      </button>
      <canvas ref={canvasRef} className="game-canvas" />
      <p>Game State: {gameState ? JSON.stringify(gameState) : "Waiting for game data..."}</p>
      {gameEnded && (
        <div>
          <p>Game has ended! Click "Menu" to return.</p>
        </div>
      )}
    </div>
  );
};

export default Gameplay;
