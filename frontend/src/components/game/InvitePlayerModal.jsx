import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';

const handleUsernameInvite = async () =>
{
    
}

export default function InvitePlayer({ showModal, handleCloseModal }) {
    const [username, setUsername] = useState('');
    const [newUsername, setNewUsername] = useState(username);
    return (

    <Modal show={showModal} onHide={handleCloseModal} dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Enter your opponent username</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleUsernameInvite}>
          <Form.Group controlId="formName">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Username"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3 w-100">
            Save Changes
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}