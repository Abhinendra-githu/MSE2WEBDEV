const express = require('express');
const router = express.Router();
const {
  getGrievances,
  getGrievanceById,
  createGrievance,
  updateGrievance,
  updateGrievanceStatus,
  deleteGrievance,
  searchGrievances,
  getGrievanceStats
} = require('../controllers/grievanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Specific routes before parameterized :id routes
router.route('/stats').get(protect, adminOnly, getGrievanceStats);
router.route('/search').get(protect, searchGrievances);

// Main CRUD routes
router.route('/')
  .get(protect, getGrievances)
  .post(protect, createGrievance);

router.route('/:id')
  .get(protect, getGrievanceById)
  .put(protect, updateGrievance)
  .delete(protect, deleteGrievance);

// Admin resolution endpoint
router.route('/:id/status')
  .put(protect, adminOnly, updateGrievanceStatus);

module.exports = router;
