import { Router } from "express";
import { startChat, getMessages } from "../controllers/chat_controller";

const router = Router();

router.post("/start", startChat);
router.get("/:userId/:otherUserId", getMessages);

export default router;
