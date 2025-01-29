import axios from "axios";
import CONFIG from "../config";
export const fetchMedicalNews = async (query: string = "", page: number = 1, pageSize: number = 30) => {
    try {
      const response = await axios.get(CONFIG.NEWS_API_URL, {
        params: {
          q: query || "health OR medicine OR doctor OR hospital", // Default query
          language: "en",
          pageSize,
          page,
          apiKey: CONFIG.NEWS_API_KEY,
        },
      });
  
      return response.data.articles; 
    } catch (error) {
      console.error("Error fetching medical news:", error);
      return [];
    }
  };
  