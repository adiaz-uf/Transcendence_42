import { useTournamentSetting } from '../contexts/TournamentContext';
import {GETCheckUsernameExists, POSTcreateMatch, POSTcreateTournament, PATCHAddMatchToTournament, GETTournamentDetails, PATCHAddWinnerToTournament} from "../api-consumer/fetch";
import { useGameSetting } from '../contexts/GameContext';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import GameApp from '../game/GameApp';
import {useNavigate} from "react-router-dom";




const Tournament =  () =>
    {
        const {tournamentId, 
            Player1, Player2, Player3, Player4,
            Player1username, Player2username, Player3username, Player4username} = useTournamentSetting();                   //de momento necessario porque no se si puede cambiar la orden de accesso de backend
        const {} = useTournamentSetting();                   //de momento necessario porque no se si puede cambiar la orden de accesso de backend
        const [winner1, setwinner1] = useState("");
        const [winner2, setwinner2] = useState("");
        const [winner3, setwinner3] = useState("");
        const navigate = useNavigate(); 

        const game_handler = async () => {
            if (winner1 == ""){
                console.log("Entered");
                let payload1 = {
                    player_left: Player1,
                    player_right: Player2,
                    is_multiplayer: true,
                    left_score: 0,
                    right_score: 0,
                    is_started: false,
                    };
                console.log("Payload Created");
                const LocalMatchResponse = await POSTcreateMatch(payload1);
                console.log("POST");
                  navigate("/local")

            }else if (winner2 == ""){

            }  
            else if (winner3 == ""){

            }
        };

        game_handler()

        return(
            <>
            </>
        );
  
            // [x] Get usernames
            
            // [] Launch match one (needs to be slightly different than 
            // the game logic used in the local game as we need to not got to menu when it ends and reload for the next game)

            // [] set winner1 to match winner
                        //const TournamentResponse2 =  await PATCHAddWinnerToTournament(TournamentResponse4.id, player_3.userProfile.id);

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

           

            // [] POST match

            // [] PATCH add match to tournament

            // [] Launch match two

            // [] set winner2 to match winner

            // [] POST match

            // [] PATCH add match to tournament
              
            // [] Launch final

            // [] PATCH set winner to be tournament winner.
        }

export default Tournament; 


//            <Button className="m-5 btn-info" >Tourn ID {tournamentId}</Button>
//            <Button className="m-5 btn-info" >Player 1: {Player1}</Button>
//            <Button className="m-5 btn-info" >Player 2: {Player2}</Button>
//            <Button className="m-5 btn-info" >Player 3: {Player3}</Button>
//            <Button className="m-5 btn-info" >Player 4: {Player4}</Button>
//            <Button className="m-5 btn-info" >Player 1: {Player1username}</Button>
//            <Button className="m-5 btn-info" >Player 2: {Player2username}</Button>
//            <Button className="m-5 btn-info" >Player 3: {Player3username}</Button>
//            <Button className="m-5 btn-info" >Player 4: {Player4username}</Button>