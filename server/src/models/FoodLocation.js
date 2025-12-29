// controllers/foodLocationController.js
const Donation = require('../models/Donation');

// @desc    Add food location to donation
// @route   POST /api/donations/:id/food-locations
// @access  Private (Restaurant)
const addFoodLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.donor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Add food location coordinates
        donation.foodLocations.push({ lat, lng });
        await donation.save();

        res.json(donation.foodLocations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get food locations for donation
// @route   GET /api/donations/:id/food-locations
// @access  Private
const getFoodLocations = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        res.json(donation.foodLocations || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove food location from donation
// @route   DELETE /api/donations/:id/food-locations/:index
// @access  Private (Restaurant/Admin)
const removeFoodLocation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const index = parseInt(req.params.index);
        if (index >= 0 && index < donation.foodLocations.length) {
            donation.foodLocations.splice(index, 1);
            await donation.save();
        }

        res.json(donation.foodLocations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addFoodLocation,
    getFoodLocations,
    removeFoodLocation
};