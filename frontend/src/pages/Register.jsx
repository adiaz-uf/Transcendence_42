import { Button, Form, Spinner } from 'react-bootstrap';
import { useState } from "react";
import api from "../api";
import '../styles/login.css'
import { useNavigate } from "react-router-dom";
import MessageBox from '../components/MessageBox';

/* handleSubmit, ...props} */
export default function Register({route}) {

	const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
	const [repeatpassword, setRepeatPassword] = useState("");
	const [email, setEmail] = useState("");
	const [given_name, setGivenName] = useState("");
	const [surname, setSurname] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [messageType, setMessageType] = useState("");

	const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            if (username === "" || email === "" || given_name === "" || surname === "" || password === "" || repeatpassword === "")
                setError("Please enter all the fields");
                setMessageType("info");
            if (password !== repeatpassword)
                setError("Passwords aren't matching");
                setMessageType("info");

            await api.post(route, { username, password, email, given_name, surname });
            navigate("/login");
        } catch (error) {
            setError(error.response?.data?.detail || error.message);
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login-container'>
            {error && <MessageBox 
                message={error}
                type={messageType}
                onClose={() => setError(null)}/>}
            <h1 className='header'>Register Page</h1>
            <div className='login-wrapper'>
                <div className='register-form-container'>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id='email' className='mb-3'>
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type='email'
                                value={email}
                                name='email'
                                placeholder='email@email.com'
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Form.Label className="text-muted-email">
                                We'll never share your email with anyone else.
                            </Form.Label>
                        </Form.Group>
                        <div className='register-register-container'>
                            <Form.Group id='username' className='mb-3 w-100'>
                                <Form.Label>Enter Username</Form.Label>
                                <Form.Control
                                    type='text'
                                    value={username}
                                    name='username'
                                    placeholder='Username'
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group id='given_name' className='mb-3 w-100'>
                                <Form.Label>Given Name</Form.Label>
                                <Form.Control
                                    type='text'
                                    value={given_name}
                                    name='given_name'
                                    placeholder='Given Name'
                                    onChange={(e) => setGivenName(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                        <div className='register-register-container'>
                            <Form.Group id='surname' className='mb-3 w-100'>
                                <Form.Label>Surname</Form.Label>
                                <Form.Control
                                    type='text'
                                    value={surname}
                                    name='surname'
                                    placeholder='Surname'
                                    onChange={(e) => setSurname(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group id='newpassword' className='mb-3 w-100'>
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    type='password'
                                    value={password}
                                    name='newpassword'
                                    placeholder='New Password'
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                        <div className='register-register-container'>
                            <Form.Group id='repeatpassword' className='mb-3 w-100'>
                                <Form.Label>Repeat Password</Form.Label>
                                <Form.Control
                                    type='password'
                                    value={repeatpassword}
                                    name='repeatpassword'
                                    placeholder='Repeat Password'
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                />
                            </Form.Group>
                            <Button className='mt-3 w-100' type='submit'>
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" />
                                        {' '}Loading...
                                    </>
                                ) : (
                                    'Register'
                                )}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}