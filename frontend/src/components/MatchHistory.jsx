import React, { useState, useEffect } from "react";
import { GetListMatchesFromIdWithScore } from "../components/api-consumer/fetch";
import "../styles/matchHistory.css";

export default function MatchHistory({ username }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch match history on component load
    useEffect(() => {
        const fetchMatchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await GetListMatchesFromIdWithScore(username);
                if (response?.data) {
                    // Sort matches by date (most recent first)
                    console.log("Fetched matches:", response.data.matches);
                    setMatches(response.data.matches);
                } else {
                    setError("Failed to fetch match history.");
                }
            } catch (err) {
                console.error("Error fetching match history:", err);
                setError("An error occurred while fetching match history.");
            } finally {
                setLoading(false);
            }
        };

        fetchMatchHistory();
    }, [username]);

    return (
        <div className="match-history-container">
            <h2 className="match-history-title">Match History</h2>
            {loading ? (
                <p>Loading match history...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : matches.length === 0 ? (
                <p>No matches found.</p>
            ) : (
                <div className="match-list">
                    {matches.map((ValueInArray) => (
                        <div key={ValueInArray.match.id} className="match-item">
                            <div className="match-header">
                                <span className="match-date">
                                    {new Date(ValueInArray.match.date).toLocaleString()}
                                </span>
                                <span className={`match-type ${ValueInArray.match.is_multiplayer ? "multiplayer" : "singleplayer"}`}>
                                    {ValueInArray.match.is_multiplayer ? "Multiplayer" : "Singleplayer"}
                                </span>
                            </div>
                            <div className="match-details">
                                <span className="player">
                                    <strong>{ValueInArray.match.player_left_username}</strong> ({ValueInArray.match.left_score})
                                </span>
                                <span className="vs">vs</span>
                                <span className="player">
                                    <strong>{ValueInArray.match.player_right_username}</strong> ({ValueInArray.match.right_score})
                                </span>
                            </div>
                            <div className="match-duration">
                                Duration: {ValueInArray.match.match_duration || "N/A"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}