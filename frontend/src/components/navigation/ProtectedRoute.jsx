import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api";

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/api/user/verify-token/', {
                    withCredentials: true
                });

                if (response.status === 200) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error("Token verification failed", error);
                setIsAuthorized(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
