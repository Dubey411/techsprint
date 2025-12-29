const express = require("express");
const router = express.Router();
const { db, admin } = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

// Volunteer sends live GPS
router.put("/donations/:id/location", protect, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const donationRef = db.collection("donations").doc(req.params.id);
    const donationSnap = await donationRef.get();

    if (!donationSnap.exists) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const donation = donationSnap.data();

    // In Firebase we use uid
    if (donation.assignedVolunteer !== req.user.uid) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update location (assuming foodLocations is where we track live location or similar)
    // Note: The previous mongo code used donation.foodLocations = [{ lat, lng }]
    await donationRef.update({
      foodLocations: [{ lat, lng }],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Emit live tracking
    if (req.app.get("io")) {
      req.app.get("io").emit("volunteer_location", {
        donationId: req.params.id,
        lat,
        lng
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Location Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
