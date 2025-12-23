const User = require('../models/User');

// @desc    Get all volunteers with optional filtering
// @route   GET /api/users/volunteers
// @access  Private (NGO/Admin)
const getVolunteers = async (req, res) => {
    try {
        const { status, sortBy } = req.query; // status: 'available', 'busy', 'offline'

        // Basic query for users with role 'volunteer'
        let query = { role: 'volunteer' };

        // For now, we don't have a real-time status field in the schema, 
        // but we can simulate or filter if we add one later.
        // If we had a 'status' field in User model, we'd add:
        // if (status) query.status = status;

        let volunteers = await User.find(query).select('-password');

        // Mock sorting logic (e.g., by reliabilityScore)
        if (sortBy === 'reliability') {
            volunteers = volunteers.sort((a, b) => b.stats.reliabilityScore - a.stats.reliabilityScore);
        }

        res.json(volunteers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getVolunteers };
