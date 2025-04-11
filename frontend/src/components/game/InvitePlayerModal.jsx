import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import {GETCheckUsernameExists, POSTcreateMatch, POSTcreateTournament, PATCHAddMatchToTournament, GETTournamentDetails, PATCHAddWinnerToTournament} from "../api-consumer/fetch";
import { useGameSetting } from '../contexts/GameContext';
import {useNavigate} from "react-router-dom";
import MessageBox from '../MessageBox';

export const InvitePlayer = ({ showModal, handleCloseModal, gameType}) => {
  
  const {gameMode, setMatchId, isInviting, setIsInviting, setOpponentUsername} = useGameSetting();
  const [newUsername1, setNewUsername1] = useState('');
  const [newUsername2, setNewUsername2] = useState('');
  const [newUsername3, setNewUsername3] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isInvited, setIsInvited] = useState('');
  
  const navigate = useNavigate(); 

  const validateForm = () => {
    if (!newUsername1.trim()) {
      setMessage('Please enter an opponent username');
      setMessageType('info');
      return false;
    }

    if ((gameType === "tournament" || gameType === "testing") && (!newUsername2.trim() || !newUsername3.trim())) {
      setMessage('Please enter all opponent usernames for tournament');
      setMessageType('info');
      return false;
    }

    // Check if player is trying to invite themselves
    if (newUsername1 === localStorage.getItem('username')) {
      setMessage("You cannot invite yourself to a game");
      setMessageType('error');
      return false;
    }

    return true;
  };

  const handleSkip = async () => {
    try {
      setIsInviting(true);
      let player_1_id = localStorage.getItem('userId');

      let payload = {
        player_left: player_1_id,
        player_right: null,
        is_multiplayer: false, 
        left_score: 0,
        right_score: 0,
        is_started: false,
      };

      const localMatchResponse = await POSTcreateMatch(payload);
      if (localMatchResponse) {
        setMatchId(localMatchResponse.id);
        handleCloseModal();
        navigate('/local', { 
          state: { 
            message: 'Local game created successfully!',
            type: 'success'
          }
        }); 
      } else {
        setMessage('Error creating local match');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error starting local game: ' + (error.response?.data?.error || error.message || 'Unknown error'));
      setMessageType('error');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUsernameInvite = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validate form fields before proceeding
    if (!validateForm()) {
      return;
    }

    try {
      setIsInviting(true);
      const player_1_id = localStorage.getItem('userId');
      
      const player_2 = await GETCheckUsernameExists(newUsername1);
      if (!player_2?.userProfile?.id) {
        setMessage(`Player '${newUsername1}' not found`);
        setMessageType('error');
        return;
      }

      let payload = {
        player_left: player_1_id,
        player_right: player_2.userProfile.id,
        is_multiplayer: true,
        left_score: 0,
        right_score: 0,
        is_started: false,
      };

      setOpponentUsername(newUsername1);

      if (gameType === "match") {
        const LocalMatchResponse = await POSTcreateMatch(payload);
        if (LocalMatchResponse) {
          setMatchId(LocalMatchResponse.id);
          handleCloseModal();
          navigate('/local', { 
            state: { 
              message: 'Match created successfully!',
              type: 'success'
            }
          });
        } else {
          setMessage('Error creating match');
          setMessageType('error');
        }
      }

      if (gameType === 'testing' || gameType === 'tournament') {
        const player_3 = await GETCheckUsernameExists(newUsername2);
        const player_4 = await GETCheckUsernameExists(newUsername3);

        if (!player_3?.userProfile?.id) {
          setMessage(`Player '${newUsername2}' not found`);
          setMessageType('error');
          return;
        }
        if (!player_4?.userProfile?.id) {
          setMessage(`Player '${newUsername3}' not found`);
          setMessageType('error');
          return;
        }

        // Check for duplicate usernames
        const usernames = [newUsername1, newUsername2, newUsername3];
        if (new Set(usernames).size !== usernames.length) {
          setMessage('All players must be different');
          setMessageType('error');
          return;
        }

        let tournamentPayload = {
          owner: player_1_id,
          players: [player_1_id, player_2.userProfile.id, player_3.userProfile.id, player_4.userProfile.id]
        };

        const TournamentResponse = await POSTcreateTournament(tournamentPayload);
        if (!TournamentResponse) {
          setMessage('Error creating tournament');
          setMessageType('error');
          return;
        }

        handleCloseModal();
        navigate('/menu', { 
          state: { 
            message: 'Tournament created successfully!',
            type: 'success'
          }
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMessage(error.response.data?.error || 'One or more players do not exist');
      } else if (error.response?.status === 400) {
        setMessage(error.response.data?.error || 'Invalid request');
      } else if (error.response?.status === 409) {
        setMessage(error.response.data?.error || 'Conflict: Game or tournament already exists');
      } else if (error.response?.status === 403) {
        setMessage(error.response.data?.error || 'You are not authorized to perform this action');
      } else {
        setMessage(error.response?.data?.error || error.message || 'An unexpected error occurred');
      }
      setMessageType('error');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Modal show={showModal} onHide={handleCloseModal} dialogClassName="custom-modal">
      {message && (
        <MessageBox
          message={message}
          type={messageType}
          onClose={() => setMessage(null)}
        />
      )}
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
              <div className="wall-left"></div>
              <div className="wall-right"></div>
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
            {(gameType === "tournament" || gameType === "testing") && (
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
            {(gameType === "tournament" || gameType === "testing") && (
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
            <Button 
              variant="primary" 
              type="button" 
              className="mt-3 w-100" 
              disabled={isInviting}
              onClick={() => {
                if (validateForm()) {
                  handleUsernameInvite({ preventDefault: () => {} });
                }
              }}>
              {gameType === "tournament" ?
                (isInviting ? 'Inviting...' : 'Invite Players') :
                (isInviting ? 'Inviting...' : 'Invite Player')
              }
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

