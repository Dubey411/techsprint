const { db } = require("../config/db");

// @desc    Get NGO Impact Analytics
// @route   GET /api/analytics/ngo
// @access  Private (NGO)
const getNGOAnalytics = async (req, res) => {
  try {
    // Firebase Auth UID
    const ngoId = req.user.uid;

    // Fetch delivered donations assigned to this NGO
    const snapshot = await db
      .collection("donations")
      .where("status", "==", "delivered")
      .where("assignedNGO", "==", ngoId)
      .get();

    const deliveredDonations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate total weight (kg)
    const totalWeight = deliveredDonations.reduce((sum, d) => {
      const val = parseFloat(d.quantity);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    // Impact Factors (Standard estimates)
    const mealsPerKg = 2.5;
    const co2PerKg = 2.5;

    const totalMeals = Math.round(totalWeight * mealsPerKg);
    const totalCO2Reduced = Math.round(totalWeight * co2PerKg);

    const uniquePartners = new Set(
      deliveredDonations.map(d => d.donor)
    ).size;

    // Trends (mock – same as Mongo version)
    const dailyTrends = [
      { date: "Mon", kg: totalWeight * 0.1 },
      { date: "Tue", kg: totalWeight * 0.15 },
      { date: "Wed", kg: totalWeight * 0.05 },
      { date: "Thu", kg: totalWeight * 0.2 },
      { date: "Fri", kg: totalWeight * 0.1 },
      { date: "Sat", kg: totalWeight * 0.25 },
      { date: "Sun", kg: totalWeight * 0.15 },
    ];

    res.json({
      stats: {
        totalWeight,
        totalMeals,
        totalCO2Reduced,
        uniquePartners,
        communitiesServed: Math.ceil(totalMeals / 20),
      },
      trends: dailyTrends,
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Server error fetching analytics" });
  }
};

module.exports = { getNGOAnalytics };
