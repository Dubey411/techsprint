// routes/foodLocationRoutes.js
const express = require('express');
const router = express.Router();
const {
    createFoodLocations,
    getFoodLocationsByDonation,
    getNearbyFoodLocations,
    assignFoodLocation,
    updateFoodLocationStatus,
    getAssignedFoodLocations,
    getDashboardStats,
    deleteFoodLocation
} = require('../controllers/foodLocationController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Restaurant routes
router.post('/', authorize('restaurant'), createFoodLocations);

// Volunteer/NGO routes
router.get('/nearby', authorize('volunteer', 'ngo'), getNearbyFoodLocations);
router.put('/:id/assign', authorize('volunteer', 'ngo'), assignFoodLocation);
router.get('/assigned', authorize('volunteer'), getAssignedFoodLocations);
router.put('/:id/status', authorize('volunteer'), updateFoodLocationStatus);

// General routes
router.get('/donation/:donationId', getFoodLocationsByDonation);
router.get('/dashboard', getDashboardStats);

// Admin/Restaurant routes
router.delete('/:id', authorize('admin', 'restaurant'), deleteFoodLocation);

module.exports = router;