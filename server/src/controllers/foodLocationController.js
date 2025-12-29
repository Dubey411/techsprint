const { db, admin } = require("../config/db");

// @desc    Add food location to donation
// @route   POST /api/donations/:id/food-locations
// @access  Private (Restaurant)
const addFoodLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const donationRef = db.collection("donations").doc(req.params.id);
    const donationSnap = await donationRef.get();

    if (!donationSnap.exists) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const donation = donationSnap.data();

    // In Firebase, req.user.uid is used instead of req.user.id
    if (donation.donor !== req.user.uid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Add food location coordinates
    await donationRef.update({
      foodLocations: admin.firestore.FieldValue.arrayUnion({ lat, lng }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedSnap = await donationRef.get();
    res.json(updatedSnap.data().foodLocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get food locations for donation
// @route   GET /api/donations/:id/food-locations
// @access  Private
const getFoodLocations = async (req, res) => {
  try {
    const donationSnap = await db.collection("donations").doc(req.params.id).get();

    if (!donationSnap.exists) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.json(donationSnap.data().foodLocations || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove food location from donation
// @route   DELETE /api/donations/:id/food-locations/:index
// @access  Private (Restaurant/Admin)
const removeFoodLocation = async (req, res) => {
  try {
    const donationRef = db.collection("donations").doc(req.params.id);
    const donationSnap = await donationRef.get();

    if (!donationSnap.exists) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const donation = donationSnap.data();
    if (donation.donor !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const index = parseInt(req.params.index);
    let foodLocations = donation.foodLocations || [];
    if (index >= 0 && index < foodLocations.length) {
      foodLocations.splice(index, 1);
      await donationRef.update({
        foodLocations,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json(foodLocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addFoodLocation,
  getFoodLocations,
  removeFoodLocation,
};
