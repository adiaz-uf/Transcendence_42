import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import { Button } from 'react-bootstrap';
import {useGameSetting} from '../contexts/MenuContext'
import '../../styles/game.css'
import {InvitePlayer} from '../game/InvitePlayerModal';
import GameOverModal from "../GameOverModal";

export const Menu = () => {
  const { setGameMode, setIsMultiplayer, setPlayerType } = useGameSetting();

  const [TestVar1, setInvationBool] = useState(false);
  const [TestVar, setInvationBool2] = useState(false); //TODO: delete, just for test modal
  const [gameType, setGameType] = useState(null);  // "match | tournament" *TODO: Join to context??

  const navigate = useNavigate();

  const handleSelectMode = async (mode) => {
    if (mode === "local") {
        setGameType("match");
        setIsMultiplayer(false);
        setInvationBool(true);
        setGameMode("local");
    }
    else if (mode === "online-join") {
      setGameMode("online-join");
      setIsMultiplayer(true);
      setPlayerType("guest");
      navigate("/join");
    }
    else if (mode === "tournament test buttone delete me after") { 

    }
    else if (mode === "test gameover modal") {

      setInvationBool2(true);
    }
  };
  return (
    <div className="menu-container">
      <h1>Do you want a local game or a tournament?!</h1>
      <Button className="m-5" onClick={() => handleSelectMode("local")}>Local Game (2P)</Button>
      <Button className="m-5 btn-info" onClick={() => handleSelectMode("local")}>Start Tournament</Button>
      <h5 className="tournament-info">
        Our 4-player tournaments are designed for players to compete in a series of matches, 
        with the top two advancing to a final. The inviter must enter three usernames to set up the tournament.
      </h5>

      {/* TODO: DELETEME*/}
      <Button className="m-5" onClick={() => handleSelectMode("tournament test buttone delete me after")}>Test Button </Button>
      <Button className="m-5 btn-info" onClick={() => handleSelectMode("test gameover modal")}>Also a Test Button</Button>




      { TestVar1 && (
        <InvitePlayer showModal={TestVar1} handleCloseModal={()=>{setInvationBool(false)}} gameType={gameType}/>
      )}
      { TestVar && ( //TODO: delete this modal here, just for test 
        <GameOverModal showModal={TestVar} handleCloseModal={()=>{setInvationBool2(false)}} player1={"Alex"} player2={"suuu"} score1={10} score2={5}/>
      )}
    </div>
  );
};




// const Menu = ({ onGameModeSelect }) => {
//   const [showButtons, setShowButtons] = useState(false); // Controls the Buttons state
  
//   const HandleOnlineSelect = (mode) => {
//     if (mode === "online") {
//       setShowButtons(true)
//     }
//   };

//   return (
//     <div className="menu-container">
//           <h1>Select GamePlay mode</h1>
//           {!showButtons && (
//           <div>
//           <Button className='m-3 mt-4' onClick={() => onGameModeSelect("local")}>
//             Local Game (2P)
//           </Button>
//           <Button className='m-3 mt-4' onClick={() => HandleOnlineSelect("online")}>
//             Online Game
//           </Button>
//           </div>
//           )}
//           {showButtons && (
//           <div>
//             <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("online-create")}>
//               Create Game
//             </Button>
//             <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("online-join")}>
//               Join Game
//             </Button>
//           </div>
//           )}
//     </div>
//   );
// };
export default Menu;


