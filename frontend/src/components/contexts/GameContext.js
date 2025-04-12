import { createContext, useState, useContext, useEffect} from "react";
import { GETGameSettings, GETUserProfileById } from "../api-consumer/fetch";

const GameContext = createContext();

export const GameSettingProvider = ({ children }) => {

  const [gameType, setGameType] = useState(null);  // "match | tournament" *TODO: Join to context?? Why not yas. Now its here
  const [gameMode, setGameMode] = useState(null);  // "local" | "tournament"
  const [matchId, setMatchId] = useState("");      // Store the match ID
  const [isInviting, setIsInviting] = useState(""); // "host" | "invitado"
  const [opponentUsername, setOpponentUsername] = useState(""); // Username for invitation
  const [isMultiplayer, setIsMultiplayer] = useState(false); // Multiplayer game
  const [gameSettings, setGameSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [TournamentSettings, setTournamentSettings] = useState({
      Player1: null,
      Player2: null,
      Player3: null,
      Player4: null,
      Player1username: '',
      Player2username: '',
      Player3username: '',
      Player4username: '',
      tournamentId: null,
  });
  

  const getUsernameById = (playerId) => {
    console.log("Looking up username for player ID:", playerId);
    
    // First check if we have the username in TournamentSettings
    const playerMap = {
      [TournamentSettings.Player1]: TournamentSettings.Player1username,
      [TournamentSettings.Player2]: TournamentSettings.Player2username,
      [TournamentSettings.Player3]: TournamentSettings.Player3username,
      [TournamentSettings.Player4]: TournamentSettings.Player4username,
    };
    
    // If we have the username in TournamentSettings, return it
    if (playerMap[playerId]) {
      console.log("Found username in TournamentSettings:", playerMap[playerId]);
      return playerMap[playerId];
    }
    
    // If not found in TournamentSettings, check local storage
    const player1Id = localStorage.getItem("tournament_player1_id");
    const player2Id = localStorage.getItem("tournament_player2_id");
    const player3Id = localStorage.getItem("tournament_player3_id");
    const player4Id = localStorage.getItem("tournament_player4_id");
    
    if (playerId === player1Id) {
      const username = localStorage.getItem("tournament_player1_username");
      console.log("Found username in local storage:", username);
      return username || "Unknown Player";
    }
    
    if (playerId === player2Id) {
      const username = localStorage.getItem("tournament_player2_username");
      console.log("Found username in local storage:", username);
      return username || "Unknown Player";
    }
    
    if (playerId === player3Id) {
      const username = localStorage.getItem("tournament_player3_username");
      console.log("Found username in local storage:", username);
      return username || "Unknown Player";
    }
    
    if (playerId === player4Id) {
      const username = localStorage.getItem("tournament_player4_username");
      console.log("Found username in local storage:", username);
      return username || "Unknown Player";
    }
    
    console.log("Username not found, returning Unknown Player");
    return "Unknown Player";
  };

  
  // const [showModal, setShowModal] = useState(false); // Controla el estado del modal
  // const [showBoard, setShowBoard] = useState(false); // Controls the visibility of the Board

  // Allows to persist State Usage 
  const updateTournamentSetting = (key, value) => {
    setTournamentSettings((prev) => ({ ...prev, [key]: value }));
  };
 
  // const [showModal, setShowModal] = useState(false); // Controla el estado del modal
  // const [showBoard, setShowBoard] = useState(false); // Controls the visibility of the Board
  
 // New state for game settings

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
        TournamentSettings, updateTournamentSetting,
        gameType, setGameType,
        getUsernameById,
        gameSettings}}>
      {children}
    </GameContext.Provider>
  );
};


export const useGameSetting = () => useContext(GameContext);

