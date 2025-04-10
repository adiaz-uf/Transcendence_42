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
    // Get the JWT token from local storage
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
        console.log("Error checking username existance ", error);
        return { error: error.response?.data || "An error occurred" }; // Return error details

    }
};

export async function POSTcreateMatch(payload) {
    // Get the JWT token from local storage
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
            console.log("Received friends  for Authed user: ", response);
            return response.data;
        } catch (error){
            console.log("Error listing friends ", error);
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
        console.log("Error listing friends ", error);
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
        console.log("Error removing friend", error);
        return { error: error.response?.data || "An error occurred" };
    }
}





