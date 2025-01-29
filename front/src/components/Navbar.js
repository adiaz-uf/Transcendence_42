import { Nav, Navbar, Container } from "react-bootstrap";

export default function NavBar() {
    return (
        <Navbar expand="lg" bg="dark" variant="dark" sticky="top">
        <Container>
        <Navbar.Brand href="#home">Trascendence</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-bar"/>
        <Navbar.Collapse id="responsive-navbar-bar">
            <Nav className="me-auto">
                <Nav.Link href="/">Home</Nav.Link>
                <Nav.Link href="/">Stats</Nav.Link>
                <Nav.Link href="/">Tournament</Nav.Link>
            </Nav>
            <Nav>
            <Navbar.Text>
              Signed in as: <a href="#login"> Adiaz-uf</a>
            </Navbar.Text>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
}
  