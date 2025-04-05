import { Button } from 'react-bootstrap';
import React from "react";
import NavBar from '../components/navigation/Navbar';
import '../styles/App.css'

const Tournament = () => {

  const onTournamentSelect = async (mode) => {
    if (mode === "2players") {
      // Modal for 1 opponent?
    }
    else {
      // Modal for 3 opponents?
    }
    
  }

  const usr = localStorage.getItem("username");
  return (
    <>
    <NavBar username={usr} />
    <div className="app-body">
      <h1>Select Tournament to start</h1>
      <div className="">
        <Button className='m-3 mt-4' onClick={() => onTournamentSelect("2players")}>
          2 Players
        </Button>
        <Button className='m-3 mt-4' onClick={() => onTournamentSelect("4players")}>
          4 Players
        </Button>
      </div>
    </div>
    </>
  );
};
export default Tournament;