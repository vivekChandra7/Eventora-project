const express = require('express');
const router = express.Router();

// ✅ FIXED IMPORT NAMES
const { register, login, verifyOTP } = require('../controllers/authController');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// OTP verification route
router.post('/verify-otp', verifyOTP);

module.exports = router; 