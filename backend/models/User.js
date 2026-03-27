const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

  // Email verification (OTP)
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCodeHash: { type: String },
  emailVerificationExpiresAt: { type: Date },
  emailVerificationAttempts: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);
