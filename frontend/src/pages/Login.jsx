import LoginForm from "../components/LoginForm"
import '../styles/login.css'

export default function Login({route}) {
	return (
		<div className='login-container'>
			<h1 className='header'>Welcome to pong!</h1>
			<h1 className='header'>Login to play</h1>
			<LoginForm route={route} navigateTo="/"></LoginForm>
		</div>
    );	
}