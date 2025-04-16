import Login from '../../pages/Login'
import Setup2FA from '../../pages/Setup2FA'
import Register from '../../pages/Register'

import Profile from '../../pages/Profile'
import GameHistory from '../../pages/GameHistory'
import { Routes, Route } from 'react-router-dom';
import HomeRouter from '../../pages/Home'
import { setUserActive } from '../api-consumer/fetch'
import { ACCESS_TOKEN } from '../../constants'
import { useEffect } from 'react';
import {useNavigate } from "react-router-dom";
import ProtectedRoute from './ProtectedRoute'

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            await setUserActive(false); // Ensure the API call completes
            localStorage.clear(); // Clear localStorage after the API call
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

export default function RouterSwitch() {
	const navigate = useNavigate();
	
	// // useEffect at mounting for sending False active status when page closes
	// NOT USED !
	// useEffect(() => {
	// 	const token = localStorage.getItem(ACCESS_TOKEN);
	// 	const data = JSON.stringify({
	// 	active: false,
	// 	token, 
	// 	});

	// 	const blob = new Blob([data], { type: 'application/json' });
	// 	navigator.sendBeacon('/api/users/update-active', blob);

	// 	const handleUnload = () => {
	// 	  navigator.sendBeacon('/api/user/active/', JSON.stringify({ active: false }));
	// 	};
	  
	// 	window.addEventListener("beforeunload", handleUnload);
	// 	return () => window.removeEventListener("beforeunload", handleUnload);
	//   }, []);

	// Set User Active to False when Navigating to !publicRoutes and Token Expired
	useEffect(() => {
		// Allow access to public routes like /register
		const publicRoutes = ['/register', '/login', '/login/callback'];
		if (publicRoutes.includes(window.location.pathname)) {
			return;
		}

		const token = localStorage.getItem(ACCESS_TOKEN);

		// If no token is found, navigate to login immediately
		if (!token) {
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
			const token = localStorage.getItem(ACCESS_TOKEN);
			if (!token) {
				return;
			}
	
			// Construct the URL with query parameters
			const url = `/api/user/logout/?active=false&token=${encodeURIComponent(token)}`;
			// Use sendBeacon to send the request
			navigator.sendBeacon(url);
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
            </Routes>
	);
}
