import { Request, Response } from "express";
import userModel from "../models/Users";

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userModel.find(); 
    res.json(users); 
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ message: "Error fetching users", error: errorMessage });
  }
};
