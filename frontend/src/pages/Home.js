import '../styles/App.css';

import React                        from 'react';
import { useEffect, useState }      from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Routes, Route }            from "react-router-dom";


import { GameSettingProvider }      from '../components/contexts/GameContext';
    
import { Menu }                     from '../components/navigation/Menu';
import NavBar                       from '../components/navigation/Navbar';
    
import GameApp                      from '../components/game/GameApp';
import LocalGame                    from '../components/game/LocalGame';
    
import Tournament                   from '../components/tournament/Tournament';
import MessageBox                   from '../components/MessageBox';
import Friend                       from '../components/Friends'


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
            <Route path="/pong" element={<GameApp />} /> {'Not used anymore i think'}
            <Route path="/tournament" element={<Tournament/>} />
            <Route path="/local" element={<LocalGame/>} />
            <Route path="/friends" element={<Friend/>} />
          </Routes>
      </GameSettingProvider>
    </>
  );
};

export default HomeRouter;


