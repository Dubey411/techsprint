const { admin, db } = require("./src/config/db");

async function cleanupDonations() {
  try {
    console.log("Starting data cleanup...");
    const snapshot = await db.collection("donations").get();
    
    let fixedCount = 0;
    const batch = db.batch();

    snapshot.forEach(doc => {
      const data = doc.data();
      const updates = {};
      let needsFix = false;

      // Ensure donor is never undefined (use a fallback for legacy broken data)
      if (data.donor === undefined) {
        updates.donor = "legacy-unknown-donor";
        needsFix = true;
      }

      // Ensure title is never undefined
      if (data.title === undefined) {
        updates.title = "Legacy Donation";
        needsFix = true;
      }

      if (needsFix) {
        batch.update(doc.ref, updates);
        fixedCount++;
      }
    });

    if (fixedCount > 0) {
      await batch.commit();
      console.log(`Successfully fixed ${fixedCount} donation documents.`);
    } else {
      console.log("No malformed documents found.");
    }
    
    console.log("Cleanup complete.");
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}

cleanupDonations();
