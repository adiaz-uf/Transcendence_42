import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Modal } from 'react-bootstrap';
import api from '../../api';
import { ACCESS_TOKEN } from "../../constants"; 

const InvitePlayer = ({ showModal, handleCloseModal, gameMode }) => {
  const [newUsername, setNewUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const navigate = useNavigate();

  const handleUsernameInvite = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    try {
        setIsInviting(true);

        // Get the JWT token from local storage
        const token = localStorage.getItem(ACCESS_TOKEN); 

        if (!token) {
            setErrorMessage('You are not logged in.');
            return;
        }

        // Call the Django API to check if the username exists
        const response = await api.get(`/api/check_username/${newUsername}/`, {
            headers: {
                Authorization: `Bearer ${token}`,  // Include the JWT token in the header
            },
        });

        if (response.data.exists) {
          console.log('User found. Sending invitation...');
          
          // Obtener el perfil del jugador que está enviando la invitación (player_left)
          const playerLeftResponse = await api.get(`/api/user/profile/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
          });
          const playerLeft = playerLeftResponse.data; // Datos del jugador que invita
          console.log("playerLeft:", playerLeft);
          const playerRight = response.data.userProfile; // Datos del jugador al que se le envía la invitación
          console.log("playerRight:", playerRight);

          if (gameMode === "local") {
              handleCloseModal(); 
          } else {
            console.log("Creating match...");
            const payload = {
              player_left: playerLeft.id,
              player_right: playerRight.id,
              is_multiplayer: true,
              left_score: 0,
              right_score: 0,
              is_started: false,
            };
            console.log("Payload antes de enviar:", payload);
            // Enviar una solicitud POST para crear un nuevo partido
            const matchResponse = await api.post('/api/match/online/create/', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Match created', matchResponse.data);
            handleCloseModal();
          }
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            setErrorMessage('The username does not exist.');
        } else {
            setErrorMessage('There was an error checking the username.');
        }
    } finally {
        setIsInviting(false);
    }
  };

  return (
    <Modal show={showModal} onHide={handleCloseModal} dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Enter your opponent username</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleUsernameInvite}>
          <Form.Group controlId="formName">
            <Form.Label>Username</Form.Label>
            <Form.Control
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username"
                required />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3 w-100" disabled={isInviting}>
            {isInviting ? 'Inviting...' : 'Invite User'}
          </Button>
        </Form>
        {errorMessage && <div className="mt-3 text-danger">{errorMessage}</div>}
      </Modal.Body>
    </Modal>
  );
};

export default InvitePlayer;
