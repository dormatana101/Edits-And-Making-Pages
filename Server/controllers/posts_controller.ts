import { Request, Response } from "express";
import postModel from "../models/Post";
// Create a new post
const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, senderId } = req.body;

    if (!title || !content || !senderId) {
      return res
      .status(400)
      .json({ message: "All fields are required" });
    }

    const post = new postModel({ title, content, senderId });
    await post.save();
    res
    .status(201).json(post);
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
    res
    .status(200)
    .json(posts);
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
      return res
      .status(404)
      .json({ message: "Post not found" });
    }

    res
    .status(200)
    .json(post);
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

    res
    .status(200)
    .json(posts);
  } catch (err: any) {
    res
    .status(500)
    .json({
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
      return res
      .status(404)
      .json({ message: "Post not found" });
    }

    res
    .status(200)
    .json(updatedPost);
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
      return res
      .status(404)
      .json({ message: "Post not found" });
    }

    res
    .status(200)
    .json(deletedPost);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: err.message });
  }
};

export default {
  getAllPosts,
  createPost,
  getPostById,
  getPostsBySenderId,
  updatePost,
  deletePost,
};
