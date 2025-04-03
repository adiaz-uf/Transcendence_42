import Gameplay from "./Gameplay";
// import InvitePlayer from "./InvitePlayerModal";
// import Login from "../../pages/Login";  // Asegúrate de importar el componente Login
// import MessageBox from '../MessageBox';
// import GameBoard from "../GamesBoard";
import GameStateProvider from "../contexts/GameState";
import { useGameSetting } from "../contexts/MenuContext";


// Parent component that holds game mode selection and WebSocket connection state
const GameApp = () => {
  const {matchId} = useGameSetting();
  console.log("Initiating game id: ",matchId);
  return (<div className="game-container">
          <GameStateProvider matchId={matchId}>
            <Gameplay/>
          </GameStateProvider>
      {/* {message && (
        <MessageBox 
          message={message}
          type={"error"}
          onClose={() => setMessage(null)}
        />
      )} */}

      {/* Componente InvitePlayer */}
      {/* <InvitePlayer 
        showModal={showModal} 
        handleCloseModal={handleCloseModal}
        gameMode={gameMode}
        setGameMode={setGameMode}
        setMatchId={setMatchId}
        />
      <GameBoard 
        showBoard={showBoard}
        handleCloseBoard={handleCloseBoard}
      /> */}
    </div>
  );
};

export default GameApp;


// return (
  //   <>
  //   {currentMode === GameMode.MENU && (
    //     <Menu 
  //       onGameModeSelect={(mode) => handleModeSelect(mode)}
  //     />
  //   )}
  
  //   {(currentMode === GameMode.LOCAL || currentMode === GameMode.ONLINE) && (
    //       <InvitePlayer
    //       show={currentMode !== GameMode.MENU && !matchId}
  //       gameMode={currentMode}
  //       onCreateMatch={(createdMatchId, config) => {
    //           setMatchId(createdMatchId);
    //           setGameConfig(config);
  //         }}
  //       onCancel={() => handleModeSelect(GameMode.MENU)}/>) 
  //       }
  //   {(matchId && (currentMode != GameMode.MENU)) && 
  //   (
  //     <Gameplay 
  //       matchId={matchId}
  //       setMode={handleModeSelect}
  //     />
  //   )}
  //   </>
  // );

  // Unified mode handler
  // const handleModeSelect = useCallback((mode, config = {}) => {
  //     switch(mode) {
  //       case GameMode.LOCAL:
  //         setCurrentMode(GameMode.LOCAL);
  //         setGameConfig(config);
  //         break;
  //       case GameMode.ONLINE:
  //         setCurrentMode(GameMode.ONLINE);
  //         setGameConfig(config);
  //         break;
  //       default:
  //         setCurrentMode(GameMode.MENU);
  //         setMatchId(null);
  //     }
  // }, []);