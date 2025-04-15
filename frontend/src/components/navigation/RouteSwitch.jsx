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
            await api.post("/api/user/normal-logout/");
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

    // Verificar la validez del token directamente en el backend.
    useEffect(() => {
        // Allow access to public routes like /register
        const publicRoutes = ['/register', '/login', '/login/callback'];
        if (publicRoutes.includes(window.location.pathname)) {
            return;
        }

        // Realiza una solicitud para verificar si el token es válido
        const verifyToken = async () => {
            try {
                const response = await api.get('/api/user/verify-token/', { withCredentials: true });

                // Si la respuesta es válida, se permite el acceso
                if (response.status === 200) {
                    console.log("Token is valid.");
                }
            } catch (error) {
                console.log("Token verification failed.", error);
                setUserActive(false);
                localStorage.clear();
                navigate('/login');
            }
        };

        // Llamar la función para verificar el token
        verifyToken();
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
