import { Router } from "express";
import { getAllUsers, getUserProfile,updateUserProfile } from "../controllers/user_controller";
import { authMiddleware } from "../controllers/auth_controller";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.get("/", getAllUsers); 
router.get("/profile", authMiddleware, getUserProfile); 
router.put("/profile", authMiddleware, upload.single('profilePicture'), updateUserProfile);

export default router;