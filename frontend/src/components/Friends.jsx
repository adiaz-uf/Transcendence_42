import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { GETfriends, POSTfriend, DELETEfriend, GETCheckUsernameExists } from '../components/api-consumer/fetch';
import '../styles/friends.css';

export default function Friends() {
    const [friends, setFriends] = useState([]);
    const [newFriendUsername, setNewFriendUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch friends on component load
    const fetchFriends = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await GETfriends();
            if (response?.error) {
                setError(response.error);
            } else {
                setFriends(response);
            }
        } catch (err) {
            setError("Failed to load friends");
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async () => {
        if (!newFriendUsername.trim()) {
            setError("Please enter a username.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const userCheck = await GETCheckUsernameExists(newFriendUsername);
            if (userCheck?.exists) {
                const response = await POSTfriend(userCheck.userProfile.username);
                if (response?.error) {
                    setError(response.error);
                } else {
                    setNewFriendUsername('');
                    fetchFriends(); // Refresh the friends list
                }
            } else {
                setError("User not found.");
            }
        } catch (error) {
            setError("An error occurred while adding the friend.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFriend = async (friendName) => {
        setLoading(true);
        setError(null);
        try {
            const response = await DELETEfriend(friendName);
            if (response?.error) {
                setError(response.error);
            } else {
                fetchFriends(); // Refresh the friends list
            }
        } catch (error) {
            setError("An error occurred while removing the friend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    return (
        <div className="friends-panel">
            <h3 className="friends-title">Friends</h3>
            {/* {error && <div className="alert alert-danger">{error}</div>} */}

            {/* Add Friend Form */}
            <div className="add-friend-form">
                <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={newFriendUsername}
                    onChange={(e) => setNewFriendUsername(e.target.value)}
                    className="friend-input"
                />
                <Button
                    variant="primary"
                    onClick={handleAddFriend}
                    disabled={loading}
                    className="action-btn"
                >
                    {loading ? <Spinner animation="border" size="sm" /> : "Add Friend"}
                </Button>
            </div>

            {/* Friends List */}
            <div className="friends-list">
                {loading && friends.length === 0 ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : friends.length > 0 ? (
                    friends.map((friend) => (
                        <div key={friend.id} className="friend-item">
                            <span className="friend-name">{friend.username} {friend.active ? "online":"offline"}</span>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveFriend(friend.username, friend.id)}
                                className="action-btn">
                                
                                Remove
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No friends yet. Add some to connect!</p>
                    </div>
                )}
            </div>
        </div>
    );
}