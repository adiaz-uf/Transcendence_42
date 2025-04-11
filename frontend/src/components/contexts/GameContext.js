import { createContext, useState, useContext} from "react";

const GameContext = createContext();

export const GameSettingProvider = ({ children }) => {

  const [gameType, setGameType] = useState(null);  // "match | tournament" *TODO: Join to context?? Why not yas. Now its here
  const [gameMode, setGameMode] = useState(null);  // "local" | "tournament"
  const [matchId, setMatchId] = useState("");      // Store the match ID
  const [isInviting, setIsInviting] = useState(""); // "host" | "invitado"
  const [opponentUsername, setOpponentUsername] = useState(""); // Username for invitation
  const [isMultiplayer, setIsMultiplayer] = useState(false); // Multiplayer game
  const [tournamentId, setTournamentId] = useState("");
  const [TournamentSettings, setTournamentSettings] = useState({
      Player1: null,
      Player2: null,
      Player3: null,
      Player4: null,
      Player1username: '',
      Player2username: '',
      Player3username: '',
      Player4username: '',
      winner1:null,
      winner2:null,
      tournamentId: null,
  });


  
  // const [showModal, setShowModal] = useState(false); // Controla el estado del modal
  // const [showBoard, setShowBoard] = useState(false); // Controls the visibility of the Board

  // Allows to persist State Usage 
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
        tournamentId, setTournamentId,
        TournamentSettings, updateTournamentSetting,
        gameType, setGameType}}>
      {children}
    </GameContext.Provider>
  );
};


export const useGameSetting = () => useContext(GameContext);
