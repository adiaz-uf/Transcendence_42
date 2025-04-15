import api from "../../api";

function getCookie(name) {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
    return cookieValue || null;
  }

export async function PATCHMatchScore(matchId, right_score, left_score, match_duration) {
    const res = await api.patch(`/api/matches/${matchId}`, {'right_score': right_score, 'left_score': left_score, 'match_duration': match_duration}, {
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
    try {
        const response = await api.get(`/api/user/profile/`, {
        });
        return response.data; // Return the JSON data directly
    } catch (error) {
        console.error("Error fetching profile info:", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details
    }
}

export async function GETOthersProfileInfo(username) {

    try {
        const response = await api.get(`/api/user/profile/${username}`, {

        });
        return response.data; // Return the JSON data directly
    } catch (error) {
        console.error("Error fetching profile info:", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details
    }
}

export async function GETCheckUsernameExists(username){ 

    // Call the Django API to check if the username exists
    try{
        const PlayerLeftresponse = await api.get(`/api/user/exists/${username}`, {

        });
        return PlayerLeftresponse.data;
    } catch (error){
        console.error("Error checking username existence:", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details

    }
};

export async function POSTcreateMatch(payload) { 

    try{
        const matchResponse = await api.post('/api/matches/', payload, {
        })
        return matchResponse.data;
    } catch (error){
        console.error("Error creating match:", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details
    }
}

export async function GETfriends(username=null)
{
        try{
            if (username === null)
                username =  localStorage.getItem('username')
            const response = await api.get(`/api/user/friends/${username}`, {
            })
            return response.data;
        } catch (error){
            console.error("Error listing friends:", error);
            return { error: error.response?.data || "An error occurred" }; // Return error details
        }
}

export async function POSTfriend(friendName){
    try{
        const response = await api.post(`/api/user/friends/${friendName}`, {}, {
        });
        return response.data;
    } catch (error){
        console.error("Error adding friend:", error);
        return { error: error.response?.data?.error || "An error occurred while adding friend" };
    }
}

export async function DELETEfriend(friendName) {
    try { //friend id as query
        const response = await api.delete(`/api/user/friends/${friendName}`,{
        });
        return response.data;
    } catch (error) {
        console.error("Error removing friend:", error);
        return { error: error.response?.data || "An error occurred" };
    }
}


export async function POSTcreateTournament(payload) { 
    try{
        const tournamentResponse = await api.post('/api/tournament/', payload, {
        })
        return tournamentResponse.data;
    } catch (error){
        console.error("Error creating tournament:", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details
    }
}



export async function PATCHAddMatchToTournament(tournamentId, matchId) {
    try {
        const response = await api.patch(`/api/tournaments/${tournamentId}/add-matches/`, 
            { pkMatch: matchId }, {
            });

        return response.data; // Return the response data if successful
    } catch (error) {
        console.error("Error adding match to tournament:", error);
        return { error: error.response?.data || "An error occurred" }; // Handle error and return response
    }
}

export async function PATCHAddWinnerToTournament(tournamentId, userID) {
    try {
        const response = await api.patch(`/api/tournaments/${tournamentId}/add-winner/`, 
            { pkUser: userID }, {
            });

        return response.data; // Return the response data if successful
    } catch (error) {
        console.error("Error adding winner to tournament:", error);
        return { error: error.response?.data || "An error occurred" }; // Handle error and return response
    }
}

export async function GETTournamentDetails(tournamentId) {
    try {
        const response = await api.get(`/api/tournaments/${tournamentId}/`, {
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching tournament details:", error);
        return { error: error.response?.data || 'An error occurred' };
    }
}

export async function GETUserMatchesPlayed(username) {
    try {
      const response = await api.get(`/api/user/matches-played/${username}/`, {
      });
      return (response.data.matches_played);
    } catch (error) {
      console.error("Error fetching matches played:", error);
      return { error: error.response?.data || 'An error occurred' };
    }
  };

export async function GETUserMatchesWon(username) {
    try {
      const response = await api.get(`/api/user/matches-won/${username}/`, {
      });
      return (response.data.matches_won);
    } catch (error) {
        console.error("Error fetching matches won:", error);
        return { error: error.response?.data || 'An error occurred' };
    }
};

export async function setUserActive(iactive) {
    try {
      const csrftoken = getCookie('csrftoken');
  
      const response = await api.patch(
        `/api/user/active/`,
        { active: iactive },
        {
          headers: {
            'X-CSRFToken': csrftoken
          }
        }
      );
  
      return response.data;
    } catch (error) {
      console.error("Error setting user active status:", error);
      return { error: error.response?.data || "An error occurred" };
    }
  }

export async function GetOthersActiveness(in_username) {
    try {
        const response = await api.get(`/api/user/friends/active/${in_username}`,{
        });
        return response;
    } catch (error) {
        console.error("Error setting user active status:", error);
        return { error: error.response?.data || "An error occurred" }; // Handle error and return response
    }
};

export async function GetListMatchesFromIdWithScore(in_username) {
    try {
        const response = await api.get(`/api/user/list-matches-played/${in_username}/`,{
        });
        return response;
    } catch (error) {
        console.error("Error setting user active status:", error);
        return { error: error.response?.data || "An error occurred" }; // Handle error and return response
    }
};