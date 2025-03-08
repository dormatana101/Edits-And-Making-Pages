import axios from 'axios';
import CONFIG from "../config"; 
import api from "./axiosInstance";

const userId = localStorage.getItem("userId");

export interface PaginatedApiResponse<T> {
  success: boolean;
  data?: T[]; 
  next?: { page: number; limit: number }; 
  previous?: { page: number; limit: number }; 
  message?: string; 
}

export const fetchPosts = async <T>(
  page: number,
  limit: number,
): Promise<PaginatedApiResponse<T>> => {
  try {
    const response = await api.get(`${CONFIG.SERVER_URL}/posts`, {
      params: {
        page,
        limit,
        userId,
      },
    });

    const data = response.data;

    return {
      success: true,
      data: data?.results || [],
      next: data?.next,
      previous: data?.previous,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || "An error occurred",
      };
    } else {
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  }
};

// Fetch post by ID
export const fetchPostById = async (id: string) => {
  try {
    const response = await api.get(`${CONFIG.SERVER_URL}/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data; 
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new Error("Post not found");
  }
};


// Fetch comments by Post ID
export const fetchCommentsByPostId = async (postId: string) => {
  try {
    const response = await api.get(`${CONFIG.SERVER_URL}/comments/post/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new Error("Comments not found");
  }
};

// Post a new comment
export const postComment = async (postId: string, content: string) => {
  try {
    const response = await api.post(
     `${CONFIG.SERVER_URL}/comments`,
      {
        postId,
        content,
        author: localStorage.getItem("username"),
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error posting comment:', error);
    throw new Error("Failed to post comment");
  }
};

// Create a new post
export const createPost = async (title: string, content: string, image: File | null) => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("author", localStorage.getItem("username") || "");
    if (image) {
      formData.append("image", image);
    }

    const response = await api.post(
      `${CONFIG.SERVER_URL}/posts`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", 
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error creating post:", error);
    if (axios.isAxiosError(error)) {
      return { success: false, message: error.response?.data?.message || "An error occurred" };
    } else {
      return { success: false, message: "An error occurred" };
    }
  }
};



export const toggleLike = async (postId: string) => {
  try {
    const response = await api.post(
      `${CONFIG.SERVER_URL}/posts/${postId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { success: false, message: "An error occurred while toggling like" };
  }
};