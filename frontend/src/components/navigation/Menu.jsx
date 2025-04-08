import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import { Button } from 'react-bootstrap';
import {useGameSetting} from '../contexts/MenuContext'
import '../../styles/game.css'
import {InvitePlayer} from '../game/InvitePlayerModal';
import GameOverModal from "../GameOverModal";

export const Menu = () => {
  const { setGameMode, setIsMultiplayer, setPlayerType } = useGameSetting();

  const [OnlineButtons, setOnlineButtons] = useState(false);
  const [InvitationModal, setInvationBool] = useState(false);
  const [InvitationModal2, setInvationBool2] = useState(false); //TODO: delete, just for test modal
  const [gameType, setGameType] = useState(null);  // "match | tournament" *TODO: Join to context??

  const navigate = useNavigate();

  const handleSelectMode = async (mode) => {
    if (mode === "local") {
      setGameMode("local");
      setGameType("match");
      setIsMultiplayer(false);
      navigate("/local");
      setInvationBool(true);
      // let response = await POSTcreateMatch({
      //   'is_multiplayer':Ismultiplayer,
      //   'is_started':IsStarted,
      //   'left_score':left_score,
      //   'right_score':right_score, 
      //   'player_left_username':localStorage.getItem('userId'),
      //   'player_right_username': right_username
      // });//temporal 
      // console.log(response);
      //setMatchId(response['id']);

      // Pasar por Invite Modal

      // Pasar por send.msg(connectToMatch) Y send.msg(game_active)



      //navigate("/game");
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
    else if (mode === "tournament-start") { 
      setGameMode("local"); // TODO
      setIsMultiplayer(false); // TODO
      setGameType("tournament");
      setInvationBool(true);
    }
    else if (mode === "tournament-join") {

      setInvationBool2(true);
    }
  };
  return (
    <div className="menu-container">
      <h1>Select Game Mode</h1>
      { !OnlineButtons? (
        <>
        <Button className="m-5" onClick={() => handleSelectMode("local")}>Local Game (2P)</Button>
        <Button className="m-5" onClick={() => handleSelectMode("online")}>Online Game</Button>
        </>)
        :
        (<>
        <Button className="m-5 btn-warning" onClick={() => handleSelectMode("online-create")}>Create Game</Button>
        <Button className="m-5 btn-warning" onClick={() => handleSelectMode("online-join")}>Join Game</Button>
        </>)
      }
      <h1>Or start a Tournament!</h1>
      <Button className="m-5 btn-info" onClick={() => handleSelectMode("tournament-start")}>Start Tournament</Button>
      <Button className="m-5 btn-info" onClick={() => handleSelectMode("tournament-join")}>Join Tournament</Button>{/* TODO: Join tournament Logic?*/}
      <h5 className="tournament-info">
        Our 4-player tournaments are designed for players to compete in a series of matches, 
        with the top two advancing to a final. The inviter must enter three usernames to set up the tournament, 
        and the other three players must join to complete the competition. 
        This ensures a structured and fair format for skill-based play.
      </h5>
      { InvitationModal && (
        <InvitePlayer showModal={InvitationModal} handleCloseModal={()=>{setInvationBool(false)}} gameType={gameType}/>
      )}
      { InvitationModal2 && ( //TODO: delete this modal here, just for test 
        <GameOverModal showModal={InvitationModal2} handleCloseModal={()=>{setInvationBool2(false)}} player1={"Alex"} player2={"suuu"} score1={10} score2={5}/>
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


