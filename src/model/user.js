const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    wrongOTPAttempts: { type: Number, default: 0 },
    blockedUntil: { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
