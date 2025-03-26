import { Nav, Navbar, Container } from "react-bootstrap";
import { useState, useEffect } from "react";
import '../../styles/App.css'

export default function NavBar() {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const savedUsername = localStorage.getItem("username");
        setUsername(savedUsername || 'Guest'); 
    }, []); 


    useEffect(() => {
        const handleStorageChange = () => {
            const savedUsername = localStorage.getItem("username");
            setUsername(savedUsername || 'Guest');
        };

        window.addEventListener('storage', handleStorageChange);
        handleStorageChange();
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <Navbar expand="lg" bg="dark" variant="dark" className="navbar-fixed-top">
            <Container>
                <Navbar.Brand href="/">Transcendence</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-bar" />
                <Navbar.Collapse id="responsive-navbar-bar">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        <Nav.Link href="/profile">Profile</Nav.Link>
                        <Nav.Link href="/tournament">Tournament</Nav.Link>
                    </Nav>
                    <Nav>
                        <Navbar.Text>
                            Signed in as: 
                            <a href="/profile" className="user-link"> {username}</a> 
                            <a href="/logout" className="logout-link"> Logout </a>
                        </Navbar.Text>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
