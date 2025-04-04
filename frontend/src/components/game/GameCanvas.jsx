import React, { useRef, useEffect } from "react";

const GameCanvas = ({ gameState }) => {
    const canvasRef = useRef(null);

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

            // Render players
            if (gameState.players) {
                const { left, right } = gameState.players;
                ctx.fillStyle = "white";
                if (left) {
                    ctx.fillRect(left.x, left.y, left.width, left.height);
                }
                if (right) {
                    ctx.fillRect(right.x, right.y, right.width, right.height);
                }
            }

            // Render ball
            if (gameState.ball) {
                const { x, y, radio } = gameState.ball;
                ctx.beginPath();
                ctx.arc(x, y, radio, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(render);
        };

        render();
    }, [gameState]);

    return <canvas ref={canvasRef} width={900} height={700} className="game-canvas" />;
};

export default GameCanvas;