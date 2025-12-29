




const express = require('express');
const router = express.Router();
const { createDonation, getDonations, claimDonation, getMyDonations, getVolunteerTasks, updateTaskStatus, getClaimedDonations } = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('restaurant', 'admin'), createDonation);
// Volunteer specific
router.get('/tasks', protect, authorize('volunteer'), getVolunteerTasks);
router.put('/:id/status', protect, authorize('volunteer'), updateTaskStatus);

router.get('/my', protect, getMyDonations);
router.get('/claimed', protect, authorize('ngo'), getClaimedDonations);
router.get('/', protect, getDonations);
router.put('/:id/claim', protect, authorize('ngo', 'volunteer', 'admin'), claimDonation);

module.exports = router;