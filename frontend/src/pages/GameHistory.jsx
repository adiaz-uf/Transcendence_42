import React from 'react';
import NavBar from '../components/navigation/Navbar';
import MatchHistory from '../components/MatchHistory';

function GameHistory() {
    const username = localStorage.getItem("username") || 'Guest';
    return (
        <>
        <NavBar username={username} />
        <div className='app-body'>
            <h1>All Time Game History</h1>
            <div className='pong-container'>
                <MatchHistory username={username} />
            </div>
        </div>
        </>
    );
  };

export default GameHistory;