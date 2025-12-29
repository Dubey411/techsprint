const { db, admin } = require("../config/db");
const { createNotification } = require("./notificationController");

/* ================= GET VOLUNTEERS ================= */
const getVolunteers = async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .where("role", "==", "volunteer")
      .get();

    let volunteers = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    volunteers = volunteers.map(v => {
      const completed = v.completedTasks || 0;
      const failed = v.failedTasks || 0;
      const reliability =
        completed > 0 ? Math.min(100, (completed / (completed + failed)) * 100) : 0;

      return {
        ...v,
        status: v.currentTask ? "busy" : v.isActive ? "available" : "offline",
        stats: {
          reliabilityScore: Math.round(reliability),
          totalDeliveries: completed,
          successRate: Math.round(reliability),
        },
      };
    });

    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE VOLUNTEER STATUS ================= */
const updateVolunteerStatus = async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { isActive, currentLocation } = req.body;

    const updates = { isActive };

    if (currentLocation?.lat && currentLocation?.lng) {
      updates.location = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        address: currentLocation.address || "",
      };
    }

    await db.collection("users").doc(req.user.uid).update(updates);

    if (req.app.get("io")) {
      req.app.get("io").emit("volunteer_status_updated", {
        volunteerId: req.user.uid,
        ...updates,
      });
    }

    res.json({ success: true, ...updates });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ASSIGN VOLUNTEER TO DONATION ================= */
const assignVolunteerToDonation = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { donationId } = req.body;

    const volunteerRef = db.collection("users").doc(volunteerId);
    const volunteerSnap = await volunteerRef.get();
    if (!volunteerSnap.exists || volunteerSnap.data().role !== "volunteer") {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    const volunteer = volunteerSnap.data();
    if (!volunteer.isActive || volunteer.currentTask) {
      return res.status(400).json({ message: "Volunteer not available" });
    }

    const donationRef = db.collection("donations").doc(donationId);
    const donationSnap = await donationRef.get();
    if (!donationSnap.exists) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const donation = donationSnap.data();
    if (donation.status !== "claimed") {
      return res.status(400).json({ message: "Donation not assignable" });
    }

    await donationRef.update({
      assignedVolunteer: volunteerId,
      status: "assigned",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await volunteerRef.update({
      currentTask: donationId,
    });

    await createNotification(
      volunteerId,
      `You are assigned to pick up "${donation.title}".`,
      "info",
      donationId,
      "Task"
    );

    if (req.app.get("io")) {
      req.app.get("io").emit("volunteer_assigned", {
        donationId,
        volunteerId,
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= CURRENT TASK ================= */
const getVolunteerCurrentTask = async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const userSnap = await db.collection("users").doc(req.user.uid).get();
    const taskId = userSnap.data().currentTask;

    if (!taskId) return res.json({ task: null });

    const taskSnap = await db.collection("donations").doc(taskId).get();
    res.json({ task: { id: taskSnap.id, ...taskSnap.data() } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= COMPLETE TASK ================= */
const completeVolunteerTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, notes } = req.body;

    const donationRef = db.collection("donations").doc(taskId);
    const donationSnap = await donationRef.get();
    if (!donationSnap.exists) {
      return res.status(404).json({ message: "Task not found" });
    }

    const donation = donationSnap.data();
    if (donation.assignedVolunteer !== req.user.uid) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await donationRef.update({
      status,
      deliveryNotes: notes || "",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (status === "delivered") {
      const userRef = db.collection("users").doc(req.user.uid);
      await userRef.update({
        completedTasks: admin.firestore.FieldValue.increment(1),
        currentTask: null,
      });
    }

    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= VOLUNTEER STATS ================= */
const getVolunteerStats = async (req, res) => {
  try {
    const userSnap = await db.collection("users").doc(req.user.uid).get();
    const user = userSnap.data();

    const deliveredSnap = await db
      .collection("donations")
      .where("assignedVolunteer", "==", req.user.uid)
      .where("status", "==", "delivered")
      .get();

    const inProgressSnap = await db
      .collection("donations")
      .where("assignedVolunteer", "==", req.user.uid)
      .where("status", "in", ["assigned", "picked_up"])
      .get();

    const completed = deliveredSnap.size;
    const failed = user.failedTasks || 0;
    const successRate =
      completed + failed > 0 ? Math.round((completed / (completed + failed)) * 100) : 0;

    res.json({
      stats: {
        completedDeliveries: completed,
        inProgress: inProgressSnap.size,
        successRate,
        rating: user.rating || 0,
        reliabilityScore: Math.round(successRate),
        joinedDate: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getVolunteers,
  updateVolunteerStatus,
  assignVolunteerToDonation,
  getVolunteerCurrentTask,
  completeVolunteerTask,
  getVolunteerStats,
};
