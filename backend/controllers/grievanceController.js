const Grievance = require('../models/Grievance');

// @desc    Get all grievances for logged in user
// @route   GET /api/grievances
// @access  Private
const getGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(grievances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single grievance by ID
// @route   GET /api/grievances/:id
// @access  Private
const getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Check for user ownership
    if (grievance.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    res.status(200).json(grievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create grievance
// @route   POST /api/grievances
// @access  Private
const createGrievance = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const grievance = await Grievance.create({
      title,
      description,
      category,
      user: req.user.id,
    });

    res.status(201).json(grievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update grievance
// @route   PUT /api/grievances/:id
// @access  Private
const updateGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Check for user ownership
    if (grievance.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedGrievance = await Grievance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedGrievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete grievance
// @route   DELETE /api/grievances/:id
// @access  Private
const deleteGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Check for user ownership
    if (grievance.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await grievance.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search grievances by title (case-insensitive)
// @route   GET /api/grievances/search?title=xyz
// @access  Private
const searchGrievances = async (req, res) => {
  try {
    const titleQuery = req.query.title;
    
    if (!titleQuery) {
      return res.status(400).json({ message: 'Please provide a title query' });
    }

    // Search for title matching regex (case-insensitive)
    const grievances = await Grievance.find({
      user: req.user.id,
      title: { $regex: titleQuery, $options: 'i' }
    }).sort({ date: -1 });

    res.status(200).json(grievances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGrievances,
  getGrievanceById,
  createGrievance,
  updateGrievance,
  deleteGrievance,
  searchGrievances
};
