import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  withCredentials: true,
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // En lugar de obtener el refresh token de localStorage, ahora lo obtienes de las cookies
        const refreshToken = getCookie('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/token/refresh/`,
          { refresh: refreshToken },
          { withCredentials: true }  // Asegura que el refresh token en las cookies se envíe también.
        );

        const { access } = response.data;
        // La nueva access token ya no se necesita almacenar en localStorage, ya que estará en la cookie.
        // Pero si deseas almacenarla, puedes seguir almacenándola en cookies, como expliqué antes.

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        // Aquí puedes eliminar las cookies de token si fuera necesario, dependiendo de la configuración en tu backend
        removeCookie('access_token');
        removeCookie('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions to get and remove cookies
const getCookie = (name) => {
  let value = `; ${document.cookie}`;
  let parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

const removeCookie = (name) => {
  document.cookie = `${name}=; path=/; max-age=0; secure; HttpOnly; SameSite=Strict`;
};

export { api };