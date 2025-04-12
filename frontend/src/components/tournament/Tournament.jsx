import {GETCheckUsernameExists, POSTcreateMatch, POSTcreateTournament, PATCHAddMatchToTournament, GETTournamentDetails, PATCHAddWinnerToTournament} from "../api-consumer/fetch";
import { useGameSetting } from '../contexts/GameContext';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import LocalGame from "../game/LocalGame";
import myImage from '../navigation/bright-neon-colors-shining-wild-chameleon_23-2151682784.jpg';
import Marvin from './Marvin.jpg';


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
        
      console.log("TournamentData", matches)
      console.log("TournamentSettings", TournamentSettings)
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
      {navigate("/")}
    }

    const handleWinnerSelected = async (matchKey, winnerId) => {
      console.log("WINNER ID: ", winnerId); // Check what's being received
      console.log("Matchk ID: ", matchKey); // Check what's being received

        if (matchKey === "final")          setTournamentComplete(true);
        console.log("WINNER ID: ", winnerId); // Check what's being received
        console.log("Matchk ID: ", matchKey); // Check what's being received
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
    console.log('TournamentSettings: ', TournamentSettings);
    return (
      <div className="tournament-container p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Tournament</h1>
        
        {/* Tournament Bracket Visualization */}
        {(<div className="tournament-bracket flex flex-col items-center mb-8">
          {/* Visualization of the tournament bracket */}
          <div className="bracket-visualization w-full flex flex-col items-center">
            {/* Semifinals */}

            {/* Semifinal 1 */}
            <div className="card mb-3" style={{ backgroundColor: 'transparent', border: 'none' }}>
                <div className="row g-0 align-items-center">
                  {/* Left Image */}
                  <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <img 
                      src={myImage} 
                      alt="..." 
                      style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Text in the center */}
                  <div className="col-md-4 text-center">
                    <div className="card-body" style={{ backgroundColor: 'transparent' }}>
                      <h5 className="card-title">Semifinal 2</h5>
                      <p className="card-text">
                      {getUsernameById(matches.semifinal1.player1)} vs {getUsernameById(matches.semifinal1.player2)}
                      </p>
                      {matches.semifinal2.winner && (<p>
                      Winner: {getUsernameById(matches.semifinal1.winner)}
                      </p>)}
                    </div>
                  </div>

                  {/* Right Image */}
                  <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <img 
                      src={myImage} 
                      alt="..." 
                      style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>

              {/* Semifinal 2 */}
              <div className="card mb-3" style={{ backgroundColor: 'transparent', border: 'none' }}>
                <div className="row g-0 align-items-center">
                  {/* Left Image */}
                  <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <img 
                      src={myImage} 
                      alt="..." 
                      style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Text in the center */}
                  <div className="col-md-4 text-center">
                    <div className="card-body" style={{ backgroundColor: 'transparent' }}>
                      <h5 className="card-title">Semifinal 2</h5>
                      <p className="card-text">
                      {getUsernameById(matches.semifinal2.player1)} vs {getUsernameById(matches.semifinal2.player2)}
                      </p>
                      {matches.semifinal2.winner && (<p>
                      Winner: {getUsernameById(matches.semifinal2.winner)}
                      </p>)}
                    </div>
                  </div>

                  {/* Right Image */}
                  <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <img 
                      src={myImage} 
                      alt="..." 
                      style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>

            {/* Final */}
            <div className="card mb-3" style={{ backgroundColor: 'transparent', border: 'none' }}>
              <div className="row g-0 align-items-center">
                {/* Left Image */}
              
                <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                {((matches.semifinal1.winner  || matches.final.winner) && !(matches.semifinal1.winner  && matches.final.winner))&& (matches.final.winner === matches.semifinal1.winner || !matches.final.winner) &&( <img 
                    src={myImage}
                    alt="..." 
                    style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                  />)}
                </div>

                {/* Text in the center */}
                <div className="col-md-4 text-center">
                  <div className="card-body" style={{ backgroundColor: 'transparent' }}>
                    <h5 className="card-title">Final Match</h5>
                    <p className="card-text">
                    {matches.semifinal1.winner ? getUsernameById(matches.semifinal1.winner) : "To Be Determined.."} vs {matches.semifinal2.winner ? getUsernameById(matches.semifinal2.winner) : "To be Determined"}
                    </p>
                    <p>
                    {matches.final.winner && (<span className="text-green-600 font-bold"> Champion: {getUsernameById(matches.final.winner)} </span>)}
                    </p>
                  </div>
                </div>

                {/* Right Image TODO LOGIC TO FIX*/}
                <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {((matches.semifinal2.winner  || matches.final.winner) && !(matches.semifinal2.winner  && matches.final.winner))
                    && (matches.final.winner === matches.semifinal2.winner || !matches.final.winner) 
                    &&(
                      <img 
                    src={Marvin}
                    alt="..." 
                    style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                  />)}
                </div>
              </div>
            </div>

            
          </div>
        </div>)}
        





        {/* Current Match */}
        <div className="current-match-container">
          
          {!tournamentComplete && currentStage === 'semifinals' && (
            <div className="semifinals-container">
              {!matches.semifinal1.winner && matches.semifinal1.id && (
                <div className="mb-8" >
                  <h3 className="text-lg font-medium mb-2" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>SEMIFINAL ONE</h3>
                  <LocalGame 
                    player1={matches.semifinal1.player1}
                    player2={matches.semifinal1.player2}
                    OnWinnerSelect={(winnerId) => handleWinnerSelected('semifinal1', winnerId)}
                  />
                </div>
              )}
              
              {matches.semifinal1.winner && !matches.semifinal2.winner && matches.semifinal2.id && (
                <div>
                  <h3 className="text-lg font-medium mb-2" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>SEMIFINAL TWO</h3>
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
              <h3 className="text-lg font-medium mb-2" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>FINAL MATCH</h3>
              <LocalGame 
                player1={matches.semifinal1.winner}
                player2={matches.semifinal2.winner}
                OnWinnerSelect={(winnerId) => handleWinnerSelected('final', winnerId)}
              />
            </div>
          )}
          {console.log("TournamentComplete", tournamentComplete)}
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