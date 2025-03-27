import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import api from '../api';
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
      const response = await api.get('/api/user/profile/', {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      console.log("GET - /api/user/profile/ returned:", response.data)
      const { id,
        email, 
        username, 
        last_active,
        password,
        is_42user,
        is_2fa_enabled,
        totp_secret} = response.data;
      setUsername(username);
      setEmail(email);
      setIs42user(is_42user);
      setIs2FAEnabled(is_2fa_enabled);
      setLoading(false);

      // // Number of matches played by user
      // const matchesResponse = await api.get('/api/user/matches-played/', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      // });
      // setMatchesPlayed(matchesResponse.data.matches_played); 

      // const matchesWonResponse = await api.get('/api/user/matches-won/', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      // });
      // setMatchesWon(matchesWonResponse.data.matches_won); 

      // const twoFAResponse = await api.get('/api/setup-2fa/',{
      //   headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      // });
      // console.log("2FA response", twoFAResponse)
    } catch (err) {
      setError('Error fetching profile data');
      setLoading(false);
    }
  };

  const handleChangeData = async (e) => {
    e.preventDefault();
    const updatedData = {
      email: newEmail,
      username: newUsername
    };
    if (newPassword) {
      updatedData.password = newPassword;
    }
    try {
      const response = await api.post('/api/user/profile/', updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      console.log("Sent new Profile data: ", response.data)
      handleCloseModal();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error updating profile");
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
      console.error("Error fetching 2FA setup:", error);
      setError("Error fetching 2FA setup");
    }
  };

  const handleToggle2FA = async (e) => {
    e.preventDefault();
    try {
      const payload = is2FAEnabled ? { code: twoFACode, disable: true } : { code: twoFACode };
      const response = await api.post('/api/setup-2fa/', payload, {
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

  const getAvatarLetter = (username) => {
    if (is42user)
        return 42;
    else
      return username.charAt(0).toUpperCase()
  };

  useEffect(() => {
    fetchProfileData();
  }, [username, email, is42user]);

  // const twoFAButton = () => {
  //     if (!is42user)
  //     {
  //       return (
  //       <Button variant={is2FAEnabled ? "danger" : "success"} onClick={handleSetup2FA}>
  //         {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
  //       </Button>);
  //     }
  //     return null
  // };

  if (loading) return <div>Loading...</div>;
/*   if (error) return <div><NavBar></NavBar><div className='app-body'>{error}</div></div>; */

  return (
    <>
      <NavBar />
      <div className='profile-body'>
        <div className="profile-container">
          <div className="avatar">{getAvatarLetter(username)}</div>
          <div className="profile-info">
            <div className="profile-details">
              <h1>Profile Details</h1>
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
          newEmail={newEmail} 
          setNewEmail={setNewEmail} 
          newUsername={newUsername} 
          setNewUsername={setNewUsername} 
          setNewPassword={setNewPassword}
          newPassword={newPassword}
          handleChangeData={handleChangeData} 
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
