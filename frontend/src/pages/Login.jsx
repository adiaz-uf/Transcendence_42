import { Button, Form } from 'react-bootstrap';
import { useState } from "react";
import api from "../api";
import '../styles/login.css'
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Link, useNavigate} from "react-router-dom";

/*{ handleSubmit, ...props }*/
export default function Login({route}) {

	const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

	const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password })
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate("/")
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    };
	
    return (
		<div className='login-container'>
			<h1 className='header'>Login into Transcendence</h1>
		<div className='login-wrapper'>
			<div className='login-form-container'>
			<Form onSubmit={handleSubmit}>
				<Form.Group id='username' className='mb-4'>
					<Form.Control
						type='text'
						value={username}
						name='Username'
						placeholder='Username'
						onChange={(e) => setUsername(e.target.value)}
					/>
				</Form.Group>

				<Form.Group id='password' className='mb-4'>
					<Form.Control
						type='text'
						value={password}
						name='Password'
						placeholder='Password'
						onChange={(e) => setPassword(e.target.value)}
					/>
				</Form.Group>
				<Button id='form-login-button' className='w-100' type='submit'>
					Login
				</Button>

				<div className='login-register-container'>
				<Form.FloatingLabel>¿Dont have an account?</Form.FloatingLabel>
				<Link to="/register" className='w-50'>
				<Button id='form-login-button' className='w-100'>
					Register
				</Button>
                </Link>
				</div>
			</Form>
			</div>
		</div>
		</div>
    );
}

