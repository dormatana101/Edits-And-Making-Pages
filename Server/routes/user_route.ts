import { Router } from "express";
import { getAllUsers, getUserProfile } from "../controllers/user_controller";
import { authMiddleware } from "../controllers/auth_controller";

const router = Router();

router.get("/", getAllUsers); 
router.get("/profile", authMiddleware, getUserProfile); 

export default router;