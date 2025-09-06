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
import axios  from "axios";  
import https  from 'https'; 
import sslChecker  from "ssl-checker";
import * as cheerio from "cheerio";  

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


// ----------------- FORGOT PASSWORD (Send OTP) -----------------
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit OTP
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await transporter.sendMail({
      from: `"Imperium Media" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP - Imperium Media",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border-radius: 10px; background: #f9f9f9; border: 1px solid #eee;">
          <h2 style="color:#004B93; text-align:center;">Password Reset Request</h2>
          <p style="text-align:center;">Use the OTP below to reset your password:</p>
          <h3 style="color:#E32934; text-align:center; letter-spacing:3px;">${otp}</h3>
          <p style="text-align:center; font-size:14px;">This OTP will expire in <b>10 minutes</b>.</p>
        </div>
      `
    });

    res.json({ msg: "Password reset OTP sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// ----------------- RESET PASSWORD -----------------
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });
    if (user.otp != otp) return res.status(400).json({ msg: "Invalid OTP" });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ msg: "OTP expired. Please request again." });

    const hashPass = await bcrypt.hash(newPassword, 10);
    user.password = hashPass;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ msg: "Password reset successful. Please login with new password." });
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




// / Health Check Endpoint
app.get('/', (req, res) => {
  res.send('Shopify Security Checker API running!');
});

// Security Check Endpoint
app.post('/check', async (req, res) => {
  const { url, domain } = req.body;
  if (!url) return res.status(400).json({ status: 'error', message: 'URL is required' });

  try {
    // Check if site is reachable
    // const response = await axios.get(url, { timeout: 5000, httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    const response = await axios.get(url, {
  timeout: 10000, // ⬆️ 5s se 10s kiya
  maxRedirects: 5, // ⬆️ multiple redirects allow karega (Shopify pe kaam aata hai)
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});


    // Check if HTTPS
    const isHttps = url.startsWith('https://');

    res.json({
      status: 'secure',
      message: 'Site is reachable',
      https: isHttps,
      domain: domain || null
    });
  } catch (error) {
    res.json({
      status: 'insecure',
      message: 'Site not reachable or invalid URL',
      error: error.message
    });
  }
});


// SSL Check API
app.post("/check-ssl", async (req, res) => {
  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: "Domain is required" });
  }

  try {
    const sslDetails = await sslChecker(domain, { method: "GET", port: 443 });
    res.json({ success: true, ssl: sslDetails });
  } catch (error) {
    res.json({ success: false, message: "SSL check failed", error: error.message });
  }
});
let uptimeData = {
  totalChecks: 0,
  successChecks: 0,
};
app.post("/check-health", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    uptimeData.totalChecks++;

    const start = Date.now();
    const response = await fetch(url, { method: "GET" });
    const end = Date.now();

    const responseTime = end - start;

    if (response.ok) {
      uptimeData.successChecks++;
    }

    const uptimePercentage =
      uptimeData.totalChecks > 0
        ? ((uptimeData.successChecks / uptimeData.totalChecks) * 100).toFixed(2)
        : "0";

    res.json({
      uptime: uptimePercentage,
      responseTime,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch URL" });
  }
});

// 1. Shopify-Specific
app.get("/api/shopify-summary", async (req, res) => {
  const { domain } = req.query;
  if (!domain) return res.status(400).json({ error: "Domain required" });

  try {
    const response = await fetch(`https://${domain}`);
    const html = await response.text();

    // Detect common Shopify apps
   const detectionRules = [
  { name: "Shopify CDN", keyword: "shopifycdn.com" },
  { name: "Shopify Assets", keyword: "cdn.shopify.com" },
  { name: "Klaviyo", keyword: "klaviyo" },
  { name: "Google Analytics", keyword: "gtag/js" },
  { name: "Google Tag Manager", keyword: "googletagmanager.com" },
  { name: "Facebook Pixel", keyword: "facebook.net" },
  { name: "TikTok Pixel", keyword: "tiktokglobal" },
  { name: "Judge.me Reviews", keyword: "judge.me" },
  { name: "Yotpo Reviews", keyword: "yotpo.com" },
  { name: "Loox Reviews", keyword: "loox.io" },
  { name: "Okendo Reviews", keyword: "okendo.io" },
  { name: "Intercom Chat", keyword: "intercom.com" },
  { name: "Crisp Chat", keyword: "crisp.chat" },
  { name: "Tawk.to Live Chat", keyword: "tawk.to" },
  { name: "Hotjar Analytics", keyword: "hotjar.com" },
  { name: "Privy Popups", keyword: "privy.com" },
  { name: "Sezzle Payments", keyword: "sezzle" },
  { name: "Afterpay", keyword: "afterpay" },
  { name: "PayPal Checkout", keyword: "paypal.com" },
  { name: "Stripe Payments", keyword: "stripe.com" },
  { name: "Bold Commerce Apps", keyword: "boldcommerce.com" },
  { name: "Recharge Subscriptions", keyword: "rechargepayments" }
];
// Detect apps inline
    const detectedApps = detectionRules
      .filter(rule => html.includes(rule.keyword))
      .map(rule => rule.name);

    // Check admin access
    let adminExposed = false;
    try {
      const adminResp = await fetch(`https://${domain}/admin`, { method: "GET" });
      if (adminResp.status === 200) adminExposed = true;
    } catch (err) {}

    res.json({
      domain,
      shopifyApps: detectedApps,
      themeLastUpdated: "Public data not available without store API",
      adminPanelExposed: adminExposed,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch domain" });
  }
});

// 2. Domain & Network Security
app.get("/api/domain-security", async (req, res) => {
  const { domain } = req.query;
  if (!domain) return res.status(400).json({ error: "Domain required" });

  try {
    // Nameservers
    let nameservers = [];
    try {
      nameservers = await dns.resolveNs(domain);
    } catch {}

    // DNSSEC check via Google DNS Resolver API
    let dnssecEnabled = false;
    try {
      const dnsRes = await fetch(
        `https://dns.google/resolve?name=${domain}&type=A`
      );
      const dnsData = await dnsRes.json();
      dnssecEnabled = dnsData.AD === true;
    } catch {}

    // Subdomain scan (basic brute-force for demo)
    const commonSubs = ["shop", "admin", "test", "dev"];
    const foundSubs = [];
    for (const sub of commonSubs) {
      try {
        const records = await dns.resolve(`${sub}.${domain}`);
        if (records) foundSubs.push(`${sub}.${domain}`);
      } catch {}
    }

    // IP reputation (VirusTotal API example - free key needed)
    let ipReputation = "Unknown";
    try {
      const ip = (await dns.resolve4(domain))[0];
      ipReputation = `Check VirusTotal API for ${ip}`;
    } catch {}

    res.json({
      domain,
      nameservers,
      dnssecEnabled,
      subdomains: foundSubs,
      ipReputation,
    });
  } catch (error) {
    res.status(500).json({ error: "Domain check failed" });
  }
});

// 3. Security Score & Monitoring
app.get("/api/security-score", async (req, res) => {
  const { domain } = req.query;
  if (!domain) return res.status(400).json({ error: "Domain required" });

  try {
    // Random score (0-100) for demo
    const score = Math.floor(Math.random() * 100);

    // Threat Intel (stub - real APIs like HIBP or AbuseIPDB required)
    const threatIntel = "No known breaches (demo data)";

    // File integrity monitoring - not possible without access
    const fileMonitoring = "Not supported without store connection";

    res.json({
      domain,
      securityScore: score,
      threatIntel,
      fileMonitoring,
    });
  } catch (error) {
    res.status(500).json({ error: "Security scoring failed" });
  }
});

// ----------------- SERVER -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
