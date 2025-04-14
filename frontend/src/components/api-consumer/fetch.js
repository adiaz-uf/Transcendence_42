import api from "../../api";
import { ACCESS_TOKEN } from "../../constants"; 


export async function PATCHMatchScore(matchId, right_score, left_score, match_duration) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
        return null; // Return null if not logged in
    }
    const res = await api.patch(`/api/matches/${matchId}`, {'right_score': right_score, 'left_score': left_score, 'match_duration': match_duration}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
}

export async function GETGameSettings() {
    try {
        const response = await api.get(`/api/game-settings/`, {
            cache: 'no-store' // Prevent caching to ensure fresh data
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching game settings:", error);
        return { 
            error: error.response?.data || "An error occurred while fetching game settings",
            status: error.response?.status || 500
        };
    }
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

export async function GETOthersProfileInfo(username) {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
        return null; // Return null if not logged in
    }

    try {
        const response = await api.get(`/api/user/profile/${username}`, {
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
        const PlayerLeftresponse = await api.get(`/api/user/exists/${username}`, {
            headers: {
                Authorization: `Bearer ${token}`,// Include the JWT token in the header
            },
        });
        return PlayerLeftresponse.data;
    } catch (error){
        console.error("Error checking username existence:", error);
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
        console.error("Error creating match:", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details
    }
}

export async function GETfriends(username=null)
{
        // Get the JWT token from local storage
        const token = localStorage.getItem(ACCESS_TOKEN); 
        if (!token) {
            return ;
        }
        try{
            if (username === null)
                username =  localStorage.getItem('username')
            const response = await api.get(`/api/user/friends/${username}`, {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        } catch (error){
            console.error("Error listing friends:", error);
            return { error: error.response?.data || "An error occurred" }; // Return error details
        }
}

export async function POSTfriend(friendName){
    // Get the JWT token from local storage
    const token = localStorage.getItem(ACCESS_TOKEN); 

    if (!token) {
        return ;
    }
    try{
        const response = await api.post(`/api/user/friends/${friendName}`,  {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response;
    } catch (error){
        console.error("Error listing friends:", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details
    }
}

export async function DELETEfriend(friendName) {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
        return;
    }
    try { //friend id as query
        const response = await api.delete(`/api/user/friends/${friendName}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error removing friend:", error);
        return { error: error.response?.data || "An error occurred" };
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
        console.error("Error creating tournament:", error);
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
        console.error("Error adding match to tournament:", error);
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
        console.error("Error adding winner to tournament:", error);
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
        console.error("Error fetching tournament details:", error);
        return { error: error.response?.data || 'An error occurred' };
    }
}

export async function GETUserMatchesPlayed(username) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
        return null; 
    }
    try {
      const response = await api.get(`/api/user/matches-played/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return (response.data.matches_played);
    } catch (error) {
      console.error("Error fetching matches played:", error);
      return { error: error.response?.data || 'An error occurred' };
    }
  };

export async function GETUserMatchesWon(username) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
        return null; 
    }
    try {
      const response = await api.get(`/api/user/matches-won/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return (response.data.matches_won);
    } catch (error) {
      console.error("Error fetching matches won:", error);
      return { error: error.response?.data || 'An error occurred' };
    }
  };

export async function setUserActive(iactive) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
        return null; 
    }
    try {
        const response = await api.patch(`/api/user/active/`, { active: iactive }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        console.error("Error setting user active status:", error);
        return { error: error.response?.data || "An error occurred" }; // Handle error and return response
    }
  };

export async function GetOthersActiveness(in_username) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
        return null; 
    }
    try {
        const response = await api.get(`/api/user/friends/active/${in_username}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        console.error("Error setting user active status:", error);
        return { error: error.response?.data || "An error occurred" }; // Handle error and return response
    }
  };

export async function GetListMatchesFromIdWithScore(in_username) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
        return null; 
    }
    try {
        const response = await api.get(`/api/user/list-matches-played/${in_username}/`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        console.error("Error setting user active status:", error);
        return { error: error.response?.data || "An error occurred" }; // Handle error and return response
    }
};
