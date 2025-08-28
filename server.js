import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch"; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "./models/User.js";
import crypto from "crypto";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({ origin: "*" }));

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS automatically upgrade hoga
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set in .env file
});

// ----------------- SIGNUP (Send OTP) -----------------
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ msg: "Email already registered" });

    const hashPass = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit OTP

    const user = new User({
      name,
      email,
      password: hashPass,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000, // 10 min expiry
      isVerified: false
    });

    await user.save();

    // Send OTP email with clean UI
await transporter.sendMail({
  from: `"Imperium Media" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Verify your email - Imperium Media",
  html: `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px; background: #f9f9f9;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #004B93; margin: 0;">Imperium Media</h2>
      <p style="color: #666; margin: 5px 0;">Email Verification</p>
    </div>

    <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h3 style="color: #333;">Your OTP Code</h3>
      <p style="font-size: 20px; letter-spacing: 3px; font-weight: bold; color: #E32934; margin: 10px 0;">${otp}</p>
      <p style="color: #666; font-size: 14px;">This OTP is valid for <b>10 minutes</b>. Please do not share it with anyone.</p>
    </div>

    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
      <p>© ${new Date().getFullYear()} Imperium Media. All rights reserved.</p>
    </div>
  </div>
  `
});


    res.json({ msg: "OTP sent to your email. Please verify." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ----------------- VERIFY OTP -----------------
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });
    if (user.otp != otp) return res.status(400).json({ msg: "Invalid OTP" });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ msg: "OTP expired. Please resend OTP." });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ msg: "Email verified successfully. You can login now." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ----------------- RESEND OTP -----------------
app.post("/api/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });
    if (user.isVerified) return res.status(400).json({ msg: "Email already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // reset expiry
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend OTP - Imperium Media",
      text: `Your new OTP is ${otp}. It will expire in 10 minutes.`
    });

    res.json({ msg: "New OTP sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ----------------- LOGIN -----------------
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email first" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Send user info in response
    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// API route
app.post("/api/generate-post", async (req, res) => {
  try {
    const { businessName, industry, targetAudience, platform, toneOfVoice } = req.body;

    if (!businessName || !industry || !targetAudience || !platform || !toneOfVoice) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const prompt = `
    Generate a ${toneOfVoice} social media post for ${platform}.
    Business: ${businessName}
    Industry: ${industry}
    Target Audience: ${targetAudience}

    The post should be engaging, relevant, and suitable for the platform.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    const generatedPost = response.choices[0].message.content.trim();

    res.json({ post: generatedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate post." });
  }
});
let lastGeneratedImage = null; // memory me store karne ke liye

app.post("/api/generate-post-image", async (req, res) => {
  try {
    const { businessName, industry, targetAudience, platform, toneOfVoice, color, description } = req.body;

    // Required fields check
    if (!businessName || !industry || !targetAudience || !platform || !toneOfVoice || !color || !description) {
      return res.status(400).json({ error: "All fields are required including description and color." });
    }

    // Prompt including description
    const prompt = `
    Generate a ${toneOfVoice} social media post image concept for ${platform}.
    Business: ${businessName}
    Industry: ${industry}
    Target Audience: ${targetAudience}
    Preferred Brand Color: ${color}
    Special Offer / Service: ${description}

    The image should be engaging, relevant, visually appealing and designed using the brand color theme. 
    Make sure the design highlights the offer/service clearly.
    `;

    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "high",
      n: 1,
    });

    const base64Image = response.data[0].b64_json;

    lastGeneratedImage = base64Image; // memory me store kar diya

    // Return base64 as a data URI
    res.json({ image: `data:image/png;base64,${base64Image}` });

  } catch (err) {
    console.error("Error generating image:", err);
    res.status(500).json({ error: "Failed to generate image." });
  }
});


// ----------------- TEST ROUTE -----------------
app.get("/test", (req, res) => {
  res.send("Hello");
});
// ----------------- TEST ROUTE -----------------
app.get("/tessst", (req, res) => {
  res.send("Hellhho");
});


// Image download route
app.get("/download-image", (req, res) => {
  try {
    if (!lastGeneratedImage) {
      return res.status(400).send("No image available for download");
    }

    // Base64 ko buffer me convert karo
    const buffer = Buffer.from(lastGeneratedImage, "base64");

    // Headers set karo for download
    res.setHeader("Content-Disposition", "attachment; filename=generated-image.png");
    res.setHeader("Content-Type", "image/png");

    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error downloading image");
  }
});
// ----------------- SERVER -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
