import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal } from 'react-bootstrap';
import '../styles/profile.css'; // Importamos el archivo CSS
import NavBar from '../components/Navbar';

export default function Profile() {
  // Estado para los datos del perfil
  const [name, setName] = useState('Agustin Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [username, setUsername] = useState('johndoe');
  const [bio, setBio] = useState('A short bio about John.');

  // Estado para mostrar el modal de editar datos
  const [showModal, setShowModal] = useState(false);

  // Estado para guardar los nuevos datos
  const [newName, setNewName] = useState(name);
  const [newEmail, setNewEmail] = useState(email);
  const [newUsername, setNewUsername] = useState(username);
  const [newBio, setNewBio] = useState(bio);

  // Función para manejar la apertura y cierre del modal
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Función para manejar el cambio de datos
  const handleChangeData = (e) => {
    e.preventDefault();
    setName(newName);
    setEmail(newEmail);
    setUsername(newUsername);
    setBio(newBio);
    handleCloseModal(); // Cerrar el modal después de cambiar los datos
  };

  // Función para obtener la primera letra del nombre para el avatar
  const getAvatarLetter = (name) => {
    return name.charAt(0).toUpperCase(); // Obtiene la primera letra en mayúscula
  };

  return (
    <>
    <NavBar/>
    <Container className="my-5">
      <Row>
        <Col md={4}>
          {/* Perfil de usuario */}
          <Card className="profile-card">
            <Card.Body className="text-center">
              {/* Avatar con la primera letra del nombre */}
              <div className="avatar">
                {getAvatarLetter(name)}
              </div>
              <h5>{name}</h5>
              <p>@{username}</p>
              <p>{email}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          {/* Información de perfil */}
          <Card className="profile-card">
            <Card.Body>
              <h1>Profile Details</h1>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Username:</strong> {username}</p>
              <p><strong>Bio:</strong> {bio}</p>
              {/* Botón para cambiar datos */}
              <Button variant="primary" onClick={handleShowModal}>
                Change Data
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para editar los datos */}
      <Modal show={showModal} onHide={handleCloseModal} dialogClassName="modal-dialog-centered">
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleChangeData}>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your name"
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </Form.Group>

            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </Form.Group>

            <Form.Group controlId="formBio">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="Enter a short bio"
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3 w-100">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
    </>
  );
}
