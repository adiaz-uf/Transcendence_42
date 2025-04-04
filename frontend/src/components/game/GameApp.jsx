import Gameplay from "./Gameplay";
import { WebSocketProvider } from '../contexts/ClientWSContext';

// Parent component that holds game mode selection and WebSocket connection state
const GameApp = () => {
  return (
        <div className="game-container">
          <WebSocketProvider>
            <Gameplay/>
          </WebSocketProvider>
        </div>
        );
};
export default GameApp;


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