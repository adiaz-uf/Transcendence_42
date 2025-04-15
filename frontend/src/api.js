import axios from "axios";

/* const apiUrl = "/choreo-apis/awbo/backend/rest-api-be2/v1.0"; */

const api = axios.create({
  baseURL:`${window.location.origin}`,
  withCredentials: true,
});

export default api;
