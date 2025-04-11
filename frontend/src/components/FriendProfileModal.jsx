import React, {useState, useEffect} from 'react';
import { Modal, Button } from 'react-bootstrap';
import Stat from './Stat';
import { GETUserMatchesPlayed, GETUserMatchesWon } from '../components/api-consumer/fetch';

const FriendProfileModal = ({ show, handleClose, user }) => {

  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [matchesWon, setMatchesWon] = useState(0);
  const [matchesLosed, setMatchesLosed] = useState(0);
  const [winRatio, setWinRatio] = useState(0);

  useEffect(() => {
    if (matchesPlayed > 0) {
      const calculatedMatchesLosed = matchesPlayed - matchesWon;
      setMatchesLosed(calculatedMatchesLosed);
      const calculatedWinRatio = matchesWon / matchesPlayed;
      setWinRatio(calculatedWinRatio.toFixed(2));
    } else {
      setWinRatio(0);
    }
  }, [matchesPlayed, matchesWon]);

  const matchesResponse = async () => {
    try {
      const response = await GETUserMatchesPlayed(user)
      setMatchesPlayed(response); 
    } catch (error) {
      console.error("Error fetching matches played", error);
    }
  };
  
  const matchesWonResponse = async () => {
    try {
      const response = await GETUserMatchesWon(user)
      setMatchesWon(response);
    } catch (error) {
      console.error("Error fetching matches won", error);
    }
  };

  useEffect(() => {
    if (user) {
      matchesResponse();
      matchesWonResponse();
    }
  }, [user]);  // Se ejecuta cada vez que el `username` cambie

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      dialogClassName="custom-modal"
      centered
      size="lg"
    >
      <Modal.Header closeButton className="custom-modal-header">
        <Modal.Title>{user}'s Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body className="custom-modal-body"
        style={{overflowY: 'auto',  padding: '1.5rem' }}
      >
        <h5><strong>Username:</strong> {user}</h5>
        <div className="stats-container">
          <Stat title={"Matches Played"} value={matchesPlayed} />
          <Stat title={"Wins"} value={matchesWon} />
          <Stat title={"Loses"} value={matchesLosed} />
          <Stat title={"Win Rate"} value={winRatio} />
        </div>
      </Modal.Body>
      <Modal.Footer style={{ border: 'none' }}>
        <Button variant="danger" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FriendProfileModal;

