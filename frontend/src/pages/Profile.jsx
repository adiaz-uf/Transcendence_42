import React, { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios'; // Importamos axios para hacer las peticiones
import { ACCESS_TOKEN } from "../constants"; 
import '../styles/profile.css';
import NavBar from '../components/Navbar';
import Stat from '../components/Stat';

export default function Profile() {
  // Estado para los datos del perfil
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true); // Estado para manejar el estado de carga
  const [error, setError] = useState(null); // Estado para manejar errores

  // Estado para mostrar el modal de editar datos
  const [showModal, setShowModal] = useState(false);

  // Estado para guardar los nuevos datos
  const [newName, setNewName] = useState(name);
  const [newEmail, setNewEmail] = useState(email);
  const [newUsername, setNewUsername] = useState(username);

  // Función para manejar la apertura y cierre del modal
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Función para manejar el cambio de datos
  const handleChangeData = (e) => {
    e.preventDefault();
    setName(newName);
    setEmail(newEmail);
    setUsername(newUsername);
    handleCloseModal(); // Cerrar el modal después de cambiar los datos
  };

  // Función para obtener la primera letra del nombre para el avatar
  const getAvatarLetter = (name) => {
    return name.charAt(0).toUpperCase(); // Obtiene la primera letra en mayúscula
  };

  // Función para obtener los datos del perfil desde el backend
  const fetchProfileData = async () => {
    try {
      const response = await axios.get('/api/user/profile/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`, // Obtenemos el token desde el localStorage
        },
      });

      // Si la petición es exitosa, actualizamos el estado con los datos del perfil
      const { username, email, first_name, last_name } = response.data;
      setUsername(username);
      setEmail(email);
      setName(`${first_name} ${last_name}`); // Combina el nombre y apellido
      setLoading(false); // Cambiamos el estado de carga
    } catch (err) {
      setError('Error fetching profile data'); // Si hay un error, mostramos un mensaje
      setLoading(false); // Cambiamos el estado de carga
    }
  };

  // Usamos useEffect para hacer el fetching del perfil cuando el componente se monta
  useEffect(() => {
    fetchProfileData(); // Fetch de los datos del perfil cuando el componente se monta
  }, []);

  // Si estamos cargando, mostramos un mensaje de carga
  if (loading) {
    return <div>Loading...</div>;
  }

  // Si hubo un error, mostramos un mensaje de error
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
