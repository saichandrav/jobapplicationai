const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

const generateOtp = () => {
  // 4-digit OTP: 1000-9999
  return crypto.randomInt(1000, 10000).toString();
};

const hashOtp = (otp) => {
  // Store only a hash, never the raw OTP.
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
};

const getSmtpTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('Missing SMTP configuration (SMTP_HOST, SMTP_USER, SMTP_PASS).');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // common convention
    auth: { user, pass },
  });
};

const sendOtpEmail = async ({ toEmail, otp }) => {
  const fromEmail = process.env.OTP_FROM_EMAIL || process.env.SMTP_USER;
  if (!fromEmail) throw new Error('Missing sender email (OTP_FROM_EMAIL or SMTP_USER).');

  // Optional debugging during development (DO NOT enable in production).
  if (process.env.OTP_DEBUG === 'true') {
    console.log(`[OTP_DEBUG] to=${toEmail} otp=${otp}`);
  }

  const transporter = getSmtpTransporter();
  await transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    subject: 'Your verification code',
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists?.isEmailVerified) {
      return res.status(400).json({ error: 'User already exists and is verified' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = userExists || (await User.create({ name, email, password: hashedPassword }));

    // If user already exists but is not verified, refresh credentials + OTP.
    user.name = name;
    user.password = hashedPassword;

    const otp = generateOtp();
    user.emailVerificationCodeHash = hashOtp(otp);
    user.emailVerificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.emailVerificationAttempts = 0;

    await user.save();

    await sendOtpEmail({ toEmail: email, otp });

    return res.status(userExists ? 200 : 201).json({
      message: 'OTP sent. Please verify your email to continue.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or OTP.' });

    if (user.isEmailVerified) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        message: 'Email already verified.',
      });
    }

    if (!user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) {
      return res.status(400).json({ error: 'No OTP pending for this email. Please register again.' });
    }

    if (Date.now() > new Date(user.emailVerificationExpiresAt).getTime()) {
      return res.status(400).json({ error: 'OTP expired. Please request a new code.' });
    }

    const providedOtpHash = hashOtp(otp);
    if (user.emailVerificationCodeHash !== providedOtpHash) {
      user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
      await user.save();

      if ((user.emailVerificationAttempts || 0) >= 5) {
        return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
      }

      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationCodeHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    user.emailVerificationAttempts = 0;
    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isEmailVerified) {
        return res.status(401).json({ error: 'Email not verified. Please verify your OTP first.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, verifyOtp, loginUser };
