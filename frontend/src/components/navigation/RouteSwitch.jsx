import Login from '../../pages/Login'
import Setup2FA from '../../pages/Setup2FA'
import Register from '../../pages/Register'
import NotFound from '../../pages/NotFound'
import Profile from '../../pages/Profile'
import GameHistory from '../../pages/GameHistory'
import { Routes, Route } from 'react-router-dom';
import HomeRouter from '../../pages/Home'
import { setUserActive } from '../api-consumer/fetch'
import { useEffect } from 'react';
import {useNavigate } from "react-router-dom";
import ProtectedRoute from './ProtectedRoute'
import api from '../../api'

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            await setUserActive(false); // Ensure the API call completes
            await api.post("/api/logout/normal-logout/");
			localStorage.removeItem("gameSettings"); // si lo guardas
            navigate('/login'); // Redirect to login after logout
        };

        handleLogout();
    }, [navigate]);

    return <p>Logging out...</p>;
}

function RegisterWrapper() {
	localStorage.clear()
	return <Register route='/api/user/register/'/>
}

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
	return null;
  }

export default function RouterSwitch() {
	const navigate = useNavigate();

	// Set User Active to False when Navigating to !publicRoutes and Token Expired
	useEffect(() => {
		// Allow access to public routes like /register
		const publicRoutes = ['/register', '/login', '/login/callback'];
		if (publicRoutes.includes(window.location.pathname)) {
			return;
		}
		const token = getCookie('access_token');
		if (!token) {
			setUserActive(false);
			navigate('/login');
		return;
		}
		try {
			// Decode the token to get the expiration time
			const { exp } = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload 30S
			const expiry = exp * 1000 - Date.now() - 5000; // Calculate time until expiration and 5seconds before expiration for sending last active status API cal			
			
			// If the token is already expired, navigate to login
			if (expiry <= 0) {
				setUserActive(false);
				localStorage.clear();
				navigate('/login');
				return;
			}
			// Set a timeout to log the user out when the token expires
			const timer = setTimeout(() => {
				setUserActive(false);
				localStorage.clear();
				if (window.location.pathname !== '/login') {
					navigate('/login'); // Redirect to login only if not already on the login page
				}
			}, expiry);

			// Cleanup the timeout when the component unmounts
			return () => clearTimeout(timer);
		} catch (error) {
			console.error("Error decoding token:", error);
			setUserActive(false);
			localStorage.clear();
			navigate('/login');
		}
	}, [navigate]);

	useEffect(() => {
		const setUserActiveFalseWhenClosing = () => {
			const logoutRequest = async () => {
				try {
					const response = await fetch('/api/user/logout/', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							active: false,
						}),
					});
					if (response.ok) {
						console.log('User status updated as inactive.');
					} else {
						console.error('Failed to update user status.');
					}
				} catch (error) {
					console.error('Error during logout request', error);
				}
			};
			logoutRequest();
		};
	
		document.addEventListener('beforeunload', setUserActiveFalseWhenClosing);
		return () => {
			document.removeEventListener('beforeunload', setUserActiveFalseWhenClosing);
		};
	}, []);
	
      return (
            <Routes>
					<Route path ='/*' element ={<ProtectedRoute> <HomeRouter/> </ProtectedRoute>}/>
					<Route path="/login" element={<Login route='/api/user/login/' />} />
					<Route path ='/register' element ={<RegisterWrapper/>}/>
		  			<Route path="/login/callback" element={<Login route='/api/user/login/' />} />
					<Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
					<Route path ='/setup-2fa' element={<ProtectedRoute><Setup2FA /></ProtectedRoute>} />
					<Route path ='/profile' element ={<ProtectedRoute><Profile/></ProtectedRoute>}/>
					<Route path ='/game-history' element ={<ProtectedRoute><GameHistory/></ProtectedRoute>}/>
					<Route path ='*' element ={<ProtectedRoute><NotFound/></ProtectedRoute>}/>
            </Routes>
	);
}
