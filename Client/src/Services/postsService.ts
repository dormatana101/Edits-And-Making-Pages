import axios from 'axios';

// Function to fetch all posts
export const fetchPosts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/posts'); 
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'Failed to fetch posts' };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error);
      return { success: false, message: error.response?.data?.message || 'An error occurred' };
    } else {
      console.error('Error:', error);
      return { success: false, message: 'An unexpected error occurred' };
    }
  }
};
