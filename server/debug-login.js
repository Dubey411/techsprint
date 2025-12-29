const { admin, db } = require("./src/config/db");
const jwt = require("jsonwebtoken");

async function debugLogin(email) {
  try {
    console.log(`\n--- DEBUG START ---`);
    console.log(`Checking Firestore connectivity...`);
    
    // Try a simple write/read first to verify connectivity
    const pingDoc = db.collection("debug").doc("ping");
    await pingDoc.set({ time: Date.now() });
    console.log("✅ Firestore write successful");
    await pingDoc.delete();
    console.log("✅ Firestore delete successful");

    console.log(`Querying for email: ${email}`);
    const snapshot = await db.collection("users").where("email", "==", email).get();
    
    console.log(`Snapshot size: ${snapshot.size}`);

    if (snapshot.empty) {
      console.log("❌ No user document found in Firestore 'users' collection with this email.");
      return;
    }

    const userDoc = snapshot.docs[0];
    console.log("✅ User found in Firestore:", userDoc.id);
    console.log("User data:", JSON.stringify(userDoc.data(), null, 2));

    const uid = userDoc.id;
    const token = jwt.sign({ uid }, process.env.JWT_SECRET || "your_secret_key");
    console.log("✅ JWT signed successfully");

    console.log(`--- DEBUG SUCCESS ---`);
  } catch (error) {
    console.error(`--- DEBUG FAILED ---`);
    console.error(`Error Name: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`Error Code: ${error.code}`);
    console.error(`Stack trace: ${error.stack}`);
    if (error.details) console.error(`Details: ${error.details}`);
  }
}

debugLogin("dube19@gmail.com");
