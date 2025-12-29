const { admin, db } = require("./src/config/db");
const jwt = require("jsonwebtoken");

async function debugFullLogin(email) {
  try {
    console.log(`\n[1] Starting Login Debug for: ${email}`);
    
    console.log(`[2] Querying Firestore for user...`);
    // Note: If this fails with NOT_FOUND, the database doesn't exist.
    const snapshot = await db.collection("users").where("email", "==", email).get();
    
    console.log(`[3] Query finished. Snapshot size: ${snapshot.size}`);

    if (snapshot.empty) {
      console.log("[-] Result: NO_USER_IN_FIRESTORE");
      // Let's try to see if ANY users exist
      const allUsers = await db.collection("users").limit(5).get();
      console.log(`[!] Total users in collection: ${allUsers.size}`);
      return;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    console.log(`[+] User found. ID: ${userDoc.id}`);
    console.log(`[+] User Role: ${userData.role}`);

    console.log(`[4] Signing JWT...`);
    const token = jwt.sign({ uid: userDoc.id }, process.env.JWT_SECRET || "your_secret_key");
    console.log(`[+] Token generated: ${token.substring(0, 20)}...`);

    console.log(`\n[SUCCESS] Login logic verified for this user.`);
  } catch (error) {
    console.error(`\n[FATAL ERROR]`);
    console.error(`Message: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error(`Stack: ${error.stack}`);
  }
}

// Check with the email from the user's latest screenshot
debugFullLogin("dube19@gmail.com");
