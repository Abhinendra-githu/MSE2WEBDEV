const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Generate JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing on server');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

// @desc    Register new student / admin
// @route   POST /api/register
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const studentExists = await Student.findOne({ email });

    if (studentExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    const assignedRole = role === 'admin' ? 'admin' : 'student';

    // Create user
    const student = await Student.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    if (student) {
      res.status(201).json({
        _id: student.id,
        name: student.name,
        email: student.email,
        role: student.role || 'student',
        token: generateToken(student._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user
// @route   POST /api/login
// @access  Public
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const student = await Student.findOne({ email });

    if (student && (await student.matchPassword(password))) {
      res.json({
        _id: student.id,
        name: student.name,
        email: student.email,
        role: student.role || 'student',
        token: generateToken(student._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
};
