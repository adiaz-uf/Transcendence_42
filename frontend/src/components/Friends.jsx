import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { GETfriends, POSTfriend, DELETEfriend, GETCheckUsernameExists, GetOthersActiveness } from '../components/api-consumer/fetch';
import FriendProfileModal from '../components/FriendProfileModal';
import '../styles/friends.css';

export default function Friends() {
    const [friends, setFriends] = useState([]);
    const [newFriendUsername, setNewFriendUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFriendModal, setShowFriendModal] = useState(false);
    const [friendShow, setFriendShow] = useState('');




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

      // Periodically update friends active status
      useEffect(() => {
        if (!Array.isArray(friends) || friends.length === 0) {
            return;
        }
        const updateFriendsStatus = async () => {
            console.log("Updating friends' status...");
            if (friends.length === 0) return; // No friends to update
            const updatedFriends = await Promise.all(
                friends.map(async (friend) => {
                    try {
                        const response = await GetOthersActiveness(friend.username);
                        if (response?.data) {
                            return { ...friend, active: response.data.active }; // Update active status
                        }
                        return friend; // Return the original friend if no response
                    } catch (error) {
                        console.error(`Error updating status for ${friend.username}:`, error);
                        return friend; // Return the original friend on error
                    }
                })
            );
            setFriends(updatedFriends); // Update the friends state with the new statuses
        };

        // Set an interval to update friends' statuses every 10 seconds

        const intervalId = setInterval(updateFriendsStatus, 10000);

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
    }, [friends]);

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

    const handleShowFriendProfile = (user) => {
        setShowFriendModal(true);
        setFriendShow(user);
      };
    
      const handleCloseFriendModal = () => {
        setShowFriendModal(false);
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
                    className="addfriend-btn"
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
                            <span className="friend-name">UserName: {friend.username} 
                                <span className={`friend-state ${friend.active ? "online" : "offline"}`}>
                                    {friend.active ? "online" : "offline"}
                                </span>
                            </span>
                            <div style={{"display":"flex"}}>
                            <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleShowFriendProfile(friend.username)}
                                className="action-btn m-3">
                                View Profile
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveFriend(friend.username, friend.id)}
                                className="action-btn m-3">
                                Remove
                            </Button>
                            </div>
                            <FriendProfileModal 
                                show={showFriendModal} 
                                handleClose={handleCloseFriendModal} 
                                user={friendShow}
                            />
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