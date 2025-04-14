import React, { createContext, useContext, useEffect, useState } from "react";
import ClientWebSocket from "../game/ClientWebSocket";
import { useGameSetting } from "./GameContext";
const WebSocketContext = createContext();

function initializeGameState() {
    return {
        game_active: true,
        players: {
            left: { x: 10, y: 150, width: 15, height: 115, speed: 5, score: 0 },
            right: { x: 880, y: 150, width: 15, height: 115, speed: 5, score: 0 },
        },
        ball: { x: 400, y: 200, radio: 5, rx: 11, ry: -11 },
    };
}



// Custom hook for easier context consumption
export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};

function StateLinkerGameWebSocket({ setGameState, clientWS }) {
    clientWS.listenForGameUpdates((gameUpdate) => {
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


// Component Anchor for passing values and handling WS instance
export const WebSocketProvider = ({ children }) => {
    const {matchId} = useGameSetting(); // Use useGameSetting to get matchId
    const [WSref, setWSref] = useState(null); // UseState  for WebSocket instance
    const [gameState, setGameState] = useState(initializeGameState()); // Use useState for game state


    useEffect(() => {
        console.log("WebSocketProvider mounted");
      }, []);
      
      useEffect(() => {
        if (WSref) console.log("WebSocket initialized:", WSref);
      }, [WSref]);
      

    useEffect(() => {
        // Initialize WebSocket instance only once
        if (!WSref) {
            const instance = new ClientWebSocket(`wss://${window.location.host}:8000/game/`, matchId);
            setWSref(instance); // Set the WebSocket instance
            console.log("WebSocket instance created:", instance);

            instance.connect(); 
            // Link WebSocket updates to game state
            StateLinkerGameWebSocket({ setGameState, clientWS: instance });
        }

        return () => {
            // Cleanup WebSocket connection on unmount
            if (WSref) {
                    WSref.close();
                }
            };
        }, []); // Empty dependency array ensures this runs only once
    
    return (
            <WebSocketContext.Provider value={{ ClientWS:WSref, gameState, setGameState }}>
                {children}
            </WebSocketContext.Provider>
        );
};
        