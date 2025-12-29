const { admin, db } = require("./src/config/db");

async function testUndefined() {
  try {
    console.log("Testing Firestore add() with undefined field...");
    await db.collection("notifications").add({
      recipient: undefined,
      message: "Test message",
    });
    console.log("SUCCESS: Firestore accepted undefined");
  } catch (error) {
    console.log("FAILED: Firestore rejected undefined");
    console.error("Error Message:", error.message);
  }
}

testUndefined();
