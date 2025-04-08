import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../styles/gameOverModal.css'

export default function GameOverModal({ showModal, handleCloseModal, player1, player2, score1, score2}) {
  return (
    <Modal show={showModal} onHide={handleCloseModal} dialogClassName="custom-modal" centered>
      <Modal.Header closeButton className="custom-modal-header">
        <Modal.Title>Game Over!</Modal.Title>
      </Modal.Header>
      <Modal.Body className="custom-modal-body">
        <p className="winner-text">
          {player1} <strong>{score1}</strong> - <strong>{score2}</strong> {player2}
        </p>
        <p className="winner-text">
          <strong>{score1 > score2 ? player1 : player2}</strong> is the winner! 🎉
        </p>
        <Button variant="primary" onClick={handleCloseModal} className="custom-close-button">
          Close
        </Button>
      </Modal.Body>
    </Modal>
  );
}
