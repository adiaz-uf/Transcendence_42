import { Nav, Navbar, Container } from "react-bootstrap";
import { useState, useEffect } from "react";
import '../styles/App.css'
import { ACCESS_TOKEN } from "../constants";

export default function NavBar() {

    const [username, setUsername] = useState('');
    useEffect(() => {
      const savedUsername = localStorage.getItem("username");
      if (savedUsername) {
          setUsername(savedUsername);  // Establecer el username en el estado
      }
    }, []);
    return (
        <Navbar expand="lg" bg="dark" variant="dark" className="navbar-fixed-top">
        <Container>
        <Navbar.Brand href="/home">Transcendence</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-bar"/>
        <Navbar.Collapse id="responsive-navbar-bar">
            <Nav className="me-auto">
                <Nav.Link href="/home">Home</Nav.Link>
                <Nav.Link href="/stats">Stats</Nav.Link>
                <Nav.Link href="/">Tournament</Nav.Link>
            </Nav>
            <Nav>
            <Navbar.Text>
              Signed in as: 
              <a href="/profile" className="user-link"> {username ? username : 'Guest'}</a> 
              <a href="/logout" className="user-link"> Logout </a>
            </Navbar.Text>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
}
  