import { Router } from "express";
import { chatWithGPT } from "../controllers/chatGPT_controller";

const router = Router();

router.post("/chatgpt", chatWithGPT);

export default router;
