import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { ACCESS_TOKEN } from "../../constants"; 

const InvitePlayer = ({ showModal, handleCloseModal, gameMode, setShowLogin }) => {
  const [newUsername, setNewUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);

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
        const response = await axios.get(`/api/check_username/${newUsername}/`, {
            headers: {
                Authorization: `Bearer ${token}`,  // Include the JWT token in the header
            },
        });

        if (response.data.exists) {
            console.log('User found. Sending invitation...');
            
            if (gameMode === "local") {
                setShowLogin(true); // Show the login if the game mode is local
                handleCloseModal(); // Close the modal after sending the invitation
            } else {
                // Here goes the logic to invite the user (e.g., send message to the server)
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
