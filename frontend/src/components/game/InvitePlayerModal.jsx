import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import {GETCheckUsernameExists, POSTcreateMatch} from "../api-consumer/fetch";
import { useGameSetting } from '../contexts/MenuContext';
import {useNavigate} from "react-router-dom";

export const InvitePlayer = ({ showModal, handleCloseModal, gameType}) => {
  
  const {gameMode, setMatchId, isInviting, setIsInviting, setOpponentUsername} = useGameSetting();
  const [newUsername1, setNewUsername1] = useState('');
  const [newUsername2, setNewUsername2] = useState('');
  const [newUsername3, setNewUsername3] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isInvited, setIsInvited] = useState('');
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
      console.log("Match local response");
      console.log(localMatchResponse)
      if (localMatchResponse) {
        console.log("MatchId set to: ", localMatchResponse.id);
        setMatchId(localMatchResponse.id);
        handleCloseModal();
        navigate('/local'); 
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
        const playerRight = await GETCheckUsernameExists(newUsername1);
        const playerRightId = playerRight.userProfile.id;
        console.log("This is the playerRight", playerRight);
        console.log( "and this is the id", playerRight.userProfile.id);
        let payload = {
            player_left: id1,
            player_right: playerRightId,
            is_multiplayer: true,
            left_score: 0,
            right_score: 0,
            is_started: false,
          };
        //payload.player_right = playerRight.get("id", null); //TODO: TypeError: playerRight.get is not a function
        setOpponentUsername(newUsername1);
        if (gameType === "tournament") {
          const player3 = await GETCheckUsernameExists(newUsername2);
          console.log(player3);
          const player4= await GETCheckUsernameExists(newUsername3);
          console.log(player4);
        }

        if (gameMode === "local") {
          console.log("Creating match...");
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
          navigate('/local');
        }
        else { // ONLINE
          if (!id1 || payload.player_right){
            setErrorMessage("One of both player are missing");
          }
          console.log("playerLeft:", id1);
          console.log("playerRight:", playerRight);
          console.log("Creating match...");
          // POST new match
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
          navigate('/local');
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
        {gameType === "tournament" ?
          (<Modal.Title>{isInvited ? 'Waiting Opponent' :  'Enter your opponents usernames'}</Modal.Title>):
          (<Modal.Title>{isInvited ? 'Waiting Opponent' :  'Enter your opponent username'}</Modal.Title>)
        }
      </Modal.Header>
      <Modal.Body>
        {isInvited ? (
          <div className="d-flex flex-column text-center align-items-center justify-content-center">
            <div className="loader">
              <div class="wall-left"></div>
              <div class="wall-right"></div>
            </div> 
            <h4>Waiting for opponent to join...</h4>
            <Button variant="danger" className="mt-3" onClick={handleCloseModal}>
              Go back
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleUsernameInvite}>
            <Form.Group controlId="formName">
              <Form.Label>Player 2</Form.Label>
              <Form.Control
                type="text"
                value={newUsername1}
                onChange={(e) => setNewUsername1(e.target.value)}
                placeholder="Username"
                required />
            </Form.Group>
            {gameType === "tournament" && (
            <Form.Group controlId="formName">
              <Form.Label>Player 3</Form.Label>
              <Form.Control
                type="text"
                value={newUsername2}
                onChange={(e) => setNewUsername2(e.target.value)}
                placeholder="Username"
                required />
            </Form.Group>
            )}
            {gameType === "tournament" && (
            <Form.Group controlId="formName">
              <Form.Label>Player 4</Form.Label>
              <Form.Control
                type="text"
                value={newUsername3}
                onChange={(e) => setNewUsername3(e.target.value)}
                placeholder="Username"
                required />
            </Form.Group>
            )}
          <Button 
            variant="warning" 
            className="mt-3 w-100" 
            onClick={handleSkip} 
            disabled={isInviting}>
            Skip (Start Local Game)
          </Button>
          <Button variant="primary" type="submit" className="mt-3 w-100" disabled={isInviting}>
          {gameType === "tournament" ?
            ( isInviting ? 'Inviting...' : 'Invite Users' ):
            ( isInviting ? 'Inviting...' : 'Invite User' )
          }
           
          </Button>
        </Form>)}
        {errorMessage && <div className="mt-3 text-danger">{errorMessage}</div>}
      </Modal.Body>
    </Modal>
  );
};

