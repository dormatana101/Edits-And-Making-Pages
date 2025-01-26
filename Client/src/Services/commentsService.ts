import axios from "axios";
import { Comment } from "../types/comment";

export interface PaginatedApiResponse<T> {
    success: boolean;
    data?: T[]; // Generic type for data
    next?: { page: number; limit: number }; // Information for the next page
    previous?: { page: number; limit: number }; // Information for the previous page
    message?: string; // Error or status message
  }
  
  export const fetchCommentsByPostId = async (
    postId: string,
    page: number,
    limit: number
  ): Promise<PaginatedApiResponse<Comment>> => {
    try {
      const response = await axios.get(
        `http://localhost:3000/comments/post/${postId}?page=${page}&limit=${limit}`
      );
      return {
        ...response.data,
        data: response.data?.results || [], // Ensure data is always an array
      };
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw new Error("Failed to fetch comments.");
    }
  };
  