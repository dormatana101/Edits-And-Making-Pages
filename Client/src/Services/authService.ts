import axios from "axios";
import CONFIG from "../config"; 


export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${CONFIG.SERVER_URL}/auth/login`, {
      email,
      password,
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        accessToken: response.data.accessToken,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "An unexpected error occurred",
      };
    } else {
      console.error("Error:", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  }
};

export const fetchProtectedData = async () => {
  const token = localStorage.getItem("accessToken"); 
  if (!token) {
    return { success: false, message: "No token found" };
  }
  try {
    const response = await axios.get(
      `${CONFIG.SERVER_URL}/auth/protected-route`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, message: response.data };
    }
    return {
      success: false,
      message: response.data.message || "Failed to fetch data",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "An unexpected error occurred",
      };
    } else {
      console.error("Error:", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  }
};
