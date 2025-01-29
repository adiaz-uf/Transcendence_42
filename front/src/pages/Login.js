import { Button, Form } from 'react-bootstrap';
import '../styles/login.css'

export default function Login({/* handleSubmit, ...props */}) {
    return (
		<div className='login-wrapper'>
			<div className='login-form-container'>
			<Form >
				<Form.Group id='username' className='mb-3'>
					<Form.Control
						type='text'
						//value={props.username}
						name='Username'
						placeholder='Username'
						//onChange={propTypes.handleUsernameChange}
					/>
				</Form.Group>

				<Form.Group id='password' className='mb-3'>
					<Form.Control
						type='text'
						//value={props.password}
						name='Password'
						placeholder='Password'
						//onChange={propTypes.handlePasswordChange}
					/>
				</Form.Group>

				<Button id='form-login-button' className='w-100'>
					Login
				</Button>
				
				<div className='register-container'>
				<Form.FloatingLabel>¿Dont have an account?</Form.FloatingLabel>
				<Button id='form-login-button' className='w-50'>
					Register
				</Button>
				</div>
			</Form>
			</div>
		</div>
    );
}

