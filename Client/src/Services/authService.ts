import axios from "axios";

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post("http://localhost:3000/auth/login", {
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
  const token = localStorage.getItem("accessToken"); // Убедитесь, что ключ совпадает с используемым в Login
  if (!token) {
    console.error("No token found in localStorage");
    return { success: false, message: "No token found" };
  }
  try {
    console.log("Fetching protected data with token:", token);
    const response = await axios.get(
      "http://localhost:3000/auth/protected-route",
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
