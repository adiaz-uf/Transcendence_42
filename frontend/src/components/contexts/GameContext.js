import { createContext, useState, useContext, useEffect} from "react";
import { GETGameSettings } from "../api-consumer/fetch";

const GameContext = createContext();

export const GameSettingProvider = ({ children }) => {
  const [gameType, setGameType] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [matchId, setMatchId] = useState("");
  const [isInviting, setIsInviting] = useState("");
  const [opponentUsername, setOpponentUsername] = useState("");
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [gameSettings, setGameSettings] = useState(null);
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
    const playerMap = {
      [TournamentSettings.Player1]: TournamentSettings.Player1username,
      [TournamentSettings.Player2]: TournamentSettings.Player2username,
      [TournamentSettings.Player3]: TournamentSettings.Player3username,
      [TournamentSettings.Player4]: TournamentSettings.Player4username,
    };
    
    if (playerMap[playerId]) {
      return playerMap[playerId];
    }
    
    const player1Id = localStorage.getItem("tournament_player1_id");
    const player2Id = localStorage.getItem("tournament_player2_id");
    const player3Id = localStorage.getItem("tournament_player3_id");
    const player4Id = localStorage.getItem("tournament_player4_id");
    
    if (playerId === player1Id) {
      const username = localStorage.getItem("tournament_player1_username");
      return username || "Unknown Player";
    }
    
    if (playerId === player2Id) {
      const username = localStorage.getItem("tournament_player2_username");
      return username || "Unknown Player";
    }
    
    if (playerId === player3Id) {
      const username = localStorage.getItem("tournament_player3_username");
      return username || "Unknown Player";
    }
    
    if (playerId === player4Id) {
      const username = localStorage.getItem("tournament_player4_username");
      return username || "Unknown Player";
    }
    
    return "Unknown Player";
  };

  useEffect(() => {
    const loadGameSettings = async () => {
      try {
        const settings = await GETGameSettings();
        if (!settings.error) {
          setGameSettings(settings);
          localStorage.setItem("gameSettings", JSON.stringify(settings));
        }
      } catch (error) {
        console.error("Error loading game settings:", error);
      }
    };

    const storedSettings = localStorage.getItem("gameSettings");
    if (storedSettings) {
      setGameSettings(JSON.parse(storedSettings));
    } else {
      loadGameSettings();
    }
  }, []);

  const updateTournamentSetting = (key, value) => {
    setTournamentSettings((prev) => ({ ...prev, [key]: value }));
  };

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
        gameSettings
      }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameSetting = () => useContext(GameContext);

