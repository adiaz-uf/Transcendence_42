import { createContext, useState, useContext} from "react";

const TournamentContext = createContext();

export const TournamentSettingProvider = ({ children }) => {
  const [tournamentId, setTournamentId] = useState("");
  const [Player1, setPlayer1] = useState("");                   //de momento necessario porque no se si puede cambiar la orden de accesso de backend
  const [Player2, setPlayer2] = useState("");
  const [Player3, setPlayer3] = useState("");
  const [Player4, setPlayer4] = useState("");
  const [Player1username, setPlayer1username] = useState("");                   //de momento necessario porque no se si puede cambiar la orden de accesso de backend
  const [Player2username, setPlayer2username] = useState("");
  const [Player3username, setPlayer3username] = useState("");
  const [Player4username, setPlayer4username] = useState("");
  const [winner1, setwinner1] = useState("");
  const [winner2, setwinner2] = useState("");
  

  
  return (
    <TournamentContext.Provider 
      value={{
        tournamentId, setTournamentId,
        Player1, setPlayer1,
        Player2, setPlayer2,
        Player3, setPlayer3,
        Player4, setPlayer4,
        Player1username, setPlayer1username,
        Player2username, setPlayer2username,
        Player3username, setPlayer3username,
        Player4username, setPlayer4username,
        winner1, setwinner1,
        winner2, setwinner2}}>
      {children}
    </TournamentContext.Provider>
  );
};


export const useTournamentSetting = () => useContext(TournamentContext);