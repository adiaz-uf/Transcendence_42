import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../api";
import { useState, useEffect } from "react";


function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false))// eslint-disable-next-line
    }, [])

    const refreshToken = async () => {
        const refreshToken = getCookie('refresh_token'); // Obtenemos el refresh_token de las cookies
    
        if (!refreshToken) {
            setIsAuthorized(false);
            return;
        }
        try {
            const response = await fetch('/api/user/refresh/', {
                method: 'POST',
                credentials: 'include', // Esto incluye cookies
            });
    
            const data = await response.json();
            if (data.access) {
                document.cookie = `access_token=${data.access}; path=/;`;
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error('Error al refrescar el token:', error);
            setIsAuthorized(false);
        }
    };

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const auth = async () => {
        const token = getCookie('access_token');
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
        }
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;