import { Router } from "express";
import { getAllUsers } from "../controllers/user_controller"; 

const router = Router();

router.get("/", getAllUsers); 

export default router;
