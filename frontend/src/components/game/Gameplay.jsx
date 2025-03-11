import React, { useRef, useEffect } from "react";

const Gameplay = ({ 
  gameState, 
  setGameState, 
  gameMode, 
  returnToMenu 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 400;

    const drawGame = () => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center line
      ctx.strokeStyle = "white";
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      // Draw paddles
      ctx.fillStyle = "white";
      ctx.fillRect(
        gameState.paddleLeft.x, 
        gameState.paddleLeft.y, 
        10, 
        100
      );
      ctx.fillRect(
        gameState.paddleRight.x, 
        gameState.paddleRight.y, 
        10, 
        100
      );

      // Draw ball
      ctx.beginPath();
      ctx.arc(
        gameState.ball.x, 
        gameState.ball.y, 
        5, 
        0, 
        Math.PI * 2
      );
      ctx.fill();

      // Draw scores
      ctx.font = '24px Arial';
      ctx.fillText(
        `${gameState.score1}`, 
        canvas.width / 4, 
        50
      );
      ctx.fillText(
        `${gameState.score2}`, 
        3 * canvas.width / 4, 
        50
      );
    };

    drawGame();
  }, [gameState]);

  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     switch(e.key) {
  //       case 'w': 
  //         handlePlayerMove('up_left');
  //         break;
  //       case 's': 
  //         handlePlayerMove('down_left');
  //         break;
  //       case 'ArrowUp': 
  //         handlePlayerMove('up_right');
  //         break;
  //       case 'ArrowDown': 
  //         handlePlayerMove('down_right');
  //         break;
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // }, []);
  return (
    <div className="gameplay-container">
      <div className="game-header">
        <button onClick={returnToMenu}>Back to Menu</button>
        <span>Game Mode: {gameMode}</span>
      </div>
      <canvas 
        ref={canvasRef} 
        className="game-canvas"
      />
    </div>
  );
};

export default Gameplay;
