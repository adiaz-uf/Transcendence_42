import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Stat from './Stat';

const FriendProfileModal = ({ show, handleClose, user }) => {
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
          <Stat title={"Matches Played"} value={1} />
          <Stat title={"Matches Won"} value={1} />
          <Stat title={"Matches Lost"} value={1} />
          <Stat title={"Win Rate"} value={1} />
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

