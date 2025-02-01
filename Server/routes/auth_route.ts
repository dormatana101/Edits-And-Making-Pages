import express from "express";
import authController from "../controllers/auth_controller";
import { authMiddleware } from "../controllers/auth_controller";
import passport from "passport";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file.
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request (e.g. missing parameters or validation errors)
 *       409:
 *         description: Conflict (e.g. username or email already exists)
 *       500:
 *         description: Server error
 */
router.post("/register", upload.single('profilePicture'), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful and tokens returned
 *       400:
 *         description: Invalid login credentials or missing fields
 *       500:
 *         description: Server error
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/protected-route:
 *   get:
 *     summary: Access a protected route (authentication required)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Protected route accessed successfully
 *       401:
 *         description: Unauthorized access
 */
router.get("/protected-route", authMiddleware, (req, res) => {
  res.send("This is a protected route");
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token.
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       400:
 *         description: Bad request (e.g. invalid refresh token)
 *       500:
 *         description: Server error
 */
router.post("/refresh", authController.refresh);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent screen
 */
router.get("/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback URL
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects after successful Google authentication
 *       400:
 *         description: Bad request or authentication failed
 */
router.get(
  "/google/callback",
  passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }),
  authController.googleCallback
);

export default router;
