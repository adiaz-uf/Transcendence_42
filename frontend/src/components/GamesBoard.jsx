import React, { useState, useEffect } from 'react';
import { ListGroup, Spinner, Card, Modal, Button } from 'react-bootstrap';
import api from '../api';

const GameBoardModal = ({ showBoard, handleCloseBoard }) => {
  const [matches, setMatches] = useState([]); // Estado para almacenar los partidos
  const [loading, setLoading] = useState(true); // Estado para manejar el estado de carga
  const [error, setError] = useState(''); // Estado para manejar posibles errores

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/api/matches/available/', {});

        setMatches(response.data);
      } catch (error) {
        setError('Failed to fetch matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <Modal show={showBoard} onHide={handleCloseBoard}>
        <Modal.Header closeButton>
          <Modal.Title>Loading Matches...</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Spinner animation="border" />
          <p>Loading matches...</p>
        </Modal.Body>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal show={showBoard} onHide={handleCloseBoard}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center text-danger">
          {error}
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={showBoard} onHide={handleCloseBoard} dialogClassName="custom-modal">
      <Modal.Header closeButton className="modal-header text-center">
        <Modal.Title>Join Game to Play!</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <ListGroup>
          {matches.length === 0 ? (
            <Card 
              body className="text-center text-white" 
              style={{"background-color":"#26292d", "border": "none"}}>
              No matches available.
            </Card>
          ) : (
            matches.map((match) => (
              <ListGroup.Item key={match.id} className="d-flex justify-content-between bg-dark text-white">
                <div>
                  <strong>{match.player_left_username}</strong> vs <strong>{match.player_right_username}</strong>
                </div>
                <Button variant="success">Join Game</Button>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer style={{ border: 'none' }}>
        <Button variant="danger" onClick={handleCloseBoard}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GameBoardModal;


