import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import {GETCheckUsernameExists, POSTcreateMatch, POSTcreateTournament, PATCHAddMatchToTournament, GETTournamentDetails, PATCHAddWinnerToTournament} from "../api-consumer/fetch";
import { useGameSetting } from '../contexts/GameContext';
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
      const player_1_id = localStorage.getItem('userId');
      console.log("playerLeft:", player_1_id);
      const player_2 = await GETCheckUsernameExists(newUsername1);
      console.log("This is the playerRight", player_2);
      console.log( "and this is the id", player_2.userProfile.id);
      let payload = {
          player_left: player_1_id,
          player_right: player_2.userProfile.id,
          is_multiplayer: true,
          left_score: 0,
          right_score: 0,
          is_started: false,
        };
        console.log(gameType)
      //payload.player_right = playerRight.get("id", null); //TODO: TypeError: playerRight.get is not a function
      setOpponentUsername(newUsername1)
      if (gameType === "tournament") {
          const player3 = await GETCheckUsernameExists(newUsername2);
          console.log(player3);
          const player4= await GETCheckUsernameExists(newUsername3);
          console.log(player4);
      }
                                                                                                                    //Creating local game
      if (gameType === "local") {
        console.log("Entering local game creation....");
        
        payload.is_multiplayer = false;
        let payload1 = {
          player_left: player_1_id,
          player_right: player_2.userProfile.id,
          is_multiplayer: true,
          left_score: 0,
          right_score: 0,
          is_started: false,
        };
        const LocalMatchResponse = await POSTcreateMatch(payload1);
        if (LocalMatchResponse){
          setMatchId(LocalMatchResponse.id);
          console.log('Match created', LocalMatchResponse);
          
        }
        else
        {
          setErrorMessage(`Error with new Match`);
          console.log("error creating local match");
        }
        console.log("we here boiiiiii");
        navigate('/local');
        handleCloseModal();  
      }
                                                                                                                  //Creating tournament games; logic needs to change
      if (gameType === 'testing'){ 
        const player_3 = await GETCheckUsernameExists(newUsername2);
        console.log(player_3);
        const player_4 = await GETCheckUsernameExists(newUsername3);
        console.log(player_4);
        console.log('Player 3 and 4 names checked');
        console.log("Entering tournament creation....");
        console.log("player 1. id:", {player_1_id});
        console.log("player 2:", {player_2});
        console.log("player 3:", {player_3});
        console.log("player 4:", {player_4});
        if (!player_1_id || !player_2){
          setErrorMessage("One of both player are missing");
          }
        console.log("Both players in game....");
        payload.is_multiplayer = false;
        let payload2 = {
          "owner": player_1_id,
          "players": [player_1_id, player_2.userProfile.id, player_3.userProfile.id, player_4.userProfile.id]
        };
        console.log("Payload created....");

        let TournamentResponse = await POSTcreateTournament(payload2);
        console.log("POST send....");
        if (TournamentResponse){
          console.log('Tournament', TournamentResponse);
          console.log('Tournament Players', TournamentResponse.players);
          console.log('Tournament Matches', TournamentResponse.matches);
          console.log('Tournament Owner', TournamentResponse.owner);
          console.log('Tournament created', TournamentResponse);
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
        console.log("Payload 3", payload3);
        console.log("Payload 4", payload4);
        const semifinal1 = await POSTcreateMatch(payload3);
        if (semifinal1){
          console.log('semifinal1 created', semifinal1);
        }          
        const semifinal2 = await POSTcreateMatch(payload4);
        if (semifinal2){
          console.log('semifinal2 created', semifinal2);
        }
        console.log("Tournament ID", TournamentResponse.id);
        console.log("Match ID", semifinal1.id);
        const result = await PATCHAddMatchToTournament(TournamentResponse.id, semifinal1.id);
        if (result) {
            console.log("Match successfully added to the tournament:", TournamentResponse.matches);
        } else {
            console.error("Failed to add match to tournament.");
        }
        console.log("Response from add match", TournamentResponse);
        console.log("Tournament ID", TournamentResponse.id);
        console.log("Check match value", TournamentResponse.matches);
        const TournamentResponse4 = await GETTournamentDetails(TournamentResponse.id);
        console.log("Updated Tournament", TournamentResponse4);
        console.log("Check match value updated", TournamentResponse4.matches);
        console.log("Check player 3 id", player_3.userProfile.id);
        console.log("Tournament ID", TournamentResponse4.id);
        const TournamentResponse2 =  await PATCHAddWinnerToTournament(TournamentResponse4.id, player_3.userProfile.id);
        console.log("Winner successfully added to the tournament:", TournamentResponse2.winner);
        const TournamentResponse3 = await GETTournamentDetails(TournamentResponse.id);
        console.log("Winner successfully added to the tournament:", TournamentResponse3.winner);
        //TournamentResponse = GETTournamentDetails(TournamentResponse.id);
        //console.log("Winner successfully added to the tournament:", TournamentResponse.winner);




      
          //handleCloseModal();
          //navigate('/local');
        }
      if (gameType === 'tournament'){
        
        const player_3 = await GETCheckUsernameExists(newUsername2);
        const player_4 = await GETCheckUsernameExists(newUsername3);

      }
    } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 404)  {
            setErrorMessage('The username does not exist.');
        }  else if (error.code === 94) {
          setErrorMessage('this is you retarded.');
        } else {
            setErrorMessage('This block is broken');
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
          <div className="d-flex flex-column text-center align-items-center justify-content-center">                                    {/* TODO */}
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

