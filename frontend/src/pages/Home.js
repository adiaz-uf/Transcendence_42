import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/Navbar';
import '../styles/App.css';
import GameApp from '../components/game/GameApp';

function Home() {
    const navigate = useNavigate();

    return (
        <div tabIndex="0">
            <NavBar />
            <div className="app-body">
                <div className="pong-container">
                    <h1>Real-Time Pong</h1>
                    <GameApp />
                    <button
                        onClick={() => navigate('/tournament')}
                        style={{ padding: '10px 20px', marginTop: '20px' }}
                    >
                        Go to Tournaments
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;
