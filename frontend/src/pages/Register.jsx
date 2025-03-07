import { Button, Form, Spinner } from 'react-bootstrap';
import { useState } from "react";
import api from "../api";
import '../styles/login.css'
import { useNavigate } from "react-router-dom";

/* handleSubmit, ...props} */
export default function Register({route}) {

	const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
	const [repeatpassword, setRepeatPassword] = useState("");
	const [email, setEmail] = useState("");
	const [first_name, setFirstname] = useState("");
	const [last_name, setLastname] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

	 const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

		try {
			if (username === "" || email === "" || first_name === "" ||last_name === "" || password === "" || repeatpassword === "")
				throw new Error("Please enter all the fields");
			else if (password !== repeatpassword)
				throw new Error("Passwords must be the same!");
			await api.post(route, { username, password, email, first_name, last_name });
			navigate("/login")
		}
		catch (error) {
			alert(error)
		} 
		finally {
			setLoading(false)
		}
	 }
    return (
		<div className='login-container'>
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
						name='Username'
						placeholder='Username'
						onChange={(e) => setUsername(e.target.value)}
					/>
				</Form.Group>
                <Form.Group id='firstname' className='mb-3 w-100'>
                <Form.Label>First Name</Form.Label>
					<Form.Control
						type='text'
						value={first_name}
						name='first_name'
						placeholder='First Name'
						onChange={(e) => setFirstname(e.target.value)}
					/>
				</Form.Group>
                </div>
				<div className='register-register-container'>
				<Form.Group id='last_name' className='mb-3 w-100'>
                <Form.Label>Second Name</Form.Label>
					<Form.Control
						type='text'
						value={last_name}
						name='last_name'
						placeholder='Last Name'
						onChange={(e) => setLastname(e.target.value)}
					/>
				</Form.Group>
				<Form.Group id='newpassword' className='mb-3 w-100'>
                <Form.Label>New Password</Form.Label>
					<Form.Control
						type='password'
						value={password}
						name='NewPassword'
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
						name='RepeatPassword'
						placeholder='Repeat Password'
						onChange={(e) => setRepeatPassword(e.target.value)}
					/>
				</Form.Group>
				<Button id='form-login-button' className='mt-3 w-100' type='submit'>
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