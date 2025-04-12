import {GETCheckUsernameExists, POSTcreateMatch, POSTcreateTournament, PATCHAddMatchToTournament, GETTournamentDetails, PATCHAddWinnerToTournament, PATCHMatchScore, GETOthersProfileInfo} from "../api-consumer/fetch";
import { useGameSetting } from '../contexts/GameContext';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import {useNavigate, useLocation} from "react-router-dom";
import LocalGame from "../game/LocalGame";
import defaultAvatar from '../../components/navigation/chameleon.jpg';
import Marvin from './Marvin.jpg';
import MessageBox from '../MessageBox';
import '../../styles/tournament.css';


export default function Tournament () {
    const {TournamentSettings, getUsernameById, gameSettings} = useGameSetting();
    const location = useLocation();
    
    // General state of tournament only on frontend
    const [matches, setMatches] = useState({
      semifinal1: { id: null, winner: null, player1: TournamentSettings.Player1, player2: TournamentSettings.Player2},
      semifinal2: { id: null, winner: null, player1: TournamentSettings.Player3, player2: TournamentSettings.Player4},
      final: { id: null, winner: null, player1: null, player2: null }
    });
    
    const [currentStage, setCurrentStage] = useState('semifinals'); // Progression of the Tourna
    const [tournamentComplete, setTournamentComplete] = useState(false); // End >(
    const navigate = useNavigate();// to the stars
    const [message, setMessage] = useState(location.state?.message || null);
    const [messageType, setMessageType] = useState(location.state?.type || 'info');
  
    // Add state to track match start times
    const [matchStartTimes, setMatchStartTimes] = useState({
      semifinal1: null,
      semifinal2: null,
      final: null
    });

    // Add state for player avatars
    const [playerAvatars, setPlayerAvatars] = useState({});
  
    // Function to fetch user avatar
    const fetchUserAvatar = async (userId) => {
      try {
        const username = getUsernameById(userId);
        if (!username) return defaultAvatar;
        
        const response = await GETOthersProfileInfo(username);
        return response.avatar || defaultAvatar;
      } catch (error) {
        console.error("Error fetching user avatar:", error);
        return defaultAvatar;
      }
    };

    // Fetch avatars when component mounts or players change
    useEffect(() => {
      const fetchAvatars = async () => {
        const avatars = {};
        const players = [
          TournamentSettings.Player1,
          TournamentSettings.Player2,
          TournamentSettings.Player3,
          TournamentSettings.Player4
        ];
        
        for (const playerId of players) {
          if (playerId) {
            avatars[playerId] = await fetchUserAvatar(playerId);
          }
        }
        
        setPlayerAvatars(avatars);
      };
      
      fetchAvatars();
    }, [TournamentSettings]);
  
    // Create a match and get its ID
    const createMatch = async (player1, player2) => {
      console.log(`Creating match between ${player1} and ${player2}`);
      try {
          const payload = {
            player_left: player1,
            player_right: player2,
            is_multiplayer: true,
            left_score: 0,
            right_score: 0,
            is_started: false,
          };
        const response = await POSTcreateMatch(payload);
        return response.id;
      } catch (error) {
        console.error("Error creating match:", error);
        return null;
      }
    };
  
    // Handle winner selection for a match
    const handleWinnerSelected = async (matchKey, winnerId) => {
      console.log("WINNER ID: ", winnerId); // Check what's being received
      console.log("Matchk ID: ", matchKey); // Check what's being received

        if (matchKey === "final") {
          setTournamentComplete(true);
          console.log("Tournament complete, winner:", winnerId);
        }
        
        setMatches(prev => {
          const match = prev[matchKey];
          const winner =
            winnerId === 'left' ? match.player1 :
            winnerId === 'right' ? match.player2 :
            null;

          return {
            ...prev,
            [matchKey]: {
              ...match,
              winner,
            }
          };
        });

      // Update match scores in the database
      try {
        const matchId = matches[matchKey].id;
        if (matchId) {
          // Get the actual scores from the game state
          const leftScore = winnerId === 'left' ? gameSettings.WINNING_SCORE : 0;
          const rightScore = winnerId === 'right' ? gameSettings.WINNING_SCORE : 0;
          
          // Calculate match duration
          const startTime = matchStartTimes[matchKey];
          const currentTime = Date.now();
          const durationMs = startTime ? currentTime - startTime : 0;
          
          const totalSeconds = Math.floor(durationMs / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          const milliseconds = Math.floor((durationMs % 1000) / 10);
          
          const formattedDuration = 
              `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
          
          // Update the match score in the database
          await PATCHMatchScore(
            matchId,
            rightScore,
            leftScore,
            formattedDuration
          );
          console.log(`✅ Match score updated for ${matchKey} with ID ${matchId}`);
        }
      } catch (error) {
        console.error(`❌ Error updating match score for ${matchKey}:`, error);
      }

      // If both semifinals have winners, set up the final
      if (matchKey.startsWith('semifinal')) {
        const updatedMatches = {
          ...matches,
          [matchKey]: {
            ...matches[matchKey],
            winner: winnerId === 'left' ? matches[matchKey].player1 : matches[matchKey].player2
          }
        };

        if (updatedMatches.semifinal1.winner && updatedMatches.semifinal2.winner && !matches.final.id) {
          console.log('Setting up final match with winners:', {
            player1: updatedMatches.semifinal1.winner,
            player2: updatedMatches.semifinal2.winner
          });
          setCurrentStage('final');

          const finalMatchId = await createMatch(updatedMatches.semifinal1.winner, updatedMatches.semifinal2.winner);
          console.log('Created final match:', finalMatchId);
          
          setMatches(prev => ({
            ...prev,
            final: {
              ...prev.final,
              id: finalMatchId,
              player1: updatedMatches.semifinal1.winner,
              player2: updatedMatches.semifinal2.winner
            }
          }));
        }
      }
    };

    useEffect(() => {
      if (matches.final.winner) {
        setTournamentComplete(true);
      }
    }, [matches.final.winner]);

    // Initialize semifinals when component mounts
    useEffect(() => {
      const initTournament = async () => {
        const semifinal1Id = await createMatch(TournamentSettings.Player1, TournamentSettings.Player2);
        const semifinal2Id = await createMatch(TournamentSettings.Player3, TournamentSettings.Player4);
        
        setMatches(prev => ({
          ...prev,
          semifinal1: { ...prev.semifinal1, id: semifinal1Id },
          semifinal2: { ...prev.semifinal2, id: semifinal2Id }
        }));
        
        // Initialize match start times
        setMatchStartTimes({
          semifinal1: Date.now(),
          semifinal2: null,
          final: null
        });
      };
      
      initTournament();
    }, [TournamentSettings]);
  
    // Update match start time when a new match begins
    useEffect(() => {
      if (currentStage === 'semifinals' && matches.semifinal1.winner && !matches.semifinal2.winner) {
        setMatchStartTimes(prev => ({
          ...prev,
          semifinal2: Date.now()
        }));
      } else if (currentStage === 'final' && matches.final.id && !matches.final.winner) {
        setMatchStartTimes(prev => ({
          ...prev,
          final: Date.now()
        }));
      }
    }, [currentStage, matches.semifinal1.winner, matches.semifinal2.winner, matches.final.id, matches.final.winner]);
  
    // Handle winner selection for a match
    const postAll = async (winnerId) => {
        
      console.log("TournamentData", matches)
      console.log("TournamentSettings", TournamentSettings)
      
      // First, ensure all match scores are updated in the database
      try {
        // Update semifinal 1 scores if not already updated
        if (matches.semifinal1.id && matches.semifinal1.winner) {
          const leftScore = matches.semifinal1.winner === matches.semifinal1.player1 ? gameSettings.WINNING_SCORE : 0;
          const rightScore = matches.semifinal1.winner === matches.semifinal1.player2 ? gameSettings.WINNING_SCORE : 0;
          
          // Calculate match duration
          const startTime = matchStartTimes.semifinal1;
          const currentTime = Date.now();
          const durationMs = startTime ? currentTime - startTime : 0;
          
          const totalSeconds = Math.floor(durationMs / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          const milliseconds = Math.floor((durationMs % 1000) / 10);
          
          const formattedDuration = 
              `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
          
          await PATCHMatchScore(
            matches.semifinal1.id,
            rightScore,
            leftScore,
            formattedDuration
          );
          console.log("✅ Semifinal 1 score updated");
        }
        
        // Update semifinal 2 scores if not already updated
        if (matches.semifinal2.id && matches.semifinal2.winner) {
          const leftScore = matches.semifinal2.winner === matches.semifinal2.player1 ? gameSettings.WINNING_SCORE : 0;
          const rightScore = matches.semifinal2.winner === matches.semifinal2.player2 ? gameSettings.WINNING_SCORE : 0;
          
          // Calculate match duration
          const startTime = matchStartTimes.semifinal2;
          const currentTime = Date.now();
          const durationMs = startTime ? currentTime - startTime : 0;
          
          const totalSeconds = Math.floor(durationMs / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          const milliseconds = Math.floor((durationMs % 1000) / 10);
          
          const formattedDuration = 
              `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
          
          await PATCHMatchScore(
            matches.semifinal2.id,
            rightScore,
            leftScore,
            formattedDuration
          );
          console.log("✅ Semifinal 2 score updated");
        }
        
        // Update final match scores
        if (matches.final.id && matches.final.winner) {
          const leftScore = matches.final.winner === matches.final.player1 ? gameSettings.WINNING_SCORE : 0;
          const rightScore = matches.final.winner === matches.final.player2 ? gameSettings.WINNING_SCORE : 0;
          
          // Calculate match duration
          const startTime = matchStartTimes.final;
          const currentTime = Date.now();
          const durationMs = startTime ? currentTime - startTime : 0;
          
          const totalSeconds = Math.floor(durationMs / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          const milliseconds = Math.floor((durationMs % 1000) / 10);
          
          const formattedDuration = 
              `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
          
          await PATCHMatchScore(
            matches.final.id,
            rightScore,
            leftScore,
            formattedDuration
          );
          console.log("✅ Final match score updated");
        }
      } catch (error) {
        console.error("❌ Error updating match scores:", error);
      }
      
      // Now proceed with tournament completion
      let tmp = "This is a temporary value used for logging"
      tmp = await PATCHAddMatchToTournament(TournamentSettings.tournamentId, matches.semifinal1.id);
      console.log("Tournament", tmp)
      tmp = await PATCHAddMatchToTournament(TournamentSettings.tournamentId, matches.semifinal2.id);
      console.log("Tournament", tmp)
      tmp = await PATCHAddMatchToTournament(TournamentSettings.tournamentId, matches.final.id);
      console.log("Tournament", tmp)
      tmp = await PATCHAddWinnerToTournament(TournamentSettings.tournamentId, winnerId);
      console.log("Tournament", tmp)
      tmp = await GETTournamentDetails(TournamentSettings.tournamentId);
      console.log("Tournament", tmp)
      const championUsername = getUsernameById(winnerId);
      navigate("/", { 
        state: { 
          message: `Congratulations to ${championUsername} for winning the tournament! 🏆`,
          type: 'success'
        }
      });
    }
    
    // Get username by player ID
    
    console.log('Tournament Complete: ', tournamentComplete);
    console.log('Current Stage: ', currentStage);
    console.log('TournamentSettings: ', TournamentSettings);
    return (
      <div className="tournament-container">
        {message && (
          <MessageBox
            message={message}
            type={messageType}
            onClose={() => setMessage(null)}
          />
        )}
        <h1 className="text-2xl font-bold mb-6 text-center">Tournament</h1>
        
        <div className="tournament-bracket">
          <div className="bracket-visualization">
            {/* Semifinal 1 */}
            <div className="tournament-card">
                <div className="row g-0 align-items-center">
                  <div className="col-md-4 d-flex justify-content-center align-items-center">
                    <img 
                      src={playerAvatars[matches.semifinal1.player1] || defaultAvatar} 
                      alt="..." 
                      className="tournament-avatar"
                    />
                  </div>

                  <div className="col-md-4 text-center">
                    <div className="tournament-card-body">
                      <h5 className="tournament-card-title">Semifinal 1</h5>
                      <p className="tournament-card-text">
                      {getUsernameById(matches.semifinal1.player1)} vs {getUsernameById(matches.semifinal1.player2)}
                      </p>
                      {matches.semifinal1.winner && (<p>
                      Winner: {getUsernameById(matches.semifinal1.winner)}
                      </p>)}
                    </div>
                  </div>

                  <div className="col-md-4 d-flex justify-content-center align-items-center">
                    <img 
                      src={playerAvatars[matches.semifinal1.player2] || defaultAvatar} 
                      alt="..." 
                      className="tournament-avatar"
                    />
                  </div>
                </div>
              </div>

              {/* Semifinal 2 */}
              <div className="tournament-card">
                <div className="row g-0 align-items-center">
                  <div className="col-md-4 d-flex justify-content-center align-items-center">
                    <img 
                      src={playerAvatars[matches.semifinal2.player1] || defaultAvatar} 
                      alt="..." 
                      className="tournament-avatar"
                    />
                  </div>

                  <div className="col-md-4 text-center">
                    <div className="tournament-card-body">
                      <h5 className="tournament-card-title">Semifinal 2</h5>
                      <p className="tournament-card-text">
                      {getUsernameById(matches.semifinal2.player1)} vs {getUsernameById(matches.semifinal2.player2)}
                      </p>
                      {matches.semifinal2.winner && (<p>
                      Winner: {getUsernameById(matches.semifinal2.winner)}
                      </p>)}
                    </div>
                  </div>

                  <div className="col-md-4 d-flex justify-content-center align-items-center">
                    <img 
                      src={playerAvatars[matches.semifinal2.player2] || defaultAvatar} 
                      alt="..." 
                      className="tournament-avatar"
                    />
                  </div>
                </div>
              </div>

            {/* Final */}
            <div className="tournament-card">
              <div className="row g-0 align-items-center">
                <div className="col-md-4 d-flex justify-content-center align-items-center">
                  {matches.semifinal1.winner && (
                    <img 
                      src={playerAvatars[matches.semifinal1.winner] || defaultAvatar}
                      alt="..." 
                      className="tournament-avatar"
                    />
                  )}
                </div>

                <div className="col-md-4 text-center">
                  <div className="tournament-card-body">
                    <h5 className="tournament-card-title">Final Match</h5>
                    <p className="tournament-card-text">
                    {matches.semifinal1.winner ? getUsernameById(matches.semifinal1.winner) : "To Be Determined"} vs {matches.semifinal2.winner ? getUsernameById(matches.semifinal2.winner) : "To Be Determined"}
                    </p>
                    {matches.final.winner && (<p>
                    Winner: {getUsernameById(matches.final.winner)}
                    </p>)}
                  </div>
                </div>

                <div className="col-md-4 d-flex justify-content-center align-items-center">
                  {matches.semifinal2.winner && (
                    <img 
                      src={playerAvatars[matches.semifinal2.winner] || defaultAvatar}
                      alt="..." 
                      className="tournament-avatar"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tournament-match-container">
          {!tournamentComplete && currentStage === 'semifinals' && (
            <div className="semifinals-container">
              {!matches.semifinal1.winner && matches.semifinal1.id && (
                <div className="mb-8">
                  <h3 className="tournament-match-title">SEMIFINAL ONE</h3>
                  <LocalGame 
                    player1={matches.semifinal1.player1}
                    player2={matches.semifinal1.player2}
                    OnWinnerSelect={(winnerId) => handleWinnerSelected('semifinal1', winnerId)}
                  />
                </div>
              )}
              
              {matches.semifinal1.winner && !matches.semifinal2.winner && matches.semifinal2.id && (
                <div>
                  <h3 className="tournament-match-title">SEMIFINAL TWO</h3>
                  <LocalGame 
                    player1={matches.semifinal2.player1}
                    player2={matches.semifinal2.player2}
                    OnWinnerSelect={(winnerId) => handleWinnerSelected('semifinal2', winnerId)}
                  />
                </div>
              )}
            </div>
          )}
          
          {currentStage === 'final' && !tournamentComplete && matches.final.id && (
            <div className="final-container">
              <h3 className="tournament-match-title">FINAL MATCH</h3>
              <LocalGame 
                player1={matches.final.player1}
                player2={matches.final.player2}
                OnWinnerSelect={(winnerId) => handleWinnerSelected('final', winnerId)}
              />
            </div>
          )}

          {tournamentComplete && (
            <div className="tournament-results">
              <h3>Tournament Complete!</h3>
              <p>Congratulations to {getUsernameById(matches.final.winner)}, our champion!</p>
              <button className="tournament-button" onClick={() => postAll(matches.final.winner)}>
                Return to Menu
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };