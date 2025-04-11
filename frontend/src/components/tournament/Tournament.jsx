import {GETCheckUsernameExists, POSTcreateMatch, POSTcreateTournament, PATCHAddMatchToTournament, GETTournamentDetails, PATCHAddWinnerToTournament} from "../api-consumer/fetch";
import { useGameSetting } from '../contexts/GameContext';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import LocalGame from "../game/LocalGame";

export default function Tournament () {
    const {TournamentSettings, getUsernameById} = useGameSetting();
    
    // General state of tournament only on frontend
    const [matches, setMatches] = useState({
      semifinal1: { id: null, winner: null, player1: TournamentSettings.Player1, player2: TournamentSettings.Player2},
      semifinal2: { id: null, winner: null, player1: TournamentSettings.Player3, player2: TournamentSettings.Player4},
      final: { id: null, winner: null, player1: null, player2: null }
    });
    
    const [currentStage, setCurrentStage] = useState('semifinals'); // Progression of the Tourna
    const [tournamentComplete, setTournamentComplete] = useState(false); // End >(
    const navigate = useNavigate();// to the stars
  
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
    const postAll = async (winnerId) => {
      let tmp = "This is a temporary value used for logging"
      tmp = await PATCHAddMatchToTournament(TournamentSettings.tournamentId, matches.semifinal1.id);
      tmp = await PATCHAddMatchToTournament(TournamentSettings.tournamentId, matches.semifinal2.id);
      tmp = await PATCHAddMatchToTournament(TournamentSettings.tournamentId, matches.final.id);
      tmp = await PATCHAddWinnerToTournament(TournamentSettings.tournamentId, winnerId);
      tmp = await GETTournamentDetails(TournamentSettings.tournamentId);
      console.log("Tournament", tmp)
      navigate("/menu")
    }

    const handleWinnerSelected = async (matchKey, winnerId) => {
        console.log("WINNER ID: ", winnerId); // Check what's being received

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
      // If both semifinals have winners, set up the final
        if (matchKey.startsWith('semifinal') && matches.semifinal1.winner && !matches.semifinal2.winner) {
        setCurrentStage('final');
        const finalMatchId = await createMatch(matches.semifinal1.winner, matches.semifinal2.winner);
        console.log('POSt Final match', finalMatchId);
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
        // PATCH TO DB TOURNAMENTS
      };
      
      initTournament();
    }, [TournamentSettings]);
  
    // Get username by player ID
    
    console.log('Tournament Complete: ', tournamentComplete);
    console.log('Current Stage: ', currentStage);
    return (
      <div className="tournament-container p-4 max-w-4xl mx-auto">
        {console.log("Tournament Settings", TournamentSettings)}
        {console.log("Matches", matches)}
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
                  <span>{getUsernameById(matches.semifinal1.player1)} vs {getUsernameById(matches.semifinal1.player2)}</span>
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
                  <span>{getUsernameById(matches.semifinal2.player1)} vs {getUsernameById(matches.semifinal2.player2)}</span>
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
                <span>{matches.semifinal1.winner ? getUsernameById(matches.semifinal1.winner) : "To Be Determined.."} vs {matches.semifinal2.winner ? getUsernameById(matches.semifinal2.winner) : "To be Determined"}</span>
              </div>
              <div className="winner text-center mt-2">
                {matches.final.winner && (
                  <span className="text-green-600 font-bold"> Champion: {getUsernameById(matches.final.winner)} </span>
                )}
              </div>
            </div> 
          </div>
        </div>
        
        {/* Current Match */}
        <div className="current-match-container">
          
          {!tournamentComplete && currentStage === 'semifinals' && (
            <div className="semifinals-container">
              {!matches.semifinal1.winner && matches.semifinal1.id && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-2">Semifinal 1</h3>
                  <LocalGame 
                    player1={matches.semifinal1.player1}
                    player2={matches.semifinal1.player2}
                    OnWinnerSelect={(winnerId) => handleWinnerSelected('semifinal1', winnerId)}
                  />
                </div>
              )}
              
              {matches.semifinal1.winner && !matches.semifinal2.winner && matches.semifinal2.id && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Semifinal 2</h3>
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
              <h3 className="text-lg font-medium mb-2">Championship Match</h3>
              <LocalGame 
                player1={matches.semifinal1.winner}
                player2={matches.semifinal2.winner}
                OnWinnerSelect={(winnerId) => handleWinnerSelected('final', winnerId)}
              />
            </div>
          )}
          
          {tournamentComplete && (
            <div className="tournament-results text-center p-6 bg-green-50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Tournament Complete!</h3>
              <p className="text-xl mb-6"> Congratulations to {getUsernameById(matches.final.winner)}, our champion! </p>
              <button className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700" onClick={() => postAll(matches.final.winner)} >
                Return to Menu
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };