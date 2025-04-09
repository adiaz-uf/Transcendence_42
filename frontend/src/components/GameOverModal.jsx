import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../styles/gameOverModal.css'

export default function GameOverModal({ showModal, handleCloseModal, player1, player2, score1, score2}) {

    const Player1Name = (player1 || 'Guest');
    const Player2Name = (player2 || 'Bot');
    return (
      <Modal show={showModal} onHide={handleCloseModal} dialogClassName="custom-modal" centered>
        <Modal.Header closeButton className="custom-modal-header">
          <Modal.Title>Game Over!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body">
          <p className="winner-text">
            {Player1Name ? Player1Name : 'Guest'} <strong>{score1}</strong> - <strong>{score2}</strong> {Player2Name ? Player2Name : 'Bot'}
          </p>
          <p className="winner-text">
            <strong>{score1 > score2 ? Player1Name : Player2Name}</strong> is the winner! 🎉
          </p>
          <Button variant="primary" onClick={handleCloseModal} className="custom-close-button">
            Close
          </Button>
        </Modal.Body>
      </Modal>
    );
}
