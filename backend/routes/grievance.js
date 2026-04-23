const express = require('express');
const router = express.Router();
const {
  getGrievances,
  getGrievanceById,
  createGrievance,
  updateGrievance,
  deleteGrievance,
  searchGrievances
} = require('../controllers/grievanceController');
const { protect } = require('../middleware/authMiddleware');

// The order of routes matters. /search must be defined before /:id 
// otherwise 'search' will be treated as an id parameter.
router.route('/search').get(protect, searchGrievances);

router.route('/')
  .get(protect, getGrievances)
  .post(protect, createGrievance);

router.route('/:id')
  .get(protect, getGrievanceById)
  .put(protect, updateGrievance)
  .delete(protect, deleteGrievance);

module.exports = router;
