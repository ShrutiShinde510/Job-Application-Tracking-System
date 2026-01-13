const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide all fields');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Create user object (not saved yet)
    const user = new User({
      name,
      email,
      password
    });

    // Generate OTP
    const otp = user.generateOTP();

    // Save user with OTP (triggers hashing once)
    await user.save();

    // Send OTP email
    let emailSent = false;
    try {
      console.log(`🔑 Generating OTP for ${email}. Name: ${name}`);
      await sendOTPEmail(email, otp, name);
      emailSent = true;
    } catch (error) {
      console.error('Email sending failed:', error);
      // DO NOT throw error here if we are in development and have devOTP
      if (process.env.NODE_ENV !== 'development') {
        res.status(500);
        throw new Error('Failed to send verification email. Please try again later.');
      }
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Registration successful. Please verify your email.'
        : 'Account created, but email failed. Use the code on screen (Dev Mode).',
      email: user.email,
      // 🔥 ONLY FOR DEVELOPMENT - Only provide if email failed
      devOTP: (process.env.NODE_ENV === 'development' && !emailSent) ? otp : undefined,
      emailSent
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Check user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Check if verified
    if (!user.isVerified) {
      // Generate new OTP
      const otp = user.generateOTP();
      await user.save();

      // Send OTP
      let emailSent = false;
      try {
        await sendOTPEmail(email, otp, user.name);
        emailSent = true;
      } catch (error) {
        console.error('Email sending failed:', error);
        if (process.env.NODE_ENV !== 'development') {
          res.status(500);
          throw new Error('Failed to send verification email. Please try again later.');
        }
      }

      return res.status(403).json({
        success: false,
        message: emailSent
          ? 'Please verify your email first. New OTP sent.'
          : 'Please verify your email. (Email failed, use code on screen)',
        requiresVerification: true,
        email: user.email,
        // 🔥 ONLY FOR DEVELOPMENT
        devOTP: (process.env.NODE_ENV === 'development' && !emailSent) ? otp : undefined,
        emailSent
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      res.status(400);
      throw new Error('Please provide email and OTP');
    }

    // Find user
    const user = await User.findOne({ email }).select('+otp +otpExpire');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if OTP expired
    if (user.otpExpire < Date.now()) {
      res.status(400);
      throw new Error('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    if (user.otp !== otp) {
      res.status(400);
      throw new Error('Invalid OTP');
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      res.status(400);
      throw new Error('Please provide email');
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if already verified
    if (user.isVerified) {
      res.status(400);
      throw new Error('Email already verified');
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP
    let emailSent = false;
    try {
      await sendOTPEmail(email, otp, user.name);
      emailSent = true;
    } catch (error) {
      console.error('Email sending failed:', error);
      if (process.env.NODE_ENV !== 'development') {
        res.status(500);
        throw new Error('Failed to send OTP email. Please try again later.');
      }
    }

    res.status(200).json({
      success: true,
      message: emailSent ? 'OTP sent successfully' : 'OTP generated (Email failed, use code on screen)',
      // 🔥 ONLY FOR DEVELOPMENT
      devOTP: (process.env.NODE_ENV === 'development' && !emailSent) ? otp : undefined,
      emailSent
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};

module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP,
  getMe
};
