import React from 'react';
import NavBar from '../components/navigation/Navbar';

function GameHistory() {
    const username = localStorage.getItem("username") || 'Guest';
    return (
        <>
        <NavBar username={username} />
        <div className='app-body'>
            <h1>All Time Game History</h1>
            <div className='pong-container'>
                <h2>TODO: insert Games </h2>
            </div>
        </div>
        </>
    );
  };

export default GameHistory;