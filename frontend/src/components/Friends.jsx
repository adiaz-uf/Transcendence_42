import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { GETfriends, POSTfriend, DELETEfriend, GETCheckUsernameExists, GetOthersActiveness } from '../components/api-consumer/fetch';
import FriendProfileModal from '../components/FriendProfileModal';
import MessageBox from '../components/MessageBox';
import '../styles/friends.css';

export default function Friends() {
    const [friends, setFriends] = useState([]);
    const [newFriendUsername, setNewFriendUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('');
    const [showFriendModal, setShowFriendModal] = useState(false);
    const [friendShow, setFriendShow] = useState('');

    // Fetch friends on component load
    const fetchFriends = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const response = await GETfriends();
            if (response?.error) {
                setMessage(response.error);
                setMessageType("error");
            } else {
                setFriends(response);
            }
        } catch (err) {
            setMessage("Failed to load friends");
            setMessageType("error");
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
            for (const friend of friends) {
                try {
                    const response = await fetch(`http://${window.location.host}:8000/api/users/${friend.username}/status`);
                    const data = await response.json();
                    setFriends(prevFriends => 
                        prevFriends.map(f => 
                            f.username === friend.username 
                                ? { ...f, is_active: data.is_active }
                                : f
                        )
                    );
                } catch (error) {
                    console.error(`Error updating status for ${friend.username}:`, error);
                }
            }
        };

        // Set an interval to update friends' statuses every 10 seconds
        const intervalId = setInterval(updateFriendsStatus, 10000);

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
    }, [friends]);

    const handleAddFriend = async () => {
        if (!newFriendUsername.trim()) {
            setMessage("Please enter a username.");
            setMessageType("info");
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            const userCheck = await GETCheckUsernameExists(newFriendUsername);
            if (userCheck?.exists) {
                const response = await POSTfriend(userCheck.userProfile.username);
                if (response?.error) {
                    setMessage(response.error);
                    setMessageType("error");
                } else {
                    setNewFriendUsername('');
                    await fetchFriends(); // Refresh the friends list first
                    setMessage("Friend added successfully!");
                    setMessageType("success");
                }
            } else {
                setMessage("User not found!!!!!");
                setMessageType("error");
            }
        } catch (error) {
            setMessage("An error occurred while adding the friend.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFriend = async (friendName) => {
        setLoading(true);
        setMessage(null);
        try {
            const response = await DELETEfriend(friendName);
            if (response?.error) {
                setMessage(response.error);
                setMessageType("error");
            } else {
                await fetchFriends(); // Refresh the friends list first
                setMessage("Friend removed successfully!");
                setMessageType("success");
            }
        } catch (error) {
            setMessage("An error occurred while removing the friend.");
            setMessageType("error");
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
            {message && <MessageBox 
                message={message}
                type={messageType}
                onClose={() => setMessage(null)}/>}

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