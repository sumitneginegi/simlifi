const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = require('../model/user');


exports.createUser = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;

    // Check if a user with the provided email or phone number already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create a new user
    const user = new User({ name, email, phoneNumber });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};




const transporter = nodemailer.createTransport({
  // Configure your email service provider here
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

exports.generateOTP = async (req, res) => {
    try {
      const { email } = req.body;

      // Check if there is an existing user with the provided email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if the user's account is blocked due to consecutive wrong OTP attempts
      if (user.blockedUntil && user.blockedUntil > Date.now()) {
        return res.status(403).json({ error: 'Account blocked. Please try again later' });
      }

      // Check if the minimum time gap between OTP requests has passed
      if (user.lastOTPSendTime && user.lastOTPSendTime > Date.now() - 60000) {
        return res.status(429).json({ error: 'Please wait for 1 minute before requesting a new OTP' });
      }

      // Generate a new OTP
      const otp = generateOTP();

      // Update the user's OTP and lastOTPSendTime
      user.otp = otp;
      user.lastOTPSendTime = new Date();
      await user.save();

      // Send the OTP to the user's email
      await transporter.sendMail({
        from: 'your-email@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP: ${otp}`
      });

      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error generating OTP:', error);
      res.status(500).json({ error: 'Failed to generate OTP' });
    }
  },




  exports.login = async (req, res) => {
    try {
      const { email, otp } = req.body;

      // Check if there is an existing user with the provided email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if the user's account is blocked due to consecutive wrong OTP attempts
      if (user.blockedUntil && user.blockedUntil > Date.now()) {
        return res.status(403).json({ error: 'Account blocked. Please try again later' });
      }

      // Check if the OTP is valid
      if (user.otp !== otp) {
        // Increment the wrongOTPAttempts count
        user.wrongOTPAttempts += 1;

        // Block the user's account if consecutive wrong OTP attempts exceed the limit
        if (user.wrongOTPAttempts >= 5) {
          user.blockedUntil = new Date(Date.now() + 3600000); // Block for 1 hour
          user.wrongOTPAttempts = 0;
        }

        await user.save();

        return res.status(401).json({ error: 'Invalid OTP' });
      }

      // Reset the wrongOTPAttempts count
      user.wrongOTPAttempts = 0;
      await user.save();

      // Generate a new JWT token
      const token = jwt.sign({ email }, 'your-secret-key', { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }


function generateOTP() {
  // Generate a random 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}
