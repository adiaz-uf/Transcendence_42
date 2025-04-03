import React, { createContext, useContext } from "react";
import clientWS from "../game/ClientWebSocket";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    
    return (
        <WebSocketContext.Provider value={clientWS}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};