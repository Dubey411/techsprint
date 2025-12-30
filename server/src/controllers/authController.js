const { admin, db } = require("../config/db");


const jwt = require("jsonwebtoken");

/**
 * NOTE:
 * - Password handling Firebase Auth karta hai
 * - Token frontend se aata hai (ID Token) ya hum JWT issue karte hain
 * - Backend verify karta hai
 */

const generateToken = (uid) => {
  return jwt.sign({ uid }, process.env.JWT_SECRET || "your_secret_key", {
    expiresIn: "30d",
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.uid);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.status(statusCode).cookie("token", token, options).json({
    ...user,
    token, // Return for optional header storage
  });
};

/* ======================================================
   REGISTER USER
   POST /api/auth/register
   ====================================================== */
const registerUser = async (req, res) => {
  const { name, email, password, role, address, location } = req.body;

  try {
    let uid;
    
    // 1️⃣ Try to create user in Firebase Auth
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
      uid = userRecord.uid;
    } catch (authError) {
      // If user already exists in Auth (e.g. created by frontend first), get their UID
      if (authError.code === 'auth/email-already-in-use' || authError.message.includes('already in use')) {
        const existingUser = await admin.auth().getUserByEmail(email);
        uid = existingUser.uid;
      } else {
        throw authError; // Rethrow other auth errors
      }
    }

    // Normalize location if provided as {latitude, longitude}
    const normalizedLocation = location ? {
      lat: location.lat || location.latitude || null,
      lng: location.lng || location.longitude || null
    } : null;

    // 2️⃣ Store extra data in Firestore (Upsert)
    const userRef = db.collection("users").doc(uid);
    await userRef.set({
      name,
      email,
      role,
      address: address || "",
      location: normalizedLocation,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    sendTokenResponse(
      {
        uid,
        name,
        email,
        role,
      },
      201,
      res
    );
  } catch (error) {
    console.error("Register Error:", error);
    if (error.code === 5) {
      return res.status(500).json({ message: "Firestore database not found. Please ensure you have created the '(default)' database in the Firebase Console." });
    }
    res.status(400).json({
      message: error.message || "User registration failed",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ⚠️ Firebase Admin SDK doesn't support direct password login.
    // In a real app, the frontend uses Firebase SDK and sends the ID token.
    // For now, we verify the user exists in Firestore and issue a session.
    
    const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    sendTokenResponse(
      {
        uid: userDoc.id,
        ...userData
      },
      200,
      res
    );
  } catch (error) {
    console.error("Login Error:", error);
    if (error.code === 5) {
      return res.status(500).json({ message: "Firestore database not found. Please ensure you have created the '(default)' database in the Firebase Console." });
    }
    res.status(500).json({ message: "Server error during login" });
  }
};

/* ======================================================
   GET CURRENT USER
   GET /api/auth/me
   ====================================================== */
const getMe = async (req, res) => {
  try {
    const uid = req.user.uid;

    const doc = await db.collection("users").doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      uid,
      ...doc.data(),
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   LOGOUT USER
   POST /api/auth/logout
   ====================================================== */
const logoutUser = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
};

/* ======================================================
   UPDATE PROFILE
   PUT /api/auth/profile
   ====================================================== */
const updateProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    const updates = {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.phone && { phone: req.body.phone }),
      ...(req.body.address && { address: req.body.address }),
      ...(req.body.capacity && { capacity: req.body.capacity }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("users").doc(uid).update(updates);

    res.json({
      message: "Profile updated successfully",
      updates,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  updateProfile,
};
