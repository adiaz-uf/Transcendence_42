import React, { useState } from "react";
import { Button } from 'react-bootstrap';
import '../../styles/game.css'



const Menu = ({ onGameModeSelect }) => {
  const [showButtons, setShowButtons] = useState(false); // Controls the Buttons state
  
  const HandleOnlineSelect = (mode) => {
    if (mode === "online") {
      setShowButtons(true)
    }
  };

  return (
    <div className="menu-container">
        
          <h1>Select GamePlay mode</h1>
          {!showButtons && (
          <div>
          <Button className='m-3 mt-4' onClick={() => onGameModeSelect("local")}>
            Local Game (2P)
          </Button>
          <Button className='m-3 mt-4' onClick={() => HandleOnlineSelect("online")}>
            Online Game
          </Button>
          </div>
          )}
          {showButtons && (
          <div>
            <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("online-create")}>
              Create Game
            </Button>
            <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("online-join")}>
              Join Game
            </Button>
          </div>
          )}
    </div>
  );
};
export default Menu;


