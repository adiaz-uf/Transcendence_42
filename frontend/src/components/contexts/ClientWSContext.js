import React, { createContext, useRef, useContext, useEffect, useState } from "react";
import ClientWebSocket from "../game/ClientWebSocket";
import { useGameSetting } from "./MenuContext";
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
    const {matchId, setMatchId} = useGameSetting(); // Use useGameSetting to get matchId
    const [WSref, setWSref] = useState(null); // UseState  for Web)Socket instance
    const [gameState, setGameState] = useState(initializeGameState); // Use useState for game state


    useEffect(() => {
        console.log("WebSocketProvider mounted");
    }, []);

    useEffect(() => {
        console.log("WebSocketProvider matchId changed:", matchId);
    }, [matchId]);
    
    console.log("matchId:", matchId);
      useEffect(() => {
        if (WSref) console.log("WebSocket initialized:", WSref);
      }, [WSref]);
      

    useEffect(() => {
        // Initialize WebSocket instance only once
        console.log("WebSocketProvider useEffect matchId:", matchId);

        if (matchId) {
            const instance = new ClientWebSocket(`ws://${window.location.host}:8000/game/?token=${localStorage.getItem('access')}`, matchId);
            setWSref(instance); // Set the WebSocket instance
            console.log("WebSocket instance created:", instance);

            // Link WebSocket updates to game state
            StateLinkerGameWebSocket({ setGameState, clientWS: instance });
        }

        return () => {
            // Cleanup WebSocket connection on unmount
            if (WSref) {
                    WSref.close();
                }
            };
    }, [matchId]); // Empty dependency array ensures this runs only once

    return (
            <WebSocketContext.Provider value={{ ClientWS:WSref, gameState, setGameState }}>
                {children}
            </WebSocketContext.Provider>
        );
};
        