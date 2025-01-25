import { Request, Response } from "express";
import mongoose from "mongoose";
import postModel from "../models/Post";
import userModel from "../models/Users";

// Create a new post
const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, author, image } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const post = new postModel({ title, content, author, image });
    await post.save();
    res.status(201).json(post);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error creating post", error: err.message });
  }
};

// Get all posts
const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await postModel.find();
    res.status(200).json(posts);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error getting all posts", error: err.message });
  }
};

// Get a post by ID
const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await postModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error getting post by ID", error: err.message });
  }
};

// Get posts by sender ID
const getPostsBySenderId = async (req: Request, res: Response) => {
  try {
    const posts = await postModel.find({ senderId: req.params.senderId });

    if (!posts.length) {
      return res
        .status(404)
        .json({ message: "No posts found for this sender" });
    }

    res.status(200).json(posts);
  } catch (err: any) {
    res.status(500).json({
      message: "Error getting posts by sender ID",
      error: err.message,
    });
  }
};

// Update a post
const updatePost = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const updatedPost = await postModel.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(updatedPost);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error updating post", error: err.message });
  }
};

// Delete a post
const deletePost = async (req: Request, res: Response) => {
  try {
    const deletedPost = await postModel.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(deletedPost);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: err.message });
  }
};

const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;

    const userId = req.params.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized. User ID is missing in the request." });
      return;
    }

    const post = await postModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const user = await userModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.likedPosts) {
      user.likedPosts = [];
    }

    const hasLiked = user.likedPosts.some(
      (likedPostId) => likedPostId.toString() === postId
    );

    if (hasLiked) {
      user.likedPosts = user.likedPosts.filter(
        (likedPostId) => likedPostId.toString() !== postId
      );
      post.likesCount = Math.max(0, (post.likesCount || 0) - 1); 
    } else {
      user.likedPosts.push(postId as unknown as mongoose.Schema.Types.ObjectId);
      post.likesCount = (post.likesCount || 0) + 1;
    }

    await user.save();
    await post.save();

    res.status(200).json({
      message: hasLiked ? "Like removed" : "Post liked",
      likesCount: post.likesCount,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getAllPosts,
  createPost,
  getPostById,
  getPostsBySenderId,
  updatePost,
  deletePost,
  toggleLike,
};
