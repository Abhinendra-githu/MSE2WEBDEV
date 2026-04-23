const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new student
// @route   POST /api/register
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if student exists
    const studentExists = await Student.findOne({ email });

    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    // Create student
    const student = await Student.create({
      name,
      email,
      password,
    });

    if (student) {
      res.status(201).json({
        _id: student.id,
        name: student.name,
        email: student.email,
        token: generateToken(student._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid student data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a student
// @route   POST /api/login
// @access  Public
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for student email
    const student = await Student.findOne({ email });

    if (student && (await student.matchPassword(password))) {
      res.json({
        _id: student.id,
        name: student.name,
        email: student.email,
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
