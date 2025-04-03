import Gameplay from "./Gameplay";
import {GameStateProvider} from "../contexts/GameState";


// Parent component that holds game mode selection and WebSocket connection state
const GameApp = () => {
  return (<div className="game-container">
          <GameStateProvider>
            <Gameplay/>
          </GameStateProvider>
    </div>
  );
};

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
export default GameApp;
