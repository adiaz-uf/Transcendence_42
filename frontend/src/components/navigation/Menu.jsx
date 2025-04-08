import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import { Button } from 'react-bootstrap';
import {useGameSetting} from '../contexts/MenuContext'
import '../../styles/game.css'
import {InvitePlayer} from '../game/InvitePlayerModal';

export const Menu = () => {
  const { setGameMode, setIsMultiplayer, setPlayerType } = useGameSetting();

  const [OnlineButtons, setOnlineButtons] = useState(false);
  const [InvitationModal, setInvationBool] = useState(false);

  const navigate = useNavigate();

  const handleSelectMode = async (mode) => {
    if (mode === "local") {
      setGameMode("local");
      setIsMultiplayer(false);
      navigate("/local");
    } else if (mode === "online") {
      setOnlineButtons(true);
    } else if (mode === "online-create") {
      setGameMode("online-create");
      setIsMultiplayer(true);
      setPlayerType("host");
      navigate("/invite");
    } else if (mode === "online-join") {
      setGameMode("online-join");
      setIsMultiplayer(true);
      setPlayerType("guest");
      navigate("/join");
    }
  };
  return (
    <div className="menu-container">
      <h1>Select Game Mode</h1>
      { !OnlineButtons? (
        <>
        <Button className="m-3" onClick={() => handleSelectMode("local")}>Local Game (2P)</Button>
        <Button className="m-3" onClick={() => handleSelectMode("online")}>Online Game</Button>
        </>)
        :
        (<>
        <Button className="m-3 btn-success" onClick={() => handleSelectMode("online-create")}>Create Game</Button>
        <Button className="m-3 btn-success" onClick={() => handleSelectMode("online-join")}>Join Game</Button>
        </>)
      }
      { InvitationModal && (
          <InvitePlayer showModal={InvitationModal} handleCloseModal={()=>{setInvationBool(false)}}>

          </InvitePlayer>)}
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


