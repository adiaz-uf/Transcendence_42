import api from "../../api";
import { ACCESS_TOKEN } from "../../constants"; 

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
    // Get the JWT token from local storage
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

export async function POSTcreateMatch({payload}) {
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



