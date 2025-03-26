import Home from '../pages/Home';
import Login from '../pages/Login';
import Setup2FA from '../pages/Setup2FA';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import Profile from '../pages/Profile';
import Alert from '../components/Alert';
import Game from './game/Game';
import Menu from './game/Menu'; 
import TournamentDetail from './game/TournamentDetail'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

function Logout() {
    localStorage.clear();
    return <Navigate to='/login' />;
}

function RegisterAndLogout() {
    localStorage.clear();
    return <Register route='/api/user/register/' />;
}

export default function RouterSwitch() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login route='/api/token/' />} />
				<Route path="/login/callback" element={<Login route='/api/token/' />} />
                <Route path="/register" element={<RegisterAndLogout />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/setup-2fa" element={<Setup2FA />} />
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/alert" element={<Alert />} />
                <Route path="/game/:tournamentId/:matchId" element={<Game />} />
                <Route path="/tournament" element={<Menu />} /> 
                <Route path="/tournament/:tournamentId" element={<TournamentDetail />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
