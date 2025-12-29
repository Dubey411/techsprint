// const express = require('express');
// const router = express.Router();
// const { getVolunteers } = require('../controllers/userController');
// const { protect, authorize } = require('../middleware/authMiddleware');

// router.get('/volunteers', protect, authorize('ngo', 'admin'), getVolunteers);

// module.exports = router;


// server/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    getVolunteers,
    updateVolunteerStatus,
    assignVolunteerToDonation,
    getVolunteerCurrentTask,
    completeVolunteerTask,
    getVolunteerStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Volunteer management (NGO/Admin)
router.get('/volunteers', protect, authorize('ngo', 'admin'), getVolunteers);
router.post('/volunteers/:volunteerId/assign-donation', protect, authorize('ngo', 'admin'), assignVolunteerToDonation);

// Volunteer self-management
router.put('/volunteer/status', protect, authorize('volunteer'), updateVolunteerStatus);
router.get('/volunteer/tasks/current', protect, authorize('volunteer'), getVolunteerCurrentTask);
router.put('/volunteer/tasks/:taskId/complete', protect, authorize('volunteer'), completeVolunteerTask);
router.get('/volunteer/stats', protect, authorize('volunteer'), getVolunteerStats);

module.exports = router;