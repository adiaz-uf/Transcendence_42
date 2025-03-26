import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const TournamentDetail = () => {
    const { tournamentId } = useParams();
    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await api.get(`/api/tournament/${tournamentId}/`);
                setTournament(response.data);
            } catch (error) {
                console.error('Error fetching tournament:', error);
            }
        };
        const fetchMatches = async () => {
            try {
                const response = await api.get(`/api/match/list/?tournament_id=${tournamentId}`);
                setMatches(response.data);
            } catch (error) {
                console.error('Error fetching matches:', error);
            }
        };
        fetchTournament();
        fetchMatches();
    }, [tournamentId]);

    const handleStartMatch = (matchId) => {
        navigate(`/game/${tournamentId}/${matchId}`);
    };

    if (!tournament) return <div style={{ padding: '20px', textAlign: 'center', color: '#333' }}>Loading...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f0f0f0' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>{tournament.name}</h1>
            <h2 style={{ color: '#555' }}>Teams</h2>
            <ul style={{ listStyle: 'none', padding: '0' }}>
                {tournament.teams?.map(team => (
                    <li key={team.id} style={{ padding: '5px', backgroundColor: '#fff', marginBottom: '5px', borderRadius: '5px', color: '#333' }}>
                        {team.name}
                    </li>
                ))}
            </ul>
            <h2 style={{ color: '#555' }}>Matches</h2>
            <ul style={{ listStyle: 'none', padding: '0' }}>
                {matches.map(match => (
                    <li key={match.id} style={{ padding: '10px', backgroundColor: '#fff', marginBottom: '5px', borderRadius: '5px', color: '#333' }}>
                        {match.team_left.name} vs {match.team_right.name}
                        {match.winner ? (
                            <span style={{ marginLeft: '10px', color: '#28a745' }}> - Winner: {match.winner.name}</span>
                        ) : (
                            <button
                                onClick={() => handleStartMatch(match.id)}
                                style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
                            >
                                Start Match
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TournamentDetail;
