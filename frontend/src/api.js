import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

/* const apiUrl = "/choreo-apis/awbo/backend/rest-api-be2/v1.0"; */

const api = axios.create({
	baseURL: `${window.location.origin}`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getTournamentScores = (tournamentId) => {
    return api.get(`/tournament/${tournamentId}/scores/`);
};

export const getMatches = () => {
    return api.get(`/api/match/list/`);
};

export default api;
