import api from "../../api";
import { ACCESS_TOKEN } from "../../constants"; 


export async function PATCHMatchScore(matchId, right_score, left_score, match_duration) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
        return null; // Return null if not logged in
    }
    const res = await api.patch(`/api/matches/${matchId}/`, {'right_score': right_score, 'left_score': left_score, 'match_duration': match_duration}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
}


export async function GETCurrentProfileInfo() {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
        return null; // Return null if not logged in
    }

    try {
        const response = await api.get(`/api/user/profile/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data; // Return the JSON data directly
    } catch (error) {
        console.error("Error fetching profile info:", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details
    }
}

export async function GETCheckUsernameExists(username){
    const token = localStorage.getItem(ACCESS_TOKEN); 
    if (!token) {
        return ;
    }
    // Call the Django API to check if the username exists
    try{
        const PlayerLeftresponse = await api.get(`/api/user/${username}/`, {
            headers: {
                Authorization: `Bearer ${token}`,// Include the JWT token in the header
            },
        });
        return PlayerLeftresponse.data;
    } catch (error){
        console.log("Error checking username existance ", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details

    }
};

export async function POSTcreateMatch(payload) {
    const token = localStorage.getItem(ACCESS_TOKEN); 

    if (!token) {
        return ;
    }
    try{
        const matchResponse = await api.post('/api/matches/', payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return matchResponse.data;
    } catch (error){
        console.log("Error creating match ", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details

    }
}



export async function POSTcreateTournament(payload) {
    const token = localStorage.getItem(ACCESS_TOKEN); 

    if (!token) {
        return ;
    }
    try{
        const tournamentResponse = await api.post('/api/tournament/', payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return tournamentResponse.data;
    } catch (error){
        console.log("Error creating tournament ", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details

    }
}



export async function PATCHAddMatchToTournament(tournamentId, matchId) {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
        return null; 
    }

    try {
        const response = await api.patch(`/api/tournaments/${tournamentId}/add-matches/`, 
            { pkMatch: matchId }, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the JWT token in the header
                },
            });

        return response.data; // Return the response data if successful
    } catch (error) {
        console.log("Error adding match to tournament:", error);
        return { error: error.response?.data || "An error occurred" }; // Handle error and return response
    }
}

export async function PATCHAddWinnerToTournament(tournamentId, userID) {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
        return null; 
    }

    try {
        const response = await api.patch(`/api/tournaments/${tournamentId}/add-winner/`, 
            { pkUser: userID }, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the JWT token in the header
                },
            });

        return response.data; // Return the response data if successful
    } catch (error) {
        console.log("Error adding winner to tournament:", error);
        return { error: error.response?.data || "An error occurred" }; // Handle error and return response
    }
}

export async function GETTournamentDetails(tournamentId) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
        return null; 
    }
    try {
        const response = await api.get(`/api/tournaments/${tournamentId}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.log('Error fetching tournament details:', error);
        return { error: error.response?.data || 'An error occurred' };
    }
}

