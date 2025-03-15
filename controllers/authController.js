import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createUser, getUserByEmail, verifyUserEmail, updateUserPassword, updateUserResetCode } from "../models/userModel.js"
import sendEmail from "../utils/sendEmail.js"

// Register a user
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if the email already exists 
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Generate a verification code 
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user 
    const user = await createUser(name, email, hashPassword, verificationCode)

    // Send the email verification
    sendEmail(user.email, "Verify your email", `Your verification code is: ${verificationCode}`);

    return res.status(201).json({ message: "User registered successfully. Please verify your email." });
}

//Verify user email 
const verifyEmail = async (req, res) => {
    const { email, verificationCode } = req.body;
    const user = await getUserByEmail(email);

    if (!user || user.verification_code !== verificationCode) {
        return res.status(400).json({ message: "Invalid verification code." });
    }

    // Update user as verified 
    await verifyUserEmail(email);
    return res.status(200).json({ message: "Email verified successfully!" });
};


// Login user

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
        return res.status(400).json({ message: "User does not exist" });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the email is verified 
    if (!user.is_verified) {
        return res.status(400).json({ message: "Email not verified. Please check your email for the verifciation code." });
    }

    // Generate JWT 
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({ message: "Login successful", token });
};


// Request password reset
const forgetPassword = async (req, res) => {
    const { email } = req.body

    try {
        // Check if usre exists 
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save the reset code to user's record

        await updateUserResetCode(email, resetCode);

        // Send the reset code via email 

        sendEmail(
            email,
            "Password Reset Code",
            `Your password reset code is: ${resetCode}. This code will expire in 30 minutes.`
        );

        return res.status(200).json({
            message: "Password reset code has been sent to your email"
        });
    }
    catch (error) {
        console.error("Forget password error: ", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Reset password with code
const resetPassword = async (req, res) => {
    const { email, resetCode, newPassword } = req.body;

    try {
        // Find user
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if reset code matches and is not expired
        if (user.reset_code !== resetCode) {
            return res.status(400).json({ message: "Invalid reset code" });
        }

        // Check if reset code is expired
        if (user.reset_code_expires && new Date() > new Date(user.reset_code_expires)) {
            return res.status(400).json({ message: "Reset code has expired" });
        }

        // Hash the new password 
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        return res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Reset password error: ", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export { registerUser, verifyEmail, loginUser, forgetPassword, resetPassword }
