import React from 'react';
import NavBar from '../components/navigation/Navbar';
import '../styles/App.css';
import { Menu } from '../components/navigation/Menu';

import { Routes, Route } from "react-router-dom";
import { GameSettingProvider } from '../components/contexts/MenuContext';

import GameApp from '../components/game/GameApp';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MessageBox from '../components/MessageBox';

function Home() {
  return (
    <div className='app-body'>
      <h1>Real-Time Pong</h1>
      <div className='pong-container'>
        <Menu />
      </div>
    </div>
  );
}

const HomeRouter = () => {
  const diplayedUsername = localStorage.getItem("username") || 'Guest';

  const location = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState(location.state?.message || null);
  const [messageType, setMessageType] = useState(location.state?.type || '');

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <>
      <NavBar username={diplayedUsername} />
      {message && (
        <MessageBox
          message={message}
          type={messageType}
          onClose={() => setMessage(null)}
        />
      )}
      <GameSettingProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pong" element={<GameApp />} />
        </Routes>
      </GameSettingProvider>
    </>
  );
};

export default HomeRouter;


