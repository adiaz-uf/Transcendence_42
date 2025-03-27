import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { ACCESS_TOKEN } from "../../constants"; 

const InvitePlayer = ({ showModal, handleCloseModal, gameMode, setShowLogin }) => {
  const [newUsername, setNewUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const handleUsernameInvite = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    try {
        setIsInviting(true);

        // Obtén el token JWT del almacenamiento local
        const token = localStorage.getItem(ACCESS_TOKEN); 

        if (!token) {
            setErrorMessage('No tienes sesión iniciada.');
            return;
        }

        // Llama a la API de Django para verificar si el nombre de usuario existe
        const response = await axios.get(`/api/check_username/${newUsername}/`, {
            headers: {
                Authorization: `Bearer ${token}`,  // Incluye el token JWT en el encabezado
            },
        });

        if (response.data.exists) {
            console.log('Usuario encontrado. Enviando invitación...');
            
            if (gameMode === "local") {
                setShowLogin(true); // Muestra el login si el juego es local
                handleCloseModal(); // Cierra el modal después de la invitación
            } else {
                // Aquí va la lógica para invitar al usuario (por ejemplo, enviar mensaje al servidor)
            }
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            setErrorMessage('El nombre de usuario no existe.');
        } else {
            setErrorMessage('Hubo un error al verificar el usuario.');
        }
    } finally {
        setIsInviting(false);
    }
  };

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
                required />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3 w-100" disabled={isInviting}>
            {isInviting ? 'Inviting...' : 'Invite User'}
          </Button>
        </Form>
        {errorMessage && <div className="mt-3 text-danger">{errorMessage}</div>}
      </Modal.Body>
    </Modal>
  );
};

export default InvitePlayer;
