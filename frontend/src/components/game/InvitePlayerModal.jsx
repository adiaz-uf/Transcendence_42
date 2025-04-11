import React, { useState }                                                from 'react';
import { Form, Button, Modal }                                            from 'react-bootstrap';
import {useNavigate}                                                      from "react-router-dom";
import { useGameSetting }                                                 from '../contexts/GameContext';
import {GETCheckUsernameExists, POSTcreateMatch, POSTcreateTournament, PATCHAddMatchToTournament, GETTournamentDetails, PATCHAddWinnerToTournament} from "../api-consumer/fetch";

export const InvitePlayer = ({ showModal, handleCloseModal}) => {
  
  const {gameType, setGameMode, setMatchId, isInviting, setIsInviting, setOpponentUsername, 
    updateTournamentSetting, setTournamentId} = useGameSetting();
  const [newUsername1, setNewUsername1] = useState('');
  const [newUsername2, setNewUsername2] = useState('');
  const [newUsername3, setNewUsername3] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isInvited, setIsInvited] = useState('');
  const navigate = useNavigate(); 

  const handleSkip = async () => {
    try {
      setIsInviting(true);
      let player_1_id = localStorage.getItem('userId');

      let payload = {
        player_left: player_1_id,
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
        
        updateTournamentSetting('Player1username', localStorage.getItem('username'));
        updateTournamentSetting('Player2username', "Marvin");

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
      const player1_id = localStorage.getItem("userId");
      updateTournamentSetting('Player1', player1_id);
      updateTournamentSetting('Player1username', localStorage.getItem("username"));

      const player_2 = await GETCheckUsernameExists(newUsername1);
      console.log("inviting User player 2 ", player_2);
      // setPlayer2(player_2.userProfile.id);
      // setPlayer2username(player_2.userProfile.username);
      updateTournamentSetting('Player2', player_2.userProfile.id);
      updateTournamentSetting('Player2username', player_2.userProfile.username);

      //Creating local game
      if (gameType === "local") {
        console.log("Entering local game creation....");
        setGameMode("local")
        let payload_match = {
          player_left: player1_id,
          player_right: player_2.userProfile.id,
          is_multiplayer: false,
          left_score: 0,
          right_score: 0,
          is_started: false,
        };
        const LocalMatchResponse = await POSTcreateMatch(payload_match);
        if (LocalMatchResponse){
          setMatchId(LocalMatchResponse.id);
        }
        else{
          setErrorMessage(`Error with new Match`);
        }
        handleCloseModal();
        navigate('/local');
      }
                                                                                                                  //Creating tournament games; logic needs to change
      if (gameType === 'tournament'){
        setGameMode("tournament")
        const player_3 = await GETCheckUsernameExists(newUsername2);
        const player_4 = await GETCheckUsernameExists(newUsername3);
        updateTournamentSetting('Player3', player_3.userProfile.id);
        updateTournamentSetting('Player3username', player_3.userProfile.username);
        updateTournamentSetting('Player4', player_4.userProfile.id);
        updateTournamentSetting('Player4username', player_4.userProfile.username);

        let payload_tournament = {
          "owner": player1_id,
          "players": [player1_id, player_2.userProfile.id, player_3.userProfile.id, player_4.userProfile.id]
        };
        let TournamentResponse = await POSTcreateTournament(payload_tournament);
        updateTournamentSetting('tournamentId', TournamentResponse.id);
        navigate("/tournament");
      }
    } catch (error) {
        console.log(error);
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
          <div className="d-flex flex-column text-center align-items-center justify-content-center">                                    {/* TODO */}
            {/*<div className="loader">*/}
              {/*<div class="wall-left"></div>*/}
              {/*<div class="wall-right"></div>*/}
            {/*</div> */}
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
            {(gameType === "tournament" | gameType === "testing") && (
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
            {(gameType === "tournament" | gameType === "testing") && (
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

      /* if (gameType === 'testing'){ 
        const player_3 = await GETCheckUsernameExists(newUsername2);
        const player_4 = await GETCheckUsernameExists(newUsername3);
        if (!player_1_id || !player_2){
          setErrorMessage("One of both player are missing");
          }
        payload.is_multiplayer = false;
        let payload2 = {
          "owner": player_1_id,
          "players": [player_1_id, player_2.userProfile.id, player_3.userProfile.id, player_4.userProfile.id]
        };
        let TournamentResponse = await POSTcreateTournament(payload2);
        if (TournamentResponse){
          handleCloseModal(); 
          navigate('/menu');
        }
        let payload3 = {
          player_left: player_1_id,
          player_right: player_2.userProfile.id,
          is_multiplayer: true,
          left_score: 0,
          right_score: 0,
          is_started: false,
        };
        let payload4 = {
          player_left: player_3.userProfile.id,
          player_right: player_4.userProfile.id,
          is_multiplayer: true,
          left_score: 0,
          right_score: 0,
          is_started: false,
        };
        const semifinal1 = await POSTcreateMatch(payload3);
        
        const semifinal2 = await POSTcreateMatch(payload4);

        const result = await PATCHAddMatchToTournament(TournamentResponse.id, semifinal1.id);
        if (result) {
        const TournamentResponse4 = await GETTournamentDetails(TournamentResponse.id);
        const TournamentResponse2 =  await PATCHAddWinnerToTournament(TournamentResponse4.id, player_3.userProfile.id);
        const TournamentResponse3 = await GETTournamentDetails(TournamentResponse.id);

        } */