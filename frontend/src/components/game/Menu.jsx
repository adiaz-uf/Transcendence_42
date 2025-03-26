import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
    const [tournaments, setTournaments] = useState([]);
    const [tournamentName, setTournamentName] = useState('');
    const [numTeams, setNumTeams] = useState(4);
    const [teams, setTeams] = useState(Array(4).fill({ player1: '', player2: '' }));
    const [error, setError] = useState(null); // Add error state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await api.get('/api/tournament/');
                setTournaments(response.data);
            } catch (error) {
                console.error('Error fetching tournaments:', error);
            }
        };
        fetchTournaments();
    }, []);

    const handleTeamChange = (index, field, value) => {
        const newTeams = [...teams];
        newTeams[index][field] = value;
        setTeams(newTeams);
    };

    const handleCreateTournament = async (e) => {
        e.preventDefault();
        setError(null); // Reset error state
        try {
            // Create the tournament
            const tournamentResponse = await api.post('/api/tournament/create/', {
                name: tournamentName,
            });
            const tournamentId = tournamentResponse.data.id;

            // Create teams
            const teamIds = [];
            for (const team of teams) {
                const player1Id = parseInt(team.player1);
                if (!team.player1 || isNaN(player1Id)) {
                    throw new Error(`Player 1 ID for Team ${teamIds.length + 1} must be a valid number`);
                }
                const teamResponse = await api.post('/api/team/', {
                    name: `Team ${team.player1}`,
                    player1_id: player1Id,
                    player2_id: team.player2 ? parseInt(team.player2) : null,
                });
                teamIds.push(teamResponse.data.id);
            }

            // Add teams to the tournament
            await api.post(`/api/tournament/${tournamentId}/add_teams/`, { team_ids: teamIds });

            // Generate initial matches
            await api.post(`/api/tournament/${tournamentId}/generate_matches/`);

            // Navigate to tournament details
            navigate(`/tournament/${tournamentId}`);
        } catch (error) {
            console.error('Error creating tournament:', error);
            if (error.response && error.response.data) {
                setError(JSON.stringify(error.response.data)); // Show specific backend error
            } else {
                setError(error.message || 'Failed to create tournament');
            }
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f0f0f0' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>Tournaments</h1>
            <h2 style={{ color: '#555' }}>Existing Tournaments</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {tournaments.map(tournament => (
                    <li key={tournament.id}>
                        <button
                            onClick={() => navigate(`/tournament/${tournament.id}`)}
                            style={{ margin: '5px 0', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
                        >
                            {tournament.name}
                        </button>
                    </li>
                ))}
            </ul>
            <h2 style={{ color: '#555' }}>Create a New Tournament</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleCreateTournament}>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ color: '#333' }}>
                        Tournament Name:
                        <input
                            type="text"
                            value={tournamentName}
                            onChange={(e) => setTournamentName(e.target.value)}
                            required
                            style={{ marginLeft: '10px', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ color: '#333' }}>
                        Number of Teams:
                        <input
                            type="number"
                            value={numTeams}
                            onChange={(e) => {
                                const count = parseInt(e.target.value);
                                setNumTeams(count);
                                setTeams(Array(count).fill({ player1: '', player2: '' }));
                            }}
                            min="2"
                            required
                            style={{ marginLeft: '10px', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                        />
                    </label>
                </div>
                {teams.map((team, index) => (
                    <div key={index} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '5px' }}>
                        <h3 style={{ color: '#333' }}>Team {index + 1}</h3>
                        <label style={{ color: '#333' }}>
                            Player 1 ID:
                            <input
                                type="number"
                                value={team.player1}
                                onChange={(e) => handleTeamChange(index, 'player1', e.target.value)}
                                required
                                style={{ marginLeft: '10px', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                        </label>
                        <label style={{ marginLeft: '20px', color: '#333' }}>
                            Player 2 ID (optional):
                            <input
                                type="number"
                                value={team.player2}
                                onChange={(e) => handleTeamChange(index, 'player2', e.target.value)}
                                style={{ marginLeft: '10px', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                        </label>
                    </div>
                ))}
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
                    Create Tournament
                </button>
            </form>
        </div>
    );
};

export default Menu;
