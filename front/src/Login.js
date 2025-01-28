import { Button, Form, FormGroup } from 'react-bootstrap';
//import Button from './Button'

export default function Login({/* handleSubmit, ...props */}) {
    return (
			<Form>
				<Form.Group id='username'>
					<Form.Control
						type='text'
						//value={props.username}
						name='Username'
						placeholder='Username'
						//onChange={propTypes.handleUsernameChange}
					/>
				</Form.Group>

				<Form.Group id='password'>
					<Form.Control
						type='text'
						//value={props.password}
						name='Password'
						placeholder='Password'
						//onChange={propTypes.handlePasswordChange}
					/>
				</Form.Group>

				<Form.Group>
					<Button id='form-login-button'>
						Login
					</Button>
				</Form.Group>
			</Form>
    );
}

