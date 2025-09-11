import { sendOTPEmail, sendPasswordResetEmail } from "../utils/emailservice.js";
import crypto from "crypto";
import User from "../models/users.model.js";
import bcrypt from "bcryptjs";

export const otpStore = new Map(); // In-memory store for OTPs
export const resetTokenStore = new Map(); // In-memory store for password reset tokens


//request otp for verification at the time of signup
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

   
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; 

    
    otpStore.set(email, { otp, expiresAt });

    
    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};


//verify OTP
export const verifyOTP = (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ error: "OTP not found or expired" });
    }

    const { otp: storedOTP, expiresAt } = storedData;

    if (Date.now() > expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP expired" });
    }

    if (otp === storedOTP) {
      otpStore.delete(email);
      return res.json({ message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};


//request for password reset    
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If the email exists, a password reset link has been sent" });
    }

    
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour expiry

    
    resetTokenStore.set(resetToken, { email, expiresAt });

   
    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ error: "Failed to send password reset email" });
  }
};


//reset password    
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const storedData = resetTokenStore.get(token);

    if (!storedData) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const { email, expiresAt } = storedData;

    if (Date.now() > expiresAt) {
      resetTokenStore.delete(token);
      return res.status(400).json({ error: "Reset token expired" });
    }

   
    const user = await User.findOne({ email });
    if (!user) {
      resetTokenStore.delete(token);
      return res.status(404).json({ error: "User not found" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: "New password must be different from current password" });
    }

    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    
    user.password = hashedPassword;
    await user.save();

   
    resetTokenStore.delete(token);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};