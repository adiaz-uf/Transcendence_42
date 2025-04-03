import React from 'react';
import NavBar from '../components/navigation/Navbar';
import '../styles/App.css';
import {Menu} from '../components/navigation/Menu';

import { Routes, Route } from "react-router-dom";
import { WebSocketProvider } from '../components/contexts/ClientWSContext';
import {GameSettingProvider} from '../components/contexts/MenuContext';
import GameApp from '../components/game/GameApp';

function Home() {
  return (
      <div className='app-body'>
        <h1>Real-Time Pong</h1>
        <div className='pong-container'>
          <Menu/>
        </div>
      </div>
  );
}

const HomeRouter = () => {
  return (
      <>
      <NavBar />
        <GameSettingProvider>
          <WebSocketProvider> 
            <Routes>
                <Route path="/" element={<Home />} />
                  <Route path="/pong" element={<GameApp/>}>
                </Route>
            </Routes>
          </WebSocketProvider>
        </GameSettingProvider>
      </>
  );
};

export default HomeRouter;


