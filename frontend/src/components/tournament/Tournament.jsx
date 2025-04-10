import { useTournamentSetting } from '../contexts/TournamentContext';
import React, { useState } from 'react';

const Tournament = () =>
    {
        const [player1username, setPlayer1username] = useState("");                   //de momento necessario porque no se si puede cambiar la orden de accesso de backend
        const [player2username, setPlayer2username] = useState("");
        const [player3username, setPlayer3username] = useState("");
        const [player4username, setPlayer4username] = useState("");
        const [winner1, setwinner1] = useState("");
        const [winner2, setwinner2] = useState("");
        {
            // [] Get usernames
            
            // [] POST match
                        //let payload1 = {
                        //    player_left: player_1_id,
                        //    player_right: player_2.id,
                        //    is_multiplayer: true,
                        //    left_score: 0,
                        //    right_score: 0,
                        //    is_started: false,
                        //  };
                        //  const LocalMatchResponse = await POSTcreateMatch(payload1);

            // [] PATCH add match to tournament
                        //const result = await PATCHAddMatchToTournament(tournament.id, match.id);

            // [] Launch match one (needs to be slightly different than 
            // the game logic used in the local game as we need to not got to menu when it ends and reload for the next game)

            // [] set winner1 to match winner
                        //const TournamentResponse2 =  await PATCHAddWinnerToTournament(TournamentResponse4.id, player_3.userProfile.id);


            // [] POST match

            // [] PATCH add match to tournament

            // [] Launch match two

            // [] set winner2 to match winner

            // [] POST match

            // [] PATCH add match to tournament
              
            // [] Launch final

            // [] PATCH set winner to be tournament winner.
        }
    }

export default Tournament; 