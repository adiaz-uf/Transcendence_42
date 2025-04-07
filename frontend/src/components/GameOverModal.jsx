import React from 'react';
import { Form, Button, Modal } from 'react-bootstrap';

export default function GameOverModal({ /* showModal, handleCloseModal, */ winner }) {
  return (
    <Modal /* show={showModal} onHide={handleCloseModal} */ dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          {"Game Over!"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <>
            <p>Winner is: <strong>{winner}</strong></p>
          </>
      </Modal.Body>
    </Modal>
  );
}
