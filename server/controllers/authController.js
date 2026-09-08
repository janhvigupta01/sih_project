const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { inMemoryStore } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

// Request OTP for mobile phone login (instant SMS simulation for SIH judging)
const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required.' });
    }

    // Generate 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    inMemoryStore.otps.set(phone, { otp: generatedOtp, expiresAt });

    console.log(`📱 [SMS Gateway Simulator] OTP for ${phone}: ${generatedOtp}`);

    return res.json({
      success: true,
      message: `OTP sent successfully to +91-${phone}`,
      // For effortless hackathon demonstration and testing, return the devOtp
      devOtp: generatedOtp
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Verify OTP & Login / Auto-Register Collector
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, name, role = ROLES.COLLECTOR, language = 'hi' } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
    }

    const cached = inMemoryStore.otps.get(phone);
    
    // Allow master test OTP '1234' for quick demonstration
    const isMasterOtp = otp === '1234';
    const isValidOtp = isMasterOtp || (cached && cached.otp === otp && Date.now() <= cached.expiresAt);

    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try again.' });
    }

    // Check if user exists
    let user = inMemoryStore.users.find(u => u.phone === phone);
    if (!user) {
      // Auto-register new collector if not exists
      user = {
        _id: 'user_' + Date.now(),
        name: name || `Collector ${phone.slice(-4)}`,
        phone,
        email: `${phone}@scrapsathi.in`,
        role,
        language,
        area: 'India',
        trustScore: 85,
        totalEarned: 0,
        totalOwed: 0,
        isVerified: true,
        createdAt: new Date()
      };
      inMemoryStore.users.push(user);
    }

    // Clear OTP
    inMemoryStore.otps.delete(phone);

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Google OAuth / One-Click Social Login
const googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, picture, role = ROLES.COLLECTOR } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google email is required.' });
    }

    let user = inMemoryStore.users.find(u => u.email === email || (googleId && u.googleId === googleId));

    if (!user) {
      user = {
        _id: 'user_google_' + Date.now(),
        googleId: googleId || 'goog_' + Date.now(),
        name: name || email.split('@')[0],
        email,
        phone: '99' + Math.floor(10000000 + Math.random() * 90000000),
        picture: picture || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + email,
        role: role || ROLES.COLLECTOR,
        language: 'hi',
        area: 'Mumbai, Maharashtra',
        trustScore: 90,
        totalEarned: 0,
        totalOwed: 0,
        isVerified: true,
        createdAt: new Date()
      };
      inMemoryStore.users.push(user);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Google authentication successful!',
      token,
      user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Standard Password Login
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be phone or email
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/phone and password are required.' });
    }

    const user = inMemoryStore.users.find(
      u => u.phone === identifier || u.email?.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found with this identifier.' });
    }

    // In demo mode or if password matches 'password123'
    let isMatch = false;
    if (password === 'password123' || password === 'admin123') {
      isMatch = true;
    } else if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password. (Default demo pass is password123)' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Register
const register = async (req, res) => {
  try {
    const { name, phone, email, password, role = ROLES.COLLECTOR, companyName, cpcbRegNumber, specializedIn, language = 'hi' } = req.body;

    if (!name || (!phone && !email) || !password) {
      return res.status(400).json({ success: false, message: 'Name, contact (phone/email), and password are required.' });
    }

    const existing = inMemoryStore.users.find(u => (phone && u.phone === phone) || (email && u.email === email));
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this phone or email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      _id: 'user_' + Date.now(),
      name,
      phone: phone || '',
      email: email || `${phone}@scrapsathi.in`,
      passwordHash,
      role,
      language,
      companyName: companyName || '',
      cpcbRegNumber: cpcbRegNumber || '',
      specializedIn: specializedIn || [],
      trustScore: role === ROLES.COLLECTOR ? 85 : 95,
      totalEarned: 0,
      totalOwed: 0,
      isVerified: true,
      createdAt: new Date()
    };

    inMemoryStore.users.push(newUser);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: newUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Forgot Password Flow
const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Phone or email is required.' });
    }

    const user = inMemoryStore.users.find(
      u => u.phone === identifier || u.email?.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered user found with this contact.' });
    }

    // Generate reset token and OTP
    const resetOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetOtp = resetOtp;
    user.resetExpires = Date.now() + 15 * 60 * 1000;

    return res.json({
      success: true,
      message: `Password reset OTP generated. Sent to your contact.`,
      resetToken,
      devOtp: resetOtp
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { identifier, resetOtp, newPassword } = req.body;
    if (!identifier || !resetOtp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const user = inMemoryStore.users.find(
      u => u.phone === identifier || u.email?.toLowerCase() === identifier.toLowerCase()
    );

    if (!user || user.resetOtp !== resetOtp || Date.now() > user.resetExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset OTP.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    delete user.resetOtp;
    delete user.resetExpires;

    return res.json({
      success: true,
      message: 'Password reset successful! You can now log in.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get current profile
const getProfile = async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

module.exports = {
  requestOtp,
  verifyOtp,
  googleAuth,
  login,
  register,
  forgotPassword,
  resetPassword,
  getProfile
};
