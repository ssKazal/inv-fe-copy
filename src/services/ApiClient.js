import axios from "axios";
import Store from "../redux/Store";
import { VAIDINVENTORYBE_HOST } from "../utils/Conf";
import { setIsAuthenticated } from "../redux/slices/UserSlice";

const ApiClient = axios.create({
  baseURL: VAIDINVENTORYBE_HOST,
});

ApiClient.interceptors.request.use((config) => {
  const access_token = localStorage.getItem("access_token");
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

const { dispatch } = Store;

let isRefreshing = false;
const refreshAndRetryQueue = [];

ApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refresh_token = localStorage.getItem("refresh_token");
          if (refresh_token) {
            const response = await axios.post(`${VAIDINVENTORYBE_HOST}/api/token/refresh/`, {
              refresh: refresh_token,
            });
            const new_access_token = response.data.access;

            localStorage.setItem("access_token", new_access_token);

            // Update the request headers with the new access token
            error.config.headers["Authorization"] = `Bearer ${new_access_token}`;

            // Retry all requests in the queue with the new token
            refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
              ApiClient.request(config)
                .then((response) => resolve(response))
                .catch((err) => reject(err));
            });

            // Clear the queue
            refreshAndRetryQueue.length = 0;

            return ApiClient(originalRequest);
          } else {
            // No refresh token available, handle logout or re-authentication here
            localStorage.removeItem("access_token");
            dispatch(setIsAuthenticated(false));
          }
        } catch (refreshError) {
          if (refreshError.response && refreshError.response.status === 401) {
            // Token refresh failed due to an invalid or expired refresh token
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            dispatch(setIsAuthenticated(false));
          } else {
            // Handle other refresh errors
            console.error("Other refresh error");
          }
        } finally {
          isRefreshing = false;
        }
      }

      // Add the original request to the queue
      return new Promise((resolve, reject) => {
        refreshAndRetryQueue.push({ config: originalRequest, resolve, reject });
      });
    }

    return Promise.reject(error);
  }
);

export default ApiClient;
