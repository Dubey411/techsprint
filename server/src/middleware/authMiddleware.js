const { admin, db } = require("../config/db");

/* ================= PROTECT ================= */
const protect = async (req, res, next) => {
  let token;

  // Check Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } 
  // Check Cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    let uid;

    // 1️⃣ Try verifying as Firebase ID Token
    try {
      const decodedFirebase = await admin.auth().verifyIdToken(token);
      uid = decodedFirebase.uid;
    } catch (firebaseErr) {
      // 2️⃣ Fallback to custom JWT (for backend-issued sessions)
      const jwt = require("jsonwebtoken");
      const decodedJwt = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
      uid = decodedJwt.uid;
    }

    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      uid,
      ...userSnap.data(),
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/* ================= AUTHORIZE ================= */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
