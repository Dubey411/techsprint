const { admin, db } = require("./src/config/db");

async function testFirestore() {
  try {
    console.log("Testing Firestore...");
    const testDoc = db.collection("test").doc("test-doc");
    await testDoc.set({
      message: "Hello Firestore",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    const doc = await testDoc.get();
    console.log("Firestore Success! Data:", doc.data());
    await testDoc.delete();
    console.log("Firestore Cleanup complete.");
  } catch (error) {
    console.error("Firestore Test failed:", error);
  }
}

testFirestore();
