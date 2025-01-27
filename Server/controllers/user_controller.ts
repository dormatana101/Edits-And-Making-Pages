
import { Request, Response } from "express";
import userModel from "../models/Users";
import postModel from "../models/Post";

// שליפת כל המשתמשים
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userModel.find().select("-password"); // לא להחזיר סיסמאות
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: (error as Error).message });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // שליפת המשתמש לפי userId מתוך req.userId
    const userId =  req.query.userId;
    if (!userId) {
      res.status(400).json({ message: "User ID not provided." });
      return; // עצירה אם אין userId
    }

    const user = await userModel.findById(userId).select("-password"); // לא להחזיר סיסמה
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return; // עצירה אם המשתמש לא נמצא
    }

    // שליפת הפוסטים של המשתמש
    const posts = await postModel.find({ author: user.username }); // הפוסטים מקושרים למשתמש לפי userId

    // החזרת המידע של המשתמש והפוסטים
    res.status(200).json({
      user: user,
      posts: posts,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error." });
  }
};
