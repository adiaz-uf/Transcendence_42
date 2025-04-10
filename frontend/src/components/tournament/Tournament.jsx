// import { useTournamentSetting } from '../contexts/TournamentContext';
// import {GETCheckUsernameExists, POSTcreateMatch, POSTcreateTournament, PATCHAddMatchToTournament, GETTournamentDetails, PATCHAddWinnerToTournament} from "../api-consumer/fetch";
// import { useGameSetting } from '../contexts/GameContext';
// import React, { useState } from 'react';
// import { Button } from 'react-bootstrap';
// import GameApp from '../game/GameApp';
// import {useNavigate} from "react-router-dom";



// const Tournament =  () =>
//     {
//         const {tournamentId, 
//             Player1, Player2, Player3, Player4,
//             Player1username, Player2username, Player3username, Player4username} = useTournamentSetting();                   //de momento necessario porque no se si puede cambiar la orden de accesso de backend
//         const {} = useTournamentSetting();                   //de momento necessario porque no se si puede cambiar la orden de accesso de backend
//         const [winner1, setwinner1] = useState("");
//         const [winner2, setwinner2] = useState("");
//         const [winner3, setwinner3] = useState("");
//         const navigate = useNavigate(); 

//         const post_matches_start = async (p1, p2) => {
//             // BTW we post macthes at creation for allowing internal handling through websocket or simple patches during game, not at end. The end is not a creation, for better arch it is an update
//             console.log(`POST_matches_start(): p1 ${p1} p2 ${p2}`);
//             let payload1 = {
//                 player_left: p1,
//                 player_right: p2,
//                 is_multiplayer: true,
//                 left_score: 0,
//                 right_score: 0,
//                 is_started: false,
//                 };
//             console.log(`Payload Created: ${payload}`);
//             const LocalMatchResponse = await POSTcreateMatch(payload1);
//             console.log(`POST response: ${LocalMatchResponse}`);
//         };

//         return(
//             <>
//             </>
//         );
/// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  
//             // [x] Get usernames
            
//             // [] Launch match one (needs to be slightly different than 
                    //[santi] make a generic function to posting matchCreation   AND append a match to Tournaments
                
//             //the game logic used in the local game as we need to not got to menu when it ends and reload for the next game)
                // [santi] lets call the component directly instead of navigate
                
//             // [] set winner1 to match winner
                    //[Santi] Use effect    for winners Of each finals
//                //const TournamentResponse2 =  await PATCHAddWinnerToTournament(TournamentResponse4.id, player_3.userProfile.id);

//             // [] POST match     // [Santi Initial post function]
//                         //let payload1 = {
//                         //    player_left: player_1_id,
//                         //    player_right: player_2.id,
//                         //    is_multiplayer: true,
//                         //    left_score: 0,
//                         //    right_score: 0,
//                         //    is_started: false,
//                         //  };
//                         //  const LocalMatchResponse = await POSTcreateMatch(payload1);

//             // [] PATCH add match to tournament
//                         //const result = await PATCHAddMatchToTournament(tournament.id, match.id);
                // [Santi] directly after the post
                // [Santi] laucnh <LocalGame/>
                //                  Passs prop (param) to return to tourna
                
           



//             // [] POST match

//             // [] PATCH add match to tournament

//             // [] Launch match two

//             // [] set winner2 to match winner

//             // [] POST match

//             // [] PATCH add match to tournament
              
//             // [] Launch final

//             // [] PATCH set winner to be tournament winner.
//         }
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// export default Tournament; 


//            <Button className="m-5 btn-info" >Tourn ID {tournamentId}</Button>
//            <Button className="m-5 btn-info" >Player 1: {Player1}</Button>
//            <Button className="m-5 btn-info" >Player 2: {Player2}</Button>
//            <Button className="m-5 btn-info" >Player 3: {Player3}</Button>
//            <Button className="m-5 btn-info" >Player 4: {Player4}</Button>
//            <Button className="m-5 btn-info" >Player 1: {Player1username}</Button>
//            <Button className="m-5 btn-info" >Player 2: {Player2username}</Button>
//            <Button className="m-5 btn-info" >Player 3: {Player3username}</Button>
//            <Button className="m-5 btn-info" >Player 4: {Player4username}</Button>