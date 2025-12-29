const { db, admin } = require("../config/db");

/* ================= GET NOTIFICATIONS ================= */
const getNotifications = async (req, res) => {
  try {
    const snapshot = await db
      .collection("notifications")
      .where("recipient", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= MARK AS READ ================= */
const markAsRead = async (req, res) => {
  try {
    const ref = db.collection("notifications").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (doc.data().recipient !== req.user.uid) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await ref.update({
      read: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ id: ref.id, read: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= CREATE NOTIFICATION (INTERNAL) ================= */
const createNotification = async (
  recipientId,
  message,
  type = "info",
  relatedId = null,
  onModel = null
) => {
  try {
    await db.collection("notifications").add({
      recipient: recipientId,
      message,
      type,
      relatedId,
      onModel,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Notification creation failed:", error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification,
};
