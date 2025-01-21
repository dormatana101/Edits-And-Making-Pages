import express from "express";
const router = express.Router();
import authController from "../controllers/auth_controller";

router.post("/register", authController.register);

router.post("/login", authController.login);

//router.post("/logout", authController.logout);

router.get('/protected-route', authController.authMiddleware, (req, res) => {
    res.send('This is a protected route');
});
router.post("/refresh", authController.refresh);

//router.post("/logout", authController.logout);


export default router;