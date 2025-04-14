import React, { useState } from "react";
import { Button } from 'react-bootstrap';
import {useGameSetting} from '../contexts/GameContext'
import '../../styles/game.css'
import {InvitePlayer} from '../game/InvitePlayerModal';

export const Menu = () => {
  const { setGameMode, setIsMultiplayer, setGameType} = useGameSetting();
  const [InvitationModal, setInvationBool] = useState(false);

  const handleSelectMode = async (mode) => {

    if (mode === "local") {
        setGameType("match"); // For specifying if game is Match or Tournament
        setGameMode("local"); // For specifying if game is Local or Remote (not impl yet)
        setIsMultiplayer(false);
        setInvationBool(true);
    } else if (mode === "tournament") { 
      setGameType("tournament");
      setGameMode("local");
      setIsMultiplayer(false);
      setInvationBool(true);
    }
  };

  return (
    <div className="menu-container">
      <h1>Play Single Game</h1>
      <Button className="m-5" onClick={() => handleSelectMode("local")}>Start Game (2P)</Button>
      <h1>Or start a Tournament!</h1>
      <Button className="m-5 btn-info" onClick={() => handleSelectMode("tournament")}>Start Tournament</Button>
      <h5 className="tournament-info">
        Our 4-player tournaments are designed for players to compete in a series of matches, 
        with the top two advancing to a final. The inviter must enter three usernames to set up the tournament.
      </h5>
      { InvitationModal && (
        <InvitePlayer showModal={InvitationModal} handleCloseModal={()=>{setInvationBool(false)}}/>
      )}
    </div>
  );
};


export default Menu;


