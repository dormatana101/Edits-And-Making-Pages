import { Request, Response } from "express";
import userModel from "../models/Users";
import postModel from "../models/Post";


export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userModel.find(); 
    res.json(users); 
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ message: "Error fetching users", error: errorMessage });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId =  req.query.userId;
    if (!userId) {
      res.status(400).json({ message: "User ID not provided." });
      return; 
    }
    const user = await userModel.findById(userId).select("-password"); 
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return; 
    }
    const posts = await postModel.find({ author: user.username }); 
    res.status(200).json({
      user: user,
      posts: posts,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error." });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.query.userId; 
  const { username, email } = req.body;

  try {
    if (!username || !email) {
      res.status(400).json({ message: 'Username and email are required.' });
      return;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true, runValidators: true } 
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
