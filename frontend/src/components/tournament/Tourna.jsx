import { useTournamentSetting } from '../contexts/TournamentContext';
import {GETCheckUsernameExists, POSTcreateMatch, POSTcreateTournament, PATCHAddMatchToTournament, GETTournamentDetails, PATCHAddWinnerToTournament} from "../api-consumer/fetch";
import { useGameSetting } from '../contexts/GameContext';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import {useNavigate} from "react-router-dom";

export default Tourna = () => {
    const {
      tournamentId,
      Player1, Player2, Player3, Player4,
      Player1username, Player2username, Player3username, Player4username
    } = useTournamentSetting();
    
    // General state of tournament only on frontend
    const [matches, setMatches] = useState({
      semifinal1: { id: null, winner: null, player1: Player1, player2: Player2 },
      semifinal2: { id: null, winner: null, player1: Player3, player2: Player4 },
      final: { id: null, winner: null, player1: null, player2: null }
    });
    
    const [currentStage, setCurrentStage] = useState('semifinals'); // Progression of the Tourna
    const [tournamentComplete, setTournamentComplete] = useState(false); // End >(
    const navigate = useNavigate();// to the stars
  
    // Create a match and get its ID
    const createMatch = async (player1, player2) => {
    // BTW we post macthes at creation for allowing internal handling through websocket or simple patches during game, not at end. The end is not a creation, for better arch it is an update
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
      setMatches(prev => ({
        ...prev,
        [matchKey]: {
          ...prev[matchKey],
          winner: winnerId
        }
      }));
  
      // If both semifinals have winners, set up the final
      if (matchKey.startsWith('semifinal') && matches.semifinal1.winner && matches.semifinal2.winner) {
        setCurrentStage('final');
        const finalMatchId = await createMatch(matches.semifinal1.winner, matches.semifinal2.winner);
        
        setMatches(prev => ({
          ...prev,
          final: {
            ...prev.final,
            id: finalMatchId,
            player1: matches.semifinal1.winner,
            player2: matches.semifinal2.winner
          }
        }));
      }
      
      // If final has a winner, tournament is complete
      if (matchKey === 'final') {
        setTournamentComplete(true);
      }
    };
  
    // Initialize semifinals when component mounts
    useEffect(() => {
      const initTournament = async () => {
        const semifinal1Id = await createMatch(Player1, Player2);
        const semifinal2Id = await createMatch(Player3, Player4);
        
        setMatches(prev => ({
          ...prev,
          semifinal1: { ...prev.semifinal1, id: semifinal1Id },
          semifinal2: { ...prev.semifinal2, id: semifinal2Id }
        }));
      };
      
      initTournament();
    }, [Player1, Player2, Player3, Player4]);
  
    // Get username by player ID
    const getUsernameById = (playerId) => {
      const playerMap = {
        [Player1]: Player1username,
        [Player2]: Player2username,
        [Player3]: Player3username,
        [Player4]: Player4username
      };
      return playerMap[playerId] || "Unknown Player";
    };
  
    return (
      <div className="tournament-container p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Tournament</h1>
        
        {/* Tournament Bracket Visualization */}
        <div className="tournament-bracket flex flex-col items-center mb-8">
          {/* Visualization of the tournament bracket */}
          <div className="bracket-visualization w-full flex flex-col items-center">
            {/* Semifinals */}
            <div className="semifinals flex justify-around w-full mb-12">
              <div className="semifinal-match p-2 border border-gray-300 rounded w-1/3">
                <h3 className="text-center font-semibold mb-2">Semifinal 1</h3>
                <div className="player-names flex justify-between">
                  <span>{getUsernameById(matches.semifinal1.player1)}</span>
                  <span>vs</span>
                  <span>{getUsernameById(matches.semifinal1.player2)}</span>
                </div>
                <div className="winner text-center mt-2">
                  {matches.semifinal1.winner && (
                    <span className="text-green-600">
                      Winner: {getUsernameById(matches.semifinal1.winner)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="semifinal-match p-2 border border-gray-300 rounded w-1/3">
                <h3 className="text-center font-semibold mb-2">Semifinal 2</h3>
                <div className="player-names flex justify-between">
                  <span>{getUsernameById(matches.semifinal2.player1)}</span>
                  <span>vs</span>
                  <span>{getUsernameById(matches.semifinal2.player2)}</span>
                </div>
                <div className="winner text-center mt-2">
                  {matches.semifinal2.winner && (
                    <span className="text-green-600">
                      Winner: {getUsernameById(matches.semifinal2.winner)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Final */}
            <div className="final-match p-2 border border-gray-300 rounded w-1/3">
              <h3 className="text-center font-semibold mb-2">Final</h3>
              <div className="player-names flex justify-between">
                <span>
                  {matches.final.player1 ? getUsernameById(matches.final.player1) : "TBD"}
                </span>
                <span>vs</span>
                <span>
                  {matches.final.player2 ? getUsernameById(matches.final.player2) : "TBD"}
                </span>
              </div>
              <div className="winner text-center mt-2">
                {matches.final.winner && (
                  <span className="text-green-600 font-bold">
                    Champion: {getUsernameById(matches.final.winner)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Current Match */}
        <div className="current-match-container">
          <h2 className="text-xl font-semibold mb-4 text-center">
            {currentStage === 'semifinals' ? 
              'Semifinals' : 
              currentStage === 'final' ? 'Final Match' : 'Tournament Complete'}
          </h2>
          
          {!tournamentComplete && currentStage === 'semifinals' && (
            <div className="semifinals-container">
              {!matches.semifinal1.winner && matches.semifinal1.id && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-2">Semifinal 1</h3>
                  <LocalGame 
                    matchId={matches.semifinal1.id}
                    player1={matches.semifinal1.player1}
                    player2={matches.semifinal1.player2}
                    onWinnerSelected={(winnerId) => handleWinnerSelected('semifinal1', winnerId)}
                  />
                </div>
              )}
              
              {!matches.semifinal2.winner && matches.semifinal2.id && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Semifinal 2</h3>
                  <LocalGame 
                    matchId={matches.semifinal2.id}
                    player1={matches.semifinal2.player1}
                    player2={matches.semifinal2.player2}
                    onWinnerSelected={(winnerId) => handleWinnerSelected('semifinal2', winnerId)}
                  />
                </div>
              )}
            </div>
          )}
          
          {currentStage === 'final' && !tournamentComplete && matches.final.id && (
            <div className="final-container">
              <h3 className="text-lg font-medium mb-2">Championship Match</h3>
              <LocalGame 
                matchId={matches.final.id}
                player1={matches.final.player1}
                player2={matches.final.player2}
                onWinnerSelected={(winnerId) => handleWinnerSelected('final', winnerId)}
              />
            </div>
          )}
          
          {tournamentComplete && (
            <div className="tournament-results text-center p-6 bg-green-50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Tournament Complete!</h3>
              <p className="text-xl mb-6">
                Congratulations to {getUsernameById(matches.final.winner)}, our champion!
              </p>
              <button 
                className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
                onClick={() => navigate('/tournaments')}
              >
                Return to Tournaments
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };