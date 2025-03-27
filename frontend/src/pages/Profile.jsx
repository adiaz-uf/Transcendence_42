import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { ACCESS_TOKEN } from "../constants"; 
import '../styles/profile.css';
import NavBar from '../components/navigation/Navbar';
import Stat from '../components/Stat';
import Alert from '../components/Alert';
import EditProfileModal from '../components/EditProfileModal';
import TwoFAModal from '../components/TwoFAModal';

export default function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is42user, setIs42user] = useState(false);
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [matchesWon, setMatchesWon] = useState(0);
  const [matchesLosed, setMatchesLosed] = useState(0);
  const [winRatio, setWinRatio] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
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
  const handleClose2FAModal = () => {
    setShow2FAModal(false);
    setTwoFACode('');
  };

  useEffect(() => {
    if (matchesPlayed > 0) {
      // Calculamos el número de partidas perdidas
      const calculatedMatchesLosed = matchesPlayed - matchesWon;
      setMatchesLosed(calculatedMatchesLosed);
  
      if (calculatedMatchesLosed === 0) {
        // Si no hay partidos perdidos, el win ratio será igual a matchesWon
        setWinRatio(matchesWon > 0 ? matchesWon.toFixed(1) : "0.0");
      } else {
        // Si hay partidas perdidas, calculamos el win ratio
        const calculatedWinRatio = matchesWon / calculatedMatchesLosed;
        setWinRatio(calculatedWinRatio.toFixed(2)); // Limitar a 2 decimales
      }
    } else {
      setWinRatio(0); // Si no hay partidos jugados, el win ratio es 0
    }
  }, [matchesPlayed, matchesWon]);  // Dependencias

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('/api/user/profile/', {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      const { username, email, given_name, surname, is_42user } = response.data;
      setUsername(username);
      setEmail(email);
      setName(`${given_name} ${surname}`);
      setNewName(`${given_name} ${surname}`);
      setNewEmail(email);
      setNewUsername(username);
      setIs42user(is_42user);
      
      //    // Number of matches played by user
      //    const matchesResponse = await axios.get('/api/user/matches-played/', {
        //      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
        //    });
//    setMatchesPlayed(matchesResponse.data.matches_played); 
//
//    const matchesWonResponse = await axios.get('/api/user/matches-won/', {
  //      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
  //    });
  //    setMatchesWon(matchesWonResponse.data.matches_won); 
  //
  const twoFAResponse = await axios.get('/api/setup-2fa/', {
    headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
    });
    setIs2FAEnabled(twoFAResponse.data.is_2fa_enabled);
    setLoading(false);
      } catch (err) {
        setError('Error fetching profile data');
        setLoading(false);
      }
  };

  const handleChangeData = async (e) => {
    e.preventDefault();
    const updatedData = {
      given_name: newName.split(' ')[0],
      surname: newName.split(' ')[1] || '',
      email: newEmail,
      username: newUsername,
    };
    if (newPassword) {
      updatedData.password = newPassword;
    }
    try {
      const response = await axios.patch('/api/user/profile/update/', updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      setName(`${response.data.given_name} ${response.data.surname}`);
      setEmail(response.data.email);
      setUsername(response.data.username);
      setPassword(newPassword);
      handleCloseModal();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error updating profile");
    }
  };

  const handleSetup2FA = async () => {
    try {
      const response = await axios.get('/api/setup-2fa/', {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      setQrCode(response.data.qr_code);
      setSecret(response.data.secret);
      setIs2FAEnabled(response.data.is_2fa_enabled);
      handleShow2FAModal();
    } catch (error) {
      console.error("Error fetching 2FA setup:", error);
      setError("Error fetching 2FA setup");
    }
  };

  const handleToggle2FA = async (e) => {
    e.preventDefault();
    try {
      const payload = is2FAEnabled ? { code: twoFACode, disable: true } : { code: twoFACode };
      const response = await axios.post('/api/setup-2fa/', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      alert(response.data.message);
      setIs2FAEnabled(!is2FAEnabled);
      handleClose2FAModal();
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      alert(error.response?.data?.error || "Error toggling 2FA");
    }
  };

  const getAvatarLetter = (name) => name.charAt(0).toUpperCase();

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) return <div>Loading...</div>;
/*   if (error) return <div><NavBar></NavBar><div className='app-body'>{error}</div></div>; */

  return (
    <>
      <NavBar />
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
                <Button variant="primary" onClick={handleShowModal}>
                  Change Data
                </Button>
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
          newPassword={newPassword}
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

        <div className='stats-container'>
          <Stat title={"Matches Played"} value={matchesPlayed} />
          <Stat title={"Wins"} value={matchesWon} />
          <Stat title={"Loses"} value={matchesLosed} />
          <Stat title={"Win Rate"} value={winRatio} />
          <Stat title={"stat"} value={"999"} />
          <Stat title={"stat"} value={"999"} />
          <Stat title={"stat"} value={"999"} />
          <Stat title={"stat"} value={"999"} />
        </div>
      </div>
    </>
  );
}