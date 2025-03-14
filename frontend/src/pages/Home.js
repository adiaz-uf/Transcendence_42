import React, { useEffect, useState } from 'react';
import NavBar from '../components/Navbar';
import '../styles/App.css';
import GameApp from '../components/game/GameApp';

function Home() {
  return (
    <div tabIndex="0">
      <NavBar />
      <div className='app-body'>
        <div className='pong-container'>
          <h1>Real-Time Pong</h1>
            <GameApp/>
        </div>
      </div>
    </div>
  );
}

export default Home;
