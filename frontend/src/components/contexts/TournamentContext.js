import { createContext, useState, useContext} from "react";

const TournamentContext = createContext();

export const TournamentSettingProvider = ({ children }) => {
  const [tournamentId, setTournamentId] = useState("");
  const [player1, setPlayer1] = useState("");                   //de momento necessario porque no se si puede cambiar la orden de accesso de backend
  const [player2, setPlayer2] = useState("");
  const [player3, setPlayer3] = useState("");
  const [player4, setPlayer4] = useState("");
  const [winner1, setwinner1] = useState("");
  const [winner2, setwinner2] = useState("");
  

  
  return (
    <TournamentContext.Provider 
      value={{
        tournamentId, setTournamentId,
        player1, setPlayer1,
        player2, setPlayer2,
        player3, setPlayer3,
        player4, setPlayer4,
        winner1, setwinner1,
        winner2, setwinner2}}>
      {children}
    </TournamentContext.Provider>
  );
};


export const useTournamentSetting = () => useContext(TournamentContext);