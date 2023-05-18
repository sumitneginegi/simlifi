const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const User = require("../model/user");

exports.createUser = async (req, res) => {
  try {
    const { name, email, otp } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create a new user instance
    const newUser = new User({
      name,
      email,
      otp,
      otpExpiry: new Date(), // Set the otpExpiry to the current date/time
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'ford.stehr@ethereal.email',
      pass: 'k35rD9VVSFE3caS62D'
  }
}); // i have use ethereal email  (dummy email ) 

exports.generateOTP = async (req, res) => {
  try {
    let { email , otp } = req.body;
    console.log("hi");
    // Check if there is an existing user with the provided email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const MAX_WRONG_OTP_ATTEMPTS = 5;
    const BLOCK_DURATION = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
    
    // Check if the user's account is blocked due to consecutive wrong OTP attempts
    if (user.wrongOTPAttempts >= MAX_WRONG_OTP_ATTEMPTS && user.blockedUntil && user.blockedUntil > Date.now()) {
      return res.status(403).json({ error: "Account blocked. Please try again later" });
    }
    
    // Verify the OTP
    if (user.otp !== otp) {
      user.wrongOTPAttempts += 1;
    
      // Check if the maximum wrong OTP attempts reached
      if (user.wrongOTPAttempts > MAX_WRONG_OTP_ATTEMPTS) {
        user.blockedUntil = new Date(Date.now() + BLOCK_DURATION);
      }
    
      await user.save();
    
      // Wrong OTP, handle accordingly
      return res.status(401).json({ error: "Invalid OTP" });
    }
    
    // Correct OTP, reset the wrongOTPAttempts counter
    user.wrongOTPAttempts = 0;
    await user.save();

    // Generate a new OTP
    const otp1 = generateOTP();

    // Update the user's OTP and lastOTPSendTime
    user.otp = otp1;
   
    await user.save(); 

    // Send the OTP to the user's email
    await transporter.sendMail({
      from: "sumit@gmail.com",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP: ${otp1}`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ error: "Failed to generate OTP" });
  }
}
exports.login = async (req, res) => {
    try {
      const { email, otp } = req.body;

      // Check if there is an existing user with the provided email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const MAX_WRONG_OTP_ATTEMPTS = 5;
      const BLOCK_DURATION = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
      
      // Check if the user's account is blocked due to consecutive wrong OTP attempts
      if (user.wrongOTPAttempts >= MAX_WRONG_OTP_ATTEMPTS && user.blockedUntil && user.blockedUntil > Date.now()) {
        return res.status(403).json({ error: "Account blocked. Please try again later" });
      }
      
      // Verify the OTP
      if (user.otp !== otp) {
        user.wrongOTPAttempts += 1;
      
        // Check if the maximum wrong OTP attempts reached
        if (user.wrongOTPAttempts > MAX_WRONG_OTP_ATTEMPTS) {
          user.blockedUntil = new Date(Date.now() + BLOCK_DURATION);
        }
      
        await user.save();
      
        // Wrong OTP, handle accordingly
        return res.status(401).json({ error: "Invalid OTP" });
      }
      
      // Correct OTP, reset the wrongOTPAttempts counter
      user.wrongOTPAttempts = 0;
      await user.save();
  
      // // Generate a new OTP
      // const otp1 = generateOTP();
  
      // // Update the user's OTP and lastOTPSendTime
       
     
      // await user.save(); 
  
      // Send the OTP to the user's email
      await transporter.sendMail({
        from: "sumit@gmail.com",
        to: email,
        subject: "OTP Verification",
        text: `Your OTP: ${otp}`,
      });
      // Generate a new JWT token
      const token = jwt.sign({ email }, "your-secret-key", { expiresIn: "1h" });

      res.json({ token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }

function generateOTP() {
  // Generate a random 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}
