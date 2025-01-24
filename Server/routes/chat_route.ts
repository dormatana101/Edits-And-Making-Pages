import { Router } from "express";
import { startChat, getMessages } from "../controllers/chat_controller";

const router = Router();

router.post("/chat/start", startChat);
router.get("/chat/:userId/:otherUserId", getMessages);

export default router;
