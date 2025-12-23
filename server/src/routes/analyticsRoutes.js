const express = require('express');
const router = express.Router();
const { getNGOAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/ngo', protect, authorize('ngo'), getNGOAnalytics);

module.exports = router;
