const { admin, db } = require("./src/config/db");

async function testAuth() {
  try {
    console.log("Testing Firebase Auth...");
    const email = `test-${Date.now()}@example.com`;
    const userRecord = await admin.auth().createUser({
      email: email,
      password: "password123",
      displayName: "Test User",
    });
    console.log("Success! Created user:", userRecord.uid);
    
    console.log("Testing Firestore...");
    await db.collection("users").doc(userRecord.uid).set({
      name: "Test User",
      email: email,
      role: "volunteer",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("Success! Created doc in Firestore.");
    
    // Clean up
    await admin.auth().deleteUser(userRecord.uid);
    await db.collection("users").doc(userRecord.uid).delete();
    console.log("Cleanup complete.");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAuth();
