import { Request, Response } from "express";
import userModel from "../models/Users";
import postModel from "../models/Post";
import multer from "multer";

// הגדרת שמירת קבצים ב-Multer (אם יש תמונה להעלות)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // תיקיית העלאת קבצים
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // שם ייחודי לקובץ
  },
});

const upload = multer({ storage });

// פעולה להחזרת כל המשתמשים
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userModel.find(); 
    res.json(users); 
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ message: "Error fetching users", error: errorMessage });
  }
};

// פעולה להחזרת פרופיל משתמש
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId;
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

// פעולה לעדכון פרופיל משתמש, כולל העלאת תמונה (אם קיימת)
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.query.userId as string;
  const { username } = req.body;

  // טיפול בהעלאת תמונה אם קיימת
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    if (!username) {
      res.status(400).json({ message: 'Username is required.' });
      return;
    }

    const existingUser = await userModel.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      res.status(409).json({ message: 'Username is already taken.' });
      return;
    }

    const user = await userModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const oldUsername = user.username;

    user.username = username;

    if (profilePicture) {
      user.profilePicture = profilePicture; // עדכון תמונה אם הועלתה
    }

    await user.save();

    const updateResult = await postModel.updateMany(
      { author: oldUsername },
      { $set: { author: username } }
    );

    res.status(200).json({ 
      message: 'User updated successfully', 
      user,
      updatedPostsCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

export { upload };
