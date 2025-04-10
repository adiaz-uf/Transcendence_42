import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../styles/gameOverModal.css'

export default function GameOverModal({ 
  showModal, 
  handleCloseModal, 
  player1, 
  player2, 
  score1, 
  score2, 
  matchId, 
  gameStartTime, 
  updateMatchScore 
}) {
    const Player1Name = (player1 || 'Guest');
    const Player2Name = (player2 || 'Bot');

    // Log debug information when props change
    useEffect(() => {
        console.log("🎮 GameOverModal rendered with:", {
            showModal,
            matchId,
            gameStartTime,
            player1: Player1Name,
            player2: Player2Name,
            score1,
            score2,
            hasUpdateFunction: !!updateMatchScore
        });

        // Try to update the match score when the modal is shown
        if (showModal && matchId && gameStartTime && updateMatchScore) {
            console.log("🎮 Conditions met for auto-updating match score");
            updateMatchScore();
        } else if (showModal) {
            console.log("🎮 Cannot update match score - missing required data:",
                {hasMatchId: !!matchId, hasGameStartTime: !!gameStartTime, hasUpdateFunction: !!updateMatchScore});
        }
    }, [showModal, matchId, gameStartTime, updateMatchScore]);

    // Handle manual update button click
    const handleManualUpdate = () => {
        console.log("🎮 Manual update button clicked");
        if (updateMatchScore) {
            console.log("🎮 Calling updateMatchScore manually");
            updateMatchScore();
        } else {
            console.error("🎮 updateMatchScore function is not available");
        }
    };

    return (
      <Modal show={showModal} onHide={handleCloseModal} dialogClassName="custom-modal" centered>
        <Modal.Header closeButton className="custom-modal-header">
          <Modal.Title>Game Over!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body">
          <p className="winner-text">
            {Player1Name ? Player1Name : 'Guest'} <strong>{score1}</strong> - <strong>{score2}</strong> {Player2Name ? Player2Name : 'Bot'}
          </p>
          <p className="winner-text">
            <strong>{score1 > score2 ? Player1Name : Player2Name}</strong> is the winner! 🎉
          </p>
          {/* Debug info and manual update button */}
          <div style={{ marginBottom: '15px', fontSize: '0.8em', color: '#666' }}>
            <p>Match ID: {matchId || 'Not available'}</p>
            <p>Game started: {gameStartTime ? new Date(gameStartTime * 1000).toLocaleTimeString() : 'Not recorded'}</p>
            {updateMatchScore && (
              <Button 
                variant="warning" 
                size="sm" 
                onClick={handleManualUpdate} 
                style={{ marginBottom: '10px' }}
              >
                Update Match Data Manually
              </Button>
            )}
          </div>
          <Button variant="primary" onClick={handleCloseModal} className="custom-close-button">
            Close
          </Button>
        </Modal.Body>
      </Modal>
    );
}
