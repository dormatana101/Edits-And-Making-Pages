import axios from "axios";
import CONFIG from "../config"; 


const axiosInstance = axios.create({
  baseURL: `${CONFIG.SERVER_URL}/api`, 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); 
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
