import React from 'react';
import NavBar from '../components/navigation/Navbar';
import MatchHistory from '../components/MatchHistory';

function GameHistory() {
    const username = localStorage.getItem("username") || 'Guest';
    return (
        <>
        <NavBar username={username} />
        <div className='app-body' style={{textAlign:"center"}}>
            <h1>Game History Dashboard</h1>
            <MatchHistory username={username} />
        </div>
        </>
    );
  };

export default GameHistory;