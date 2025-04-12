import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import api from '../api';
import { ACCESS_TOKEN } from "../constants"; 
import '../styles/profile.css';
import NavBar from '../components/navigation/Navbar';
import Stat from '../components/Stat';
import EditProfileModal from '../components/EditProfileModal';
import TwoFAModal from '../components/TwoFAModal';
import MessageBox from '../components/MessageBox';
import Friends from '../components/Friends';
import { GETCurrentProfileInfo, GETUserMatchesPlayed, GETUserMatchesWon } from '../components/api-consumer/fetch';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageType, setMessageType] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is42user, setIs42user] = useState(false);

  const [matches, setMatches] = useState([]);
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [matchesWon, setMatchesWon] = useState(0);
  const [matchesLosed, setMatchesLosed] = useState(0);
  const [winRatio, setWinRatio] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [newName, setNewName] = useState(name);
  const [newEmail, setNewEmail] = useState(email);
  const [newUsername, setNewUsername] = useState(username);
  const [newPassword, setNewPassword] = useState('');
  
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleShow2FAModal = () => setShow2FAModal(true);
  
  const [message, setMessage] = useState(null);
    
  // ########################################   Fetch API ################################################

  useEffect(() => {
    if (matchesPlayed > 0) {
      
      const calculatedMatchesLosed = matchesPlayed - matchesWon;
      setMatchesLosed(calculatedMatchesLosed);
      if (calculatedMatchesLosed === 0) {
        setWinRatio(matchesWon > 0 ? matchesWon.toFixed(1) : "0.0");
      } else {
        const calculatedWinRatio = matchesWon / matchesPlayed;
        setWinRatio(calculatedWinRatio.toFixed(2));
      }
    } else {
      setWinRatio(0);
    }
  }, [matchesPlayed, matchesWon]);

  const fetchProfileData = async () => {
    try {
      const { id, username, email, given_name, surname, is_42user, is_2fa_enabled } = await GETCurrentProfileInfo(localStorage.getItem('username'));
      setUsername(username);
      setEmail(email);
      setName(`${given_name} ${surname}`);
      setNewName(`${given_name} ${surname}`);
      setNewEmail(email);
      setNewUsername(username);
      setIs42user(is_42user);
      setIs2FAEnabled(is_2fa_enabled);
      localStorage.setItem("username", username);
      localStorage.setItem("userId", id);
      setLoading(false);

    } catch (error)
    {
      setError(error?.response?.data || "Fetch failed");
      setMessageType("error");
    }
  };

  const matchesResponse = async () => {
    try {
      const response = await GETUserMatchesPlayed(username)
      setMatchesPlayed(response); 
    } catch (error) {
      console.error("Error fetching matches played", error);
    }
  };
  
  const matchesWonResponse = async () => {
    try {
      const response = await GETUserMatchesWon(username)
      setMatchesWon(response);
    } catch (error) {
      console.error("Error fetching matches won", error);
    }
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get(`/api/user/list-matches-played/${username}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
        });
        setMatches(response.data.matches);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching matches", error);
        setLoading(false);
      }
    };
    if (username) {
      fetchMatches();
    }
  }, [username]);

// Prepares data for the graph
const cumulativeWins = [];
const cumulativeLosses = [];
let winCount = 0;
let lossCount = 0;

matches.forEach(match => {
  if (match.result === 'won') {
    winCount += 1;
  }
  if (match.result === 'lost') {
    lossCount += 1;
  }

  cumulativeWins.push(winCount);
  cumulativeLosses.push(lossCount);
});
const chartData = {
  labels: matches.map(match => new Date(match.date).toLocaleDateString()),
  datasets: [
    {
      label: 'Wins',
      data: cumulativeWins,
      borderColor: 'green',
      backgroundColor: 'green',
      fill: false,
      tension: 0.1,
    },
    {
      label: 'Loses',
      data: cumulativeLosses,
      borderColor: 'red',
      backgroundColor: 'red',
      fill: false,
      tension: 0.1,
    },
  ],
};

  const handleChangeData = async (e) => {
    e.preventDefault();

    const hasChanged =
    newEmail !== email ||
    newUsername !== username ||
    newName !== name ||
    newPassword !== '';

    if (!hasChanged) {
      setError("No changes.");
      setMessageType("info");
      return;
    }

    const updatedData = {};
    if (newEmail) {
      updatedData.email = newEmail;
    }
    if (newUsername) {
      updatedData.username = newUsername;
    }
    if (newName) {
      updatedData.given_name = newName.split(' ')[0];
      updatedData.surname = newName.split(' ')[1] || '';
    }
    if (newPassword) {
      updatedData.password = newPassword;
    }
    try {
      if (Object.keys(updatedData).length === 0)
        throw new Error("All the fields are empty");
      const response = await api.patch('/api/user/profile/', updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      console.log(response);
      setName(`${response.data.given_name} ${response.data.surname}`);
      setEmail(response.data.email);
      setUsername(response.data.username);
      localStorage.setItem("username", response.data.username);
      
      setError("Changes has been saved !");
      setMessageType("success");
      
      handleCloseModal();
    } catch (e) {
      if (e.response && e.response.data) {
        const djangoErrors = e.response.data;
        const errorMessages = Object.entries(djangoErrors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n");
        setError(errorMessages);
        setMessageType("error");
      } else {
        setError(e?.message || "Error updating profile");
        setMessageType("info");
      }
    }
  };

  const handleSetup2FA = async () => {
    try {
      const response = await api.get('/api/setup-2fa/', {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      setQrCode(response.data.qr_code);
      setSecret(response.data.secret);
      setIs2FAEnabled(response.data.is_2fa_enabled);
      handleShow2FAModal();
    } catch (error) {
      setError("Error fetching 2FA setup");
      setMessageType("error");
    }
  };
  
  const handleClose2FAModal = () => {
    setShow2FAModal(false);
    setTwoFACode('');
  };

  const handleToggle2FA = async (e) => {
    e.preventDefault();
    try {
      const payload = is2FAEnabled ? { code: twoFACode, disable: true } : { code: twoFACode };
      const response = await api.post('/api/setup-2fa/', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      setError(response.data.message);
      setMessageType("success");
      setIs2FAEnabled(!is2FAEnabled);
      handleClose2FAModal();
    } catch (error) {
      setError(error?.response?.data?.error || "Error toggling 2FA");
      setMessageType("error");
      handleClose2FAModal();
    }
  };

  const getAvatarLetter = (name) => name.charAt(0).toUpperCase();

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (username) {
      matchesResponse();
      matchesWonResponse();
    }
  }, [username]);  // Se ejecuta cada vez que el `username` cambie

  if (loading) return <div>Loading...</div>;
/*   if (error) return <div><NavBar></NavBar><div className='app-body'>{error}</div></div>; */

  return (
    <>
      <NavBar username={username} />
      {error && (
        <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999 }}>
          <MessageBox
            message={error}
            type={messageType}
            onClose={() => setError(null)}
          />
        </div>
      )}
      <div className='profile-body'>
        <div className="profile-container">
          <div className="avatar">{getAvatarLetter(name)}</div>
          <div className="profile-info">
            <div className="profile-details">
              <h1>Profile Details</h1>
              <h5><strong>Name:</strong> {name}</h5>
              <h5><strong>Email:</strong> {email}</h5>
              <h5><strong>Username:</strong> {username}</h5>
            
              <div className="profile-buttons">
                {!is42user && ( 
                <Button variant="primary" onClick={handleShowModal}>
                  Change Data
                </Button>  /* 42 user cannot change data ! but we dont care Edit editprofile data to allow changing only username for is42user people and still not affecting auth*/ 
                )}
                {!is42user && (   
                <Button variant={is2FAEnabled ? "danger" : "success"} onClick={handleSetup2FA}>
                  {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <EditProfileModal 
          showModal={showModal} 
          handleCloseModal={() => setShowModal(false)} 
          newName={newName} 
          setNewName={setNewName}
          newEmail={newEmail} 
          setNewEmail={setNewEmail} 
          newUsername={newUsername} 
          setNewUsername={setNewUsername} 
          handleChangeData={handleChangeData} 
          setNewPassword={setNewPassword}
        />
        <TwoFAModal 
          show2FAModal={show2FAModal} 
          handleClose2FAModal={() => setShow2FAModal(false)} 
          is2FAEnabled={is2FAEnabled} 
          qrCode={qrCode} 
          secret={secret}
          twoFACode={twoFACode} 
          setTwoFACode={setTwoFACode} 
          handleToggle2FA={handleToggle2FA} 
        />
        <h3 style={{"margin":"2rem"}}>All Time Matches Stats</h3>
        <div style={{ width: '100%', maxWidth: '800px' }}>
          {loading ? <div>Loading...</div> : (
            <Line data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {legend: {labels: {color: 'white',},},
                tooltip: {backgroundColor: '#222',titleColor: 'white',bodyColor: 'white',},},
              scales: {
                x: {
                  ticks: {color: 'white',},
                  grid: { color: 'rgba(255,255,255,0.1)',},
                },
                y: {
                  ticks: {color: 'white',},
                  grid: {color: 'rgba(255,255,255,0.1)',},
                },
              },
            }}
          />
          )}
        </div>
        <div className='stats-container'>
          <Stat title={"Matches Played"} value={matchesPlayed} />
          <Stat title={"Wins"} value={matchesWon} />
          <Stat title={"Loses"} value={matchesLosed} />
          <Stat title={"Win Rate"} value={winRatio} />
        </div>
      <Friends />
      </div>
    </>
  );
}
