const Grievance = require('../models/Grievance');

// @desc    Get all grievances (Admin sees all; Student sees own)
// @route   GET /api/grievances
// @access  Private
const getGrievances = async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'admin') {
      // Admin can filter by category or status
      if (req.query.category && req.query.category !== 'All') {
        filter.category = req.query.category;
      }
      if (req.query.status && req.query.status !== 'All') {
        filter.status = req.query.status;
      }
      const grievances = await Grievance.find(filter)
        .populate('user', 'name email')
        .populate('resolvedBy', 'name email')
        .sort({ date: -1 });
      return res.status(200).json(grievances);
    }

    // Student sees only own grievances
    filter.user = req.user.id;
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }

    const grievances = await Grievance.find(filter)
      .populate('resolvedBy', 'name email')
      .sort({ date: -1 });
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
    const grievance = await Grievance.findById(req.params.id)
      .populate('user', 'name email')
      .populate('resolvedBy', 'name email');

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Check for authorization (admin or owner)
    if (req.user.role !== 'admin' && grievance.user._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    res.status(200).json(grievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create grievance (Student)
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

// @desc    Update grievance details (Student owner)
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
      return res.status(401).json({ message: 'User not authorized to edit this grievance' });
    }

    if (grievance.status === 'Resolved') {
      return res.status(400).json({ message: 'Cannot modify a grievance that has already been resolved' });
    }

    const updatedGrievance = await Grievance.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title || grievance.title,
        description: req.body.description || grievance.description,
        category: req.body.category || grievance.category,
      },
      { new: true }
    );

    res.status(200).json(updatedGrievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Update grievance status & add resolution remarks
// @route   PUT /api/grievances/:id/status
// @access  Private (Admin Only)
const updateGrievanceStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    grievance.status = status;
    if (adminRemark !== undefined) {
      grievance.adminRemark = adminRemark;
    }
    
    if (status === 'Resolved' || status === 'Rejected') {
      grievance.resolvedAt = new Date();
      grievance.resolvedBy = req.user.id;
    }

    await grievance.save();

    const populatedGrievance = await Grievance.findById(grievance._id)
      .populate('user', 'name email')
      .populate('resolvedBy', 'name email');

    res.status(200).json(populatedGrievance);
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

    // Check for user ownership or admin role
    if (req.user.role !== 'admin' && grievance.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete' });
    }

    await grievance.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search grievances
// @route   GET /api/grievances/search?title=xyz
// @access  Private
const searchGrievances = async (req, res) => {
  try {
    const titleQuery = req.query.title;
    
    if (!titleQuery) {
      return res.status(400).json({ message: 'Please provide a search query' });
    }

    let query = {
      $or: [
        { title: { $regex: titleQuery, $options: 'i' } },
        { description: { $regex: titleQuery, $options: 'i' } }
      ]
    };

    if (req.user.role === 'admin') {
      const grievances = await Grievance.find(query)
        .populate('user', 'name email')
        .populate('resolvedBy', 'name email')
        .sort({ date: -1 });
      return res.status(200).json(grievances);
    }

    query.user = req.user.id;
    const grievances = await Grievance.find(query)
      .populate('resolvedBy', 'name email')
      .sort({ date: -1 });
    res.status(200).json(grievances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get grievance statistics (Admin overview)
// @route   GET /api/grievances/stats
// @access  Private (Admin Only)
const getGrievanceStats = async (req, res) => {
  try {
    const total = await Grievance.countDocuments();
    const pending = await Grievance.countDocuments({ status: 'Pending' });
    const inProgress = await Grievance.countDocuments({ status: 'In Progress' });
    const resolved = await Grievance.countDocuments({ status: 'Resolved' });
    const rejected = await Grievance.countDocuments({ status: 'Rejected' });

    // Category breakdown
    const categories = ['Academic', 'Hostel', 'Transport', 'Other'];
    const byCategory = {};
    for (const cat of categories) {
      byCategory[cat] = await Grievance.countDocuments({ category: cat });
    }

    res.status(200).json({
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGrievances,
  getGrievanceById,
  createGrievance,
  updateGrievance,
  updateGrievanceStatus,
  deleteGrievance,
  searchGrievances,
  getGrievanceStats
};
