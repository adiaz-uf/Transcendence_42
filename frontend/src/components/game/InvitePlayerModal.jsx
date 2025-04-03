import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import {GETCheckUsernameExists, POSTcreateMatch} from "../api-consumer/fetch";
import { useGameSetting } from '../contexts/MenuContext';
import {useNavigate} from "react-router-dom";

export const InvitePlayer = ({ showModal, handleCloseModal}) => {
  
  const {gameMode, setMatchId, isInviting, setIsInviting, setOpponentUsername} = useGameSetting();
  
  const [newUsername, setNewUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); 

  const handleSkip = async () => {
    try {
      setIsInviting(true);
      let id1 = localStorage.getItem('userId');

      let payload = {
        player_left: id1,
        player_right: null, // No second player
        is_multiplayer: false, 
        left_score: 0,
        right_score: 0,
        is_started: false,
      };

      console.log("Skipping invite, starting local game...");
      const localMatchResponse = await POSTcreateMatch(payload);
      if (localMatchResponse) {
        setMatchId(localMatchResponse.id);
        console.log('Local match created:', localMatchResponse);
        handleCloseModal();
        navigate('/pong'); 
      } else {
        setErrorMessage(`Error creating local match`);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage('Error starting local game');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUsernameInvite = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    try {
        setIsInviting(true);
        let id1 = localStorage.getItem('userId');
        console.log("playerLeft:", id1);
        let payload = {
          player_left: id1,
          player_right: null,
          is_multiplayer: true,
          left_score: 0,
          right_score: 0,
          is_started: false,
        };
        const playerRight = await GETCheckUsernameExists(newUsername);
        payload.player_right = playerRight.get("id", null);

        if (gameMode === "local") {
          console.log("Creating match...");
          // Enviar una solicitud POST para crear un nuevo partido
          payload.is_multiplayer = false;
          const LocalMatchResponse = await POSTcreateMatch(payload);
          if (LocalMatchResponse){
            setMatchId(LocalMatchResponse.id)
            console.log('Match created', LocalMatchResponse);
          }
          else{
            setErrorMessage(`Error with new Match`);
            console.log("error creating local match");
          }
          handleCloseModal();
          navigate('/pong');
        }
        else { // ONLINE
          setOpponentUsername(playerRight.get('username', 'None'));
          if (!id1 || payload.player_right){
            setErrorMessage("One of both player are missing");
          }
          console.log("playerLeft:", id1);
          console.log("playerRight:", playerRight);
          console.log("Creating match...");
          // Enviar una solicitud POST para crear un nuevo partido
          console.log("Payload antes de enviar:", payload);
          const OnlineMatchResponse = await POSTcreateMatch(payload);
          if (OnlineMatchResponse){
            setMatchId(OnlineMatchResponse.id)
            console.log('Match created', OnlineMatchResponse);
          }
          else{
            setErrorMessage(`Error with new Match`);
          }
          handleCloseModal();
          navigate('/pong');
        }
    } catch (error) {
        console.log(error);
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
          <Button 
            variant="secondary" 
            className="mt-3 w-100" 
            onClick={handleSkip} 
            disabled={isInviting}>
            Skip (Start Local Game)
          </Button>
          <Button variant="primary" type="submit" className="mt-3 w-100" disabled={isInviting}>
            {isInviting ? 'Inviting...' : 'Invite User'}
          </Button>
        </Form>
        {errorMessage && <div className="mt-3 text-danger">{errorMessage}</div>}
      </Modal.Body>
    </Modal>
  );
};

