const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Load service account key
const serviceAccountPath = path.resolve(__dirname, "../../firebase-service-account.json");

const connectFirebase = () => {
    try {
        if (!fs.existsSync(serviceAccountPath)) {
            console.error("\n❌ FIREBASE CONFIGURATION ERROR:");
            console.error(`   Missing file: ${serviceAccountPath}`);
            console.error("   Please ensure 'firebase-service-account.json' is in your server root.\n");
            return;
        }

        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("🔥 Firebase Connected (Firestore)");
        }
    } catch (error) {
        console.error("❌ Firebase Initialization Error:", error.message);
    }
};

// Initialize immediately
connectFirebase();

// Proxy for db to avoid null reference errors during module load
const db = new Proxy({}, {
    get: (target, prop) => {
        if (admin.apps.length === 0) {
            throw new Error("❌ Attempted to use Firestore before Firebase was initialized. Check your service account key.");
        }
        return admin.firestore()[prop];
    }
});

module.exports = { admin, db, connectFirebase };
