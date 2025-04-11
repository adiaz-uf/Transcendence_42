import React, { useState, useEffect, useRef }   from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ClientWebSocket from './ClientWebSocket';
import GameOverModal from '../GameOverModal';
import { useGameSetting } from '../contexts/GameContext';
import { PATCHMatchScore } from '../api-consumer/fetch';
import MessageBox from '../MessageBox';


const LocalGame = () => {
    console.log("LocalGame component rendered");
    const navigate = useNavigate();
    const location = useLocation();
    const [gameStartTime, setGameStartTime] = useState(Math.floor(Date.now() / 1000));
   
    const [message, setMessage] = useState(location.state?.message || null);
    const [messageType, setMessageType] = useState(location.state?.type || 'info');
    const [pressedKeys, setPressedKeys] = useState(new Set());
    const canvasRef = useRef(null);
    const wsRef = useRef(null);
    const animationFrameRef = useRef(null);

     /* const [playerNames, setPlayerNames] = useState({
        left: localStorage.getItem('username') || 'Guest',
        right: opponentUsername || 'Opponent'
        }); */
    const { opponentUsername, matchId, gameSettings, gameType, gameMode, getUsernameById } = useGameSetting();
    const [showself, setShowSelf] = useState(true);
    
    const resolvePlayerNames = () => {
        if (gameType === "tournament" && player1 && player2) 
        {
            return {left: getUsernameById(player1), right: getUsernameById(player2) };
        }
        return { left: localStorage.getItem('username'), right: "Guest" };
    };
    const [playerNames, setPlayerNames] = useState(resolvePlayerNames());
    const [toggleGameOverModal, setToggleGameOverModal] = useState(false);

    // Add connection state tracking
    const [isConnected, setIsConnected] = useState(false);
    const [gameState, setGameState] = useState({
        players: {
            left: {
                x: gameSettings.PADDLE_MARGIN,
                y: gameSettings.CANVAS_HEIGHT / 2 - gameSettings.PADDLE_HEIGHT / 2,
                width: gameSettings.PADDLE_WIDTH,
                height: gameSettings.PADDLE_HEIGHT,
                score: 0
            },
            right: {
                x: gameSettings.CANVAS_WIDTH - gameSettings.PADDLE_MARGIN - gameSettings.PADDLE_WIDTH,
                y: gameSettings.CANVAS_HEIGHT / 2 - gameSettings.PADDLE_HEIGHT / 2,
                width: gameSettings.PADDLE_WIDTH,
                height: gameSettings.PADDLE_HEIGHT,
                score: 0
            }
        },
        ball: {
            x: gameSettings.CANVAS_WIDTH / 2,
            y: gameSettings.CANVAS_HEIGHT / 2,
            radio: gameSettings.BALL_RADIUS,
            rx: gameSettings.INITIAL_BALL_SPEED,
            ry: gameSettings.INITIAL_BALL_SPEED
        },
        isPlaying: false,
        gameOver: false,
        winner: null,
        connectionError: null
    });

    

    // Initialize WebSocket connection
    useEffect(() => {
        try {
            wsRef.current = new ClientWebSocket();
            
            // Add connection status handler
            wsRef.current.onConnectionStateChange = (state) => {
                console.log('WebSocket connection state:', state);
                setIsConnected(state === 'connected');
                
                // Send initial game state request when connected
                if (state === 'connected') {
                    wsRef.current.sendMessage({ type: 'get_game_state' });
                }
            };

            wsRef.current.listenForGameUpdates((data) => {
                if (data.type === 'error') {
                    console.error('Received error:', data.message);
                    setGameState(prevState => ({
                        ...prevState,
                        connectionError: data.message
                    }));
                    return;
                }

                if (data.type === 'game_update') {
                    console.log('Processing game update:', data);
                    
                    // Ensure we have all required properties
                    if (!data.players || !data.ball) {
                        console.error("Missing required game state properties:", data);
                        return;
                    }

                    setGameState(prevState => {
                        // Keep x positions from initial state
                        const leftX = gameSettings.PADDLE_MARGIN;
                        const rightX = gameSettings.CANVAS_WIDTH - gameSettings.PADDLE_MARGIN - gameSettings.PADDLE_WIDTH;
                        
                        const newState = {
                            ...prevState,
                            players: {
                                left: {
                                    ...prevState.players.left,
                                    ...data.players.left,
                                    x: leftX,
                                    width: gameSettings.PADDLE_WIDTH,
                                    height: gameSettings.PADDLE_HEIGHT
                                },
                                right: {
                                    ...prevState.players.right,
                                    ...data.players.right,
                                    x: rightX,
                                    width: gameSettings.PADDLE_WIDTH,
                                    height: gameSettings.PADDLE_HEIGHT
                                }
                            },
                            ball: {
                                x: data.ball.x || prevState.ball.x,
                                y: data.ball.y || prevState.ball.y,
                                radio: gameSettings.BALL_RADIUS,
                                rx: data.ball.rx || 0,
                                ry: data.ball.ry || 0
                            },
                            isPlaying: data.active || false,
                            connectionError: null
                        };
                        
                        console.log('New game state:', newState);
                        
                        // Log changes in ball position and velocity
                        if (newState.ball.x !== prevState.ball.x || newState.ball.y !== prevState.ball.y) {
                            console.log('Ball moved:', {
                                from: { x: prevState.ball.x, y: prevState.ball.y },
                                to: { x: newState.ball.x, y: newState.ball.y }
                            });
                        }
                        
                        return newState;
                    });

                    // Check for game over
                    if (data.players.left.score >= gameSettings.WINNING_SCORE || data.players.right.score >= gameSettings.WINNING_SCORE) {
                        setGameState(prev => ({
                            ...prev,
                            gameOver: true,
                            winner: data.players.left.score >= gameSettings.WINNING_SCORE ? 'left' : 'right',
                            isPlaying: false
                        }));
                        setToggleGameOverModal(true);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            setGameState(prevState => ({
                ...prevState,
                connectionError: 'Failed to connect to game server'
            }));
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const handleKeyDown = (e) => {
        setPressedKeys(prev => new Set([...prev, e.key]));
    };

    const handleKeyUp = (e) => {
        setPressedKeys(prev => {
            const newKeys = new Set(prev);
            newKeys.delete(e.key);
            return newKeys;
        });
    };

    // Send player movements to server
    useEffect(() => {
        if (gameState.isPlaying && !gameState.gameOver) {
            // Left paddle (W/S keys)
            if (pressedKeys.has('w')) {
                wsRef.current.sendPlayerMove('left', 'up');
            }
            if (pressedKeys.has('s')) {
                wsRef.current.sendPlayerMove('left', 'down');
            }

            // Right paddle (Arrow keys)
            if (pressedKeys.has('o')) {
                wsRef.current.sendPlayerMove('right', 'up');
            }
            if (pressedKeys.has('k')) {
                wsRef.current.sendPlayerMove('right', 'down');
            }
        }
    }, [pressedKeys, gameState.isPlaying, gameState.gameOver]);

    const toggleGame = async () => {
        try {
            console.log("Toggling game. Current state:", gameState);  // Debug log
            if (gameState.gameOver) {
                console.log("Resetting game after game over");  // Debug log
                await wsRef.current.sendMessage({
                    type: 'reset_game'
                });
                setGameState(prev => ({
                    ...prev,
                    gameOver: false,
                    winner: null,
                    isPlaying: true,
                    connectionError: null
                }));
            } else {
                const newIsPlaying = !gameState.isPlaying;
                console.log("Setting game active state to:", newIsPlaying);  // Debug log
                if (newIsPlaying) {
                    await wsRef.current.sendPlayGame();
                } else {
                    await wsRef.current.sendStopGame();
                }
                setGameState(prev => ({
                    ...prev,
                    isPlaying: newIsPlaying,
                    connectionError: null
                }));
            }
        } catch (error) {
            console.error('Failed to toggle game:', error);
            setGameState(prev => ({
                ...prev,
                connectionError: 'Failed to communicate with game server'
            }));
        }
    };

    const handleCloseModal = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        if (gameType === 'tournament'){
            OnWinnerSelect(gameState.winner);
        }
        setToggleGameOverModal(false);
        setShowSelf(false);
        if (gameType === 'match'){
            handleReturnToMenu();
        }
    };

    const handleReturnToMenu = () => {
        navigate('/');
    };

    const OnWinnerSelect = (winner) => {
        // This function would be implemented to handle tournament winner selection
        console.log("Winner selected:", winner);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Add frame counter for debugging
    const frameCounter = useRef(0);
    const lastUpdateTime = useRef(Date.now());

    // Modify the animation frame handler to track frames and ensure smooth updates
    useEffect(() => {
        let animationFrameId;
        
        const render = () => {
            if (wsRef.current && gameState.isPlaying && !gameState.gameOver) {
                frameCounter.current++;
                const currentTime = Date.now();
                
                // Log every second
                if (currentTime - lastUpdateTime.current >= 1000) {
                    console.log('FPS:', frameCounter.current);
                    console.log('Game State:', {
                        ball: {
                            x: Math.round(gameState.ball.x),
                            y: Math.round(gameState.ball.y),
                            rx: Math.round(gameState.ball.rx),
                            ry: Math.round(gameState.ball.ry)
                        },
                        leftPaddle: Math.round(gameState.players.left.y),
                        rightPaddle: Math.round(gameState.players.right.y),
                        isPlaying: gameState.isPlaying
                    });
                    frameCounter.current = 0;
                    lastUpdateTime.current = currentTime;
                }
                
                // Handle continuous paddle movement
                if (pressedKeys.size > 0) {
                    if (pressedKeys.has('w')) {
                        wsRef.current.sendPlayerMove('left', 'up');
                    }
                    if (pressedKeys.has('s')) {
                        wsRef.current.sendPlayerMove('left', 'down');
                    }
                    if (pressedKeys.has('o')) {
                        wsRef.current.sendPlayerMove('right', 'up');
                    }
                    if (pressedKeys.has('k')) {
                        wsRef.current.sendPlayerMove('right', 'down');
                    }
                }
            }
            animationFrameId = window.requestAnimationFrame(render);
        };
        
        if (gameState.isPlaying && !gameState.gameOver) {
            animationFrameId = window.requestAnimationFrame(render);
        }
        
        return () => {
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, [gameState.isPlaying, gameState.gameOver, pressedKeys, gameState.ball, gameState.players]);

    // Update canvas rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, gameSettings.CANVAS_WIDTH, gameSettings.CANVAS_HEIGHT);
        
        // Draw center line
        ctx.strokeStyle = 'white';
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(gameSettings.CANVAS_WIDTH / 2, 0);
        ctx.lineTo(gameSettings.CANVAS_WIDTH / 2, gameSettings.CANVAS_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw scores
        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.players.left.score.toString(), gameSettings.CANVAS_WIDTH / 4, 50);
        ctx.fillText(gameState.players.right.score.toString(), (gameSettings.CANVAS_WIDTH * 3) / 4, 50);
        
        // Draw paddles
        ctx.fillStyle = 'white';
        // Left paddle
        ctx.fillRect(
            gameState.players.left.x,
            gameState.players.left.y,
            gameSettings.PADDLE_WIDTH,
            gameSettings.PADDLE_HEIGHT
        );
        // Right paddle
        ctx.fillRect(
            gameState.players.right.x,
            gameState.players.right.y,
            gameSettings.PADDLE_WIDTH,
            gameSettings.PADDLE_HEIGHT
        );

        // Draw ball
        if (gameState.ball) {
            ctx.beginPath();
            ctx.arc(
                gameState.ball.x,
                gameState.ball.y,
                gameState.ball.radio,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.closePath();
        }
        
        // Draw game over message
        if (gameState.gameOver) {
            ctx.font = '60px Arial';
            ctx.fillStyle = 'white';
            const winner = gameState.winner === 'left' ? 'Left' : 'Right';
            ctx.textAlign = 'center';
            ctx.fillText(`${winner} Player Wins!`, gameSettings.CANVAS_WIDTH / 2, gameSettings.CANVAS_HEIGHT / 2 - 30);
        }
    }, [gameState]);

    // Remove the duplicate WebSocket message handler
    // The one we added earlier is redundant and might cause issues
    useEffect(() => {
        if (!wsRef.current) return;
        return () => {
            if (wsRef.current) {
                wsRef.current.listenForGameUpdates(null);
            }
        };
    }, []);
    
    
    // Add effect to update player names when needed
    useEffect(() => {
        setPlayerNames({
            left: localStorage.getItem('username') || 'Guest',
            right: opponentUsername || 'Opponent'
            });
            }, [opponentUsername]);
            
            // Initialize gameStartTime when the game starts playing
            useEffect(() => {
                if (gameState.isPlaying && !gameStartTime) {
                    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
                    console.log("🕒 Game started at:", new Date(currentTime * 1000).toISOString());
                    setGameStartTime(currentTime);
                    }
                    }, [gameState.isPlaying, gameStartTime]);
                    
                    // Add a standalone function to update match scores when a game ends
                    const updateMatchScore = () => {
                        console.log("🔄 updateMatchScore called with matchId:", matchId);
        
                        const currentTime = Date.now();
                        const gameStartTimeMs = gameStartTime * 1000; // Convert gameStartTime from seconds to milliseconds
                        const durationMs = currentTime - gameStartTimeMs;
                        
                        // Convert milliseconds to a duration string in the format MM:SS.MS
                        const totalSeconds = Math.floor(durationMs / 1000);
                        const minutes = Math.floor(totalSeconds / 60);
                        const seconds = totalSeconds % 60;
                        const milliseconds = Math.floor((durationMs % 1000) / 10); // Get centiseconds (1/100 of a second)
                        
                        const formattedDuration = 
                        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        
        console.log("📊 Updating match scores:", {
            matchId,
            left_score: gameState.players.left.score,
            right_score: gameState.players.right.score,
            duration: durationMs,
            formattedDuration: formattedDuration
            });
            
            // Call PATCHMatchScore to update the match in the database
            PATCHMatchScore(
                matchId,
                gameState.players.right.score, // right_score
                gameState.players.left.score,  // left_score
                formattedDuration            // match_duration
                ).then(response => {
                    console.log("✅ Match score updated successfully:", response);
                    }).catch(error => {
                        console.error("❌ Error updating match score:", error);
                        });
                        };
                        
                        // Call updateMatchScore when the game ends
                        useEffect(() => {
        if (gameState.gameOver && matchId) {
            console.log("🏁 Game over detected - calling updateMatchScore");
            updateMatchScore();
            }
    }, [gameState.gameOver, matchId]);

    // Extract message from navigation state
    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
            setMessageType(location.state.type || 'info');
            }
            }, [location]);
            
    if (!showself) return null;
    return (


        <div className="gameplay-container" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '20px',
            backgroundColor: '#1a1a1a',
            minHeight: '100vh'
        }}>
            <div className="game-return" style={{ marginBottom: '20px' }}>
                {!gameState.gameOver && (
                    <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',}} onClick={toggleGame} disabled={!!gameState.connectionError}>
                        {gameState.isPlaying ? 'Pause' : 'Start'}
                    </button>
                )}
            </div>
            {gameState.connectionError && (
                <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                    {gameState.connectionError}
                </div>
            )}
            <div style={{ position: 'relative' }}>
                <canvas
                    ref={canvasRef}
                    width={gameSettings.CANVAS_WIDTH}
                    height={gameSettings.CANVAS_HEIGHT}
                    style={{
                        border: '2px solid white',
                        backgroundColor: 'black',
                        display: 'block'
                    }}
                />
                {/* Debug overlay */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '10px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}>
                    Ball: ({Math.round(gameState.ball.x)}, {Math.round(gameState.ball.y)})<br/>
                    Velocity: ({Math.round(gameState.ball.rx)}, {Math.round(gameState.ball.ry)})<br/>
                    Left Paddle: {Math.round(gameState.players.left.y)}<br/>
                    Right Paddle: {Math.round(gameState.players.right.y)}<br/>
                    Playing: {gameState.isPlaying ? 'Yes' : 'No'}
                </div>
                {gameState.gameOver && (
                    <div style={{
                        position: 'absolute',
                        top: '60%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        zIndex: 1
                    }}>
                        <button 
                            onClick={()=>{navigate('/')}}
                            style={{
                                padding: '15px 30px',
                                fontSize: '20px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                marginTop: '20px'
                            }}
                        >
                            Return to Menu
                        </button>
                    </div>
                )}
            </div>
            <div className="game-controls" style={{ 
                marginTop: '20px', 
                color: 'white', 
                textAlign: 'center' 
            }}>
                <div className="controls-info">
                    <p>Left Player: W/S keys</p>
                    <p>Right Player: O/K keys</p>
                </div>
            </div>
            {console.log("Just before modal", gameMode, gameType)}
            {gameState.gameOver && ToggleGameOverModal &&(
                <GameOverModal 
                showModal={gameState.gameOver} 
                handleCloseModal={handleCloseModal} 
                player1={playerNames.left} 
                player2={playerNames.right} 
                score1={gameState.players.left.score} 
                score2={gameState.players.right.score} 
                />
                )}
        </div>
        
    );
};

export default LocalGame;