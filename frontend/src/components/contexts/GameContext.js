import { createContext, useState, useContext, useEffect} from "react";
import { GETGameSettings } from "../api-consumer/fetch";

const GameContext = createContext();

export const GameSettingProvider = ({ children }) => {
  const [gameMode, setGameMode] = useState(null);  // "local" | "tournament"
  const [matchId, setMatchId] = useState("");      // Store the match ID
  const [isInviting, setIsInviting] = useState(""); // "host" | "invitado"
  const [opponentUsername, setOpponentUsername] = useState(""); // Username for invitation
  const [isMultiplayer, setIsMultiplayer] = useState(false); // Multiplayer game
 
  // const [showModal, setShowModal] = useState(false); // Controla el estado del modal
  // const [showBoard, setShowBoard] = useState(false); // Controls the visibility of the Board
  
 // New state for game settings
 const [gameSettings, setGameSettings] = useState(null);
 const [loadingSettings, setLoadingSettings] = useState(true);

 // Fetch game settings when the provider mounts
  useEffect(() => {
   async function fetchGameSettings() {
     try {
       const fetchedSettings = await GETGameSettings();
       setGameSettings(fetchedSettings);
     } catch (err) {
       console.error("Error fetching game settings:", err);
     } finally {
       setLoadingSettings(false);
     }
   }
   fetchGameSettings();
 }, []);

 if (loadingSettings) {
  return <div>Loading game settings...</div>;
}


  return (
    <GameContext.Provider 
      value={{ 
        gameMode, setGameMode, 
        matchId, setMatchId, 
        isInviting, setIsInviting, 
        opponentUsername, setOpponentUsername,
        isMultiplayer, setIsMultiplayer,
        gameSettings}}>
      {children}
    </GameContext.Provider>
  );
};


export const useGameSetting = () => useContext(GameContext);
