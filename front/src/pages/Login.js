import { Button, Form } from 'react-bootstrap';
import '../styles/login.css'
import { Link } from "react-router-dom";

/*{ handleSubmit, ...props }*/
export default function Login() {

    return (
		<div className='login-container'>
			<h1 className='header'>Login into Trascendence</h1>
		<div className='login-wrapper'>
			<div className='login-form-container'>
			<Form >
				<Form.Group id='username' className='mb-4'>
					<Form.Control
						type='text'
						//value={props.username}
						name='Username'
						placeholder='Username'
						//onChange={propTypes.handleUsernameChange}
					/>
				</Form.Group>

				<Form.Group id='password' className='mb-4'>
					<Form.Control
						type='text'
						//value={props.password}
						name='Password'
						placeholder='Password'
						//onChange={propTypes.handlePasswordChange}
					/>
				</Form.Group>
				<Link to="/app">
				<Button id='form-login-button' className='w-100'>
					Login
				</Button>
				</Link>

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

