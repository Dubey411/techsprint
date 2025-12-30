const { db, admin } = require("../config/db");
const { createNotification } = require("./notificationController");

/* ================= HELPERS ================= */
const populateUserData = async (donations) => {
  const userIds = new Set();
  donations.forEach(d => {
    if (d.donor) userIds.add(d.donor);
    if (d.claimedBy) userIds.add(d.claimedBy);
    if (d.assignedVolunteer) userIds.add(d.assignedVolunteer);
  });

  if (userIds.size === 0) return donations;

  const users = {};
  const userDocs = await Promise.all(
    Array.from(userIds).map(id => db.collection("users").doc(id).get())
  );

  userDocs.forEach(doc => {
    if (doc.exists) {
        const data = doc.data();
        users[doc.id] = {
            id: doc.id,
            name: data.name,
            role: data.role,
            address: data.address,
            location: data.location,
            phone: data.phone
        };
    }
  });

  return donations.map(d => ({
    ...d,
    donor: typeof d.donor === 'string' ? users[d.donor] || { name: 'Unknown Donor' } : d.donor,
    claimedBy: typeof d.claimedBy === 'string' ? users[d.claimedBy] || { name: 'Unknown NGO' } : d.claimedBy,
    assignedVolunteer: typeof d.assignedVolunteer === 'string' ? users[d.assignedVolunteer] || null : d.assignedVolunteer
  }));
};

/* ================= CREATE DONATION ================= */
const createDonation = async (req, res) => {
  try {
    const { title, description, foodType, quantity, expiryDate, location } = req.body;

    let donationLocation = location || req.user.location || null;

    const ref = await db.collection("donations").add({
      donor: req.user.uid,
      title,
      description,
      foodType,
      quantity,
      expiryDate,
      location: donationLocation,
      status: "available",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const donation = { id: ref.id };

    if (req.app.get("io")) {
      req.app.get("io").emit("new_donation", donation);
    }

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET DONATIONS ================= */
const getDonations = async (req, res) => {
  try {
    const status = req.query.status || "available";

    const snapshot = await db
      .collection("donations")
      .where("status", "==", status)
      .get();

    let donations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    donations = await populateUserData(donations);

    res.json(donations);
  } catch (error) {
    console.error("Get Donations Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= CLAIM DONATION ================= */
const claimDonation = async (req, res) => {
  try {
    const ref = db.collection("donations").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const donation = doc.data();
    const updates = {};

    if (req.user.role === "ngo") {
      if (donation.status !== "available") {
        return res.status(400).json({ message: "Donation already claimed" });
      }
      updates.status = "claimed";
      updates.claimedBy = req.user.uid;
      if (req.body.dropLocation) updates.dropLocation = req.body.dropLocation;
    }

    if (req.user.role === "volunteer") {
      if (donation.status === "available") {
        updates.status = "claimed";
        updates.assignedVolunteer = req.user.uid;
      } else if (donation.status === "claimed" && !donation.assignedVolunteer) {
        updates.assignedVolunteer = req.user.uid;
      } else {
        return res.status(400).json({ message: "Donation not available" });
      }
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await ref.update(updates);

    if (req.app.get("io")) {
      req.app.get("io").emit("donation_updated", { id: ref.id, ...updates });
    }

    if (donation.donor) {
      await createNotification(
        donation.donor,
        `Your donation "${donation.title}" has been claimed.`,
        "success",
        ref.id,
        "Donation"
      );
    }

    res.json({ id: ref.id, ...updates });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= MY DONATIONS ================= */
const getMyDonations = async (req, res) => {
  try {
    const snapshot = await db
      .collection("donations")
      .where("donor", "==", req.user.uid)
      .get();

    let donations = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    donations = await populateUserData(donations);

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= VOLUNTEER TASKS ================= */
const getVolunteerTasks = async (req, res) => {
  try {
    const snapshot = await db
      .collection("donations")
      .where("assignedVolunteer", "==", req.user.uid)
      .get();

    let tasks = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    tasks = await populateUserData(tasks);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE TASK STATUS ================= */
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ref = db.collection("donations").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) return res.status(404).json({ message: "Donation not found" });

    const donation = doc.data();
    if (donation.assignedVolunteer !== req.user.uid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await ref.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (req.app.get("io")) {
      req.app.get("io").emit("donation_updated", { id: ref.id, status });
    }

    res.json({ id: ref.id, status });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= CLAIMED DONATIONS (NGO) ================= */
const getClaimedDonations = async (req, res) => {
  try {
    const snapshot = await db
      .collection("donations")
      .where("claimedBy", "==", req.user.uid)
      .get();

    let donations = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    donations = await populateUserData(donations);

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createDonation,
  getDonations,
  claimDonation,
  getMyDonations,
  getVolunteerTasks,
  updateTaskStatus,
  getClaimedDonations,
};
