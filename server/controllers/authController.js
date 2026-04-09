import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (customer or technician)
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { email, password, fullName, phone, address, role, specialization, experience, certifications } = req.body;

    // Validation
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!['customer', 'technician'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const userResult = await query(
      'INSERT INTO users (email, password, full_name, phone, address, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, full_name, phone, address, role, created_at',
      [email, hashedPassword, fullName, phone || null, address || null, role]
    );

    const user = userResult.rows[0];

    // If technician, create technician profile
    if (role === 'technician') {
      await query(
        'INSERT INTO technicians (user_id, specialization, experience, certifications) VALUES ($1, $2, $3, $4)',
        [user.id, specialization || '', experience || 0, certifications || '']
      );
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return token
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Get user from database
    const result = await query(
      'SELECT id, email, password, full_name, phone, address, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // If role is specified, check if it matches
    if (role && user.role !== role) {
      return res.status(401).json({ message: `Invalid credentials for ${role} login` });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If technician, check if verified
    if (user.role === 'technician') {
      const techResult = await query(
        'SELECT verified FROM technicians WHERE user_id = $1',
        [user.id]
      );
      if (techResult.rows.length > 0 && !techResult.rows[0].verified) {
        return res.status(403).json({ 
          message: 'Your technician account is pending verification by admin' 
        });
      }
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    // User is already attached to req by protect middleware
    const user = req.user;

    // If technician, get additional info
    if (user.role === 'technician') {
      const techResult = await query(
        'SELECT id, specialization, experience, certifications, rating, total_jobs, available, verified FROM technicians WHERE user_id = $1',
        [user.id]
      );
      if (techResult.rows.length > 0) {
        user.technicianInfo = techResult.rows[0];
      }
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
