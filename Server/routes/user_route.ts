import { Router } from "express";
import { getAllUsers, getUserProfile } from "../controllers/user_controller";
import { authMiddleware } from "../Middlewares/authMiddleware";

const router = Router();

router.get("/", getAllUsers); 
router.get("/profile", authMiddleware, getUserProfile); 

export default router;