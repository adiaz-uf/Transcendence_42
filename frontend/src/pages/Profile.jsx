import React, { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios'; // Importamos axios para hacer las peticiones
import { ACCESS_TOKEN } from "../constants"; 
import '../styles/profile.css';
import NavBar from '../components/Navbar';
import Stat from '../components/Stat';

export default function Profile() {
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const [showModal, setShowModal] = useState(false);

  const [newName, setNewName] = useState(name);
  const [newEmail, setNewEmail] = useState(email);
  const [newUsername, setNewUsername] = useState(username);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChangeData = async (e) => {
    e.preventDefault();

    const updatedData = {
      first_name: newName.split(' ')[0],  // Asumiendo que el nombre es el primer nombre
      last_name: newName.split(' ')[1] || '', // Asumiendo que el apellido es el segundo nombre
      email: newEmail,
    };

    try {
      const response = await axios.patch('/api/user/profile/update/', updatedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });

      // Actualiza el estado con los nuevos datos
      setName(newName);
      setEmail(newEmail);
      setUsername(newUsername);

      // Cierra el modal después de la actualización
      handleCloseModal();

      console.log("Profile updated:", response.data);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error updating profile");
    }
  };

  const getAvatarLetter = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('/api/user/profile/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });

      const { username, email, first_name, last_name } = response.data;
      setUsername(username);
      setEmail(email);
      setName(`${first_name} ${last_name}`); 
      setLoading(false); 
    } catch (err) {
      setError('Error fetching profile data'); 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <NavBar />
      <div className='profile-body'>
        <div className="profile-container">
          <div className="avatar">
            {getAvatarLetter(name)}
          </div>
          <div className="profile-info">
            <div className="profile-details">
              <h1>Profile Details</h1>
              <h5><strong>Name:</strong> {name}</h5>
              <h5><strong>Email:</strong> {email}</h5>
              <h5><strong>Username:</strong> {username}</h5>
              <Button variant="primary" onClick={handleShowModal}>
                Change Data
              </Button>
            </div>
          </div>
        </div>
        {/* Modal para editar los datos */}
        <Modal show={showModal} onHide={handleCloseModal} dialogClassName="modal-dialog-centered" style={{"border-radius":"20px"}}>
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
              <Button variant="primary" type="submit" className="mt-3 w-100">
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
        <div className='stats-container'>
          <Stat title={"Matches Played"} value={"5"} />
          <Stat title={"Win Rate"} value={"4.0"} />
          <Stat title={"Wins"} value={"4"} />
          <Stat title={"Loses"} value={"1"} />
          <Stat title={"stat"} value={"999"} />
          <Stat title={"stat"} value={"999"} />
          <Stat title={"stat"} value={"999"} />
          <Stat title={"stat"} value={"999"} />
        </div>
      </div>
    </>
  );
}
