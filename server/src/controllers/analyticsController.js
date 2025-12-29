// server/src/controllers/analyticsController.js

const Donation = require('../models/Donation');

// @desc    Get NGO Impact Analytics
// @route   GET /api/analytics/ngo
// @access  Private (NGO)
const getNGOAnalytics = async (req, res) => {
    try {
        const ngoId = req.user.id;

        // Fetch all delivered donations claimed by this NGO
        const deliveredDonations = await Donation.find({
            status: 'delivered',
            assignedNGO: ngoId
        });

        // Calculate total weight (kg)
        const totalWeight = deliveredDonations.reduce((sum, d) => {
            // Assuming quantity is stored as a string like "10 kg" or "10 items"
            // Let's attempt to parse it. If it's a number, use it directly.
            const val = parseFloat(d.quantity);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

        // Impact Factors (Standard estimates)
        const mealsPerKg = 2.5;
        const co2PerKg = 2.5; // kg of CO2 equivalent per kg of food saved

        const totalMeals = Math.round(totalWeight * mealsPerKg);
        const totalCO2Reduced = Math.round(totalWeight * co2PerKg);
        const uniquePartners = new Set(deliveredDonations.map(d => d.donor.toString())).size;

        // Trends (Last 7 days mock data for now, would ideally use aggregation)
        // In a real app, this would be a MongoDB aggregation query grouped by date
        const dailyTrends = [
            { date: 'Mon', kg: totalWeight * 0.1 },
            { date: 'Tue', kg: totalWeight * 0.15 },
            { date: 'Wed', kg: totalWeight * 0.05 },
            { date: 'Thu', kg: totalWeight * 0.2 },
            { date: 'Fri', kg: totalWeight * 0.1 },
            { date: 'Sat', kg: totalWeight * 0.25 },
            { date: 'Sun', kg: totalWeight * 0.15 }
        ];

        res.json({
            stats: {
                totalWeight,
                totalMeals,
                totalCO2Reduced,
                uniquePartners,
                communitiesServed: Math.ceil(totalMeals / 20) // Estimating 20 people per batch
            },
            trends: dailyTrends
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
};

module.exports = { getNGOAnalytics };
