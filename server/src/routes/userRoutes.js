const express = require('express');
const router = express.Router();
const { getVolunteers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/volunteers', protect, authorize('ngo', 'admin'), getVolunteers);

module.exports = router;
