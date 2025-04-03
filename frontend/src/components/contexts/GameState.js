import React, { useState, useContext, useEffect } from "react";
import { useWebSocket } from "./ClientWSContext";

export function initializeGameState() {
    return {
        game_active: true,
        players: {
            left: { x: 10, y: 150, width: 15, height: 115, speed: 5, score: 0 },
            right: { x: 880, y: 150, width: 15, height: 115, speed: 5, score: 0 },
        },
        ball: { x: 400, y: 200, radio: 5, rx: 11, ry: -11 },
    };
}

export function StateLinkerGameWebSocket({setGameState, webSocketClient}) {
    webSocketClient.listenForGameUpdates((gameUpdate) => {
        console.log("Received game update:", gameUpdate);
        setGameState((prevState) => ({
            ...prevState,
            ...gameUpdate,
            players: {
                ...prevState.players,
                ...gameUpdate.players,
                left: {
                    ...prevState.players.left,
                    ...(gameUpdate.players?.left || {}),
                },
                right: {
                    ...prevState.players.right,
                    ...(gameUpdate.players?.right || {}),
                },
            },
            ball: {
                ...prevState.ball,
                ...(gameUpdate.ball || {}),
            },
        }));
    });
}

// Create context with a default value
export const GameStateContext = React.createContext({
  gameState: initializeGameState(),
  setGameState: () => {},
  webSocketClient: null
});

// Custom hook for easier context consumption
export const useGameState = () => { // Allows to retrieve contextValue
  const context = useContext(GameStateContext);
  
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  
  return context;
};

const GameStateProvider = ({ children }) => { // Component Anchor for passing values and handling WS instance
  const webSocketClient = useWebSocket();
  const [gameState, setGameState] = useState(initializeGameState);

  useEffect(() => {
    webSocketClient.connect(matchId);
    
    const cleanup = StateLinkerGameWebSocket({
      setGameState, 
      webSocketClient
    });

    return () => {
      cleanup();
      webSocketClient.close();
    };
  }, [matchId, webSocketClient]);

  // Provide a stable context value
  const contextValue = React.useMemo(() => ({
    gameState, 
    setGameState, 
    webSocketClient
  }), [gameState, webSocketClient]);

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

export default GameStateProvider; // USED TO INITIALIZE

