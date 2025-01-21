import { Request, Response } from "express";
import CommentModel from "../models/Comment";

//get all comments

const getAll = async(req: Request, res: Response) =>{
  try {
    const comments = await CommentModel.find();
    res
    .status(200)
    .json(comments);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error getting all comments", error: err.message });
  }
};

// new comment
const createComment = async (req: Request, res: Response) => {
  try {
    const { postId, content, author } = req.body;

    if (!postId || !content || !author) {
      return res
      .status(400)
      .json({ message: "All fields are required" });
    }

    const comment = new CommentModel({ postId, content, author });
    await comment.save();
    res
    .status(201)
    .json(comment);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error creating comment", error: err.message });
  }
};

// get comments by post id
const getCommentsByPostId = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const comments = await CommentModel.find({ postId });
    res
    .status(200)
    .json(comments);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error getting all comments", error: err.message });
  }
};

// get comment by id
const getCommentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comment = await CommentModel.findById(id);

    if (!comment) {
      return res
      .status(404)
      .json({ message: "Comment not found" });
    }

    res
    .status(200)
    .json(comment);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error getting comment by ID", error: err.message });
  }
};

// update comment
const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const  content = req.body.content;

    if (!id || !content) {
      return res
        .status(400)
        .json({ message: "Comment ID and content are required" });
    }

    const updatedComment = await CommentModel.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return res
      .status(404)
      .json({ message: "Comment not found" });
    }

    res
    .status(200)
    .json(updatedComment);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error updating comment", error: err.message });
  }
};

//delete comment
const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
      .status(400)
      .json({ message: "Comment ID is required" });
    }

    const deletedComment = await CommentModel.findByIdAndDelete(id);

    if (!deletedComment) {
      return res
      .status(404)
      .json({ message: "Comment not found" });
    }

    res
      .status(200)
      .json(deletedComment);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error deleting comment", error: err.message });
  }
};

export default {
  getAll,
  createComment,
  getCommentsByPostId,
  getCommentById,
  updateComment,
  deleteComment,
};
