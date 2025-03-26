import { Button, Form, Spinner, Image } from 'react-bootstrap';
import { useState, useEffect } from "react";
import api from "../api";
import '../styles/login.css'
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Link, useNavigate, useLocation } from "react-router-dom";


/*{ handleSubmit, ...props }*/
export default function Login({route}) {

	const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
	const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
	const [requires2FA, setRequires2FA] = useState(false);
    const navigate = useNavigate();
	const location = useLocation();

	const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
			if (username === "" || password === "")
				throw new Error("Please enter all the fields");
            const res = await api.post(route, { 
				username,
				password,
				...(requires2FA && { code })
			})
			if (res.status === 206) {
				setRequires2FA(true);  // Ask for 2FA code
			} else {
				localStorage.setItem(ACCESS_TOKEN, res.data.access);
				localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
				localStorage.setItem("username", username);
				navigate("/");
			}
		} catch (error) {
            alert(error.response?.data?.error || error.message);
        } finally {
            setLoading(false)
        }
    };
	
	const handle42Login = () => {
		const clientId = process.env.REACT_APP_FT_CLIENT_ID;
		const redirectUri = `${window.location.origin}/api/auth/42/callback`; 
		console.log("redirectUri: ", redirectUri);

		const state = JSON.stringify({
			random: Math.random().toString(36).substring(2), 
			redirect_uri: redirectUri 
		});
		localStorage.setItem("oauth_state", state);
		console.log("state:", state);

		const encodedRedirectUri = encodeURIComponent(redirectUri);
		const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=public&state=${state}`;
		console.log("authUrl full:", authUrl);

		window.location.href = authUrl;
    };

    // Gestion du callback depuis 42
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('access');
        if (accessToken) {
            localStorage.setItem(ACCESS_TOKEN, accessToken);
            api.get("/api/user/profile/", {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            .then(response => {
                const username = response.data.username; 
                localStorage.setItem("username", username); 
                navigate("/");
            })
            .catch(error => {
                console.error("Erreur lors de la récupération du profil :", error);
                navigate("/login"); 
            });
        }
    }, [location, navigate]);


    return (
		<div className='login-container'>
			<h1 className='header'>Welcome to pong!</h1>
			<h1 className='header'>Login to play</h1>
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
								type='password'
								value={password}
								name='Password'
								placeholder='Password'
								onChange={(e) => setPassword(e.target.value)}
							/>
						</Form.Group>
						{requires2FA && (
							<Form.Group id='code' className='mb-4'>
								<Form.Control
									type='text'
									value={code}
									name='Code'
									placeholder='2FA Code'
									onChange={(e) => setCode(e.target.value)}
								/>
							</Form.Group>
						)}
						<Button id='form-login-button' className='w-100' type='submit'>
							{loading ? <Spinner animation="border" size="sm" /> : 'Login'}
						</Button>
						<Button
							id='form-login-button'
							className='signin42-button w-100 mt-4'
							type='button'
							onClick={handle42Login}
						>
							{loading ? (
								<Spinner animation="border" size="sm" />
							) : (
								<>
									Sign in with <Image src="42_logo.svg" width={'10%'} />
								</>
							)}
						</Button>
						<div className='login-register-container'>
							<Form.FloatingLabel>Dont have an account?</Form.FloatingLabel>
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
