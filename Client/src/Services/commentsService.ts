import axios from "axios";
import { Comment } from "../types/comment";

export interface PaginatedApiResponse<T> {
    success: boolean;
    data?: T[]; 
    next?: { page: number; limit: number }; 
    previous?: { page: number; limit: number }; 
    message?: string; 
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
        data: response.data?.results || [], 
      };
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw new Error("Failed to fetch comments.");
    }
  };
  
  export const generateSuggestedComment = async (
    postId: string
  ): Promise<string> => {
    try {
      const response = await axios.post(
        "http://localhost:3000/comments/generate",
        { postId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, 
          },
        }
      );
  
      return response.data.suggestedComment;
    } catch (error: unknown) {
      console.error("Error generating suggested comment:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to generate comment.");
      } else {
        throw new Error("Failed to generate comment.");
      }
    }
  };