const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const { protect } = require("../middleware/authMiddleware");

// Volunteer sends live GPS
router.put("/donations/:id/location", protect, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.assignedVolunteer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    donation.foodLocations = [{ lat, lng }];
    await donation.save();

    // Emit live tracking
    if (req.app.get("io")) {
      req.app.get("io").emit("volunteer_location", {
        donationId: donation._id,
        lat,
        lng
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
