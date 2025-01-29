import axios from "axios";
import CONFIG from "../config";
export const fetchMedicalNews = async (query: string = "", page: number = 1, pageSize: number = 30) => {
    try {
      const healthQuery = query ? `${query} AND (health OR medicine OR doctor OR hospital OR disease OR therapy OR wellness OR medical)` : "health";
      const response = await axios.get(CONFIG.NEWS_API_URL, {
        params: {
          q: healthQuery.trim(),
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
  