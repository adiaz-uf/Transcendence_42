import { Button } from 'react-bootstrap';
import React from "react";
import '../../styles/game.css'

const Menu = ({ onGameModeSelect }) => {
  return (
    <div className="menu-container">
          <h1>Select GamePlay mode</h1>
          <Button className='m-3 mt-4' onClick={() => onGameModeSelect("local")}>
            Local Game (2P)
          </Button>
          <Button className='m-3 mt-4' onClick={() => onGameModeSelect("online")} disabled>
            Online Game
          </Button>
    </div>
  );
};
export default Menu;


