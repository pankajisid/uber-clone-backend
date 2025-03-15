import express from "express"
import {
    registerUser,
    verifyEmail,
    loginUser,
    forgetPassword,
    resetPassword
} from "../controllers/authController.js"

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

export default router