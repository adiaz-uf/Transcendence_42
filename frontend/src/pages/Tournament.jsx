import { Button } from 'react-bootstrap';
import React from "react";
import '../../styles/game.css'

const Tournament = ({ onTournamentSelect }) => {
  return (
    <div className="tournament-container">
          <h1>Select Tournament to start</h1>
          <Button className='m-3 mt-4' onClick={() => onTournamentSelect("2players")}>
            2 Players
          </Button>
          <Button className='m-3 mt-4' onClick={() => onTournamentSelect("4players")} disabled>
            4 Players
          </Button>
    </div>
  );
};
export default Tournament;