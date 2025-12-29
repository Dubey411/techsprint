const { admin, db } = require("./src/config/db");

async function debugClaim() {
  try {
    console.log("Creating a test donation...");
    const donorUid = "test-donor-uid";
    const newDonationRef = await db.collection("donations").add({
      donor: donorUid,
      title: "Test Food " + Date.now(),
      status: "available",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    const donationId = newDonationRef.id;
    console.log(`Donation created with ID: ${donationId}`);

    // Mock volunteer user
    const volunteerUid = "test-volunteer-uid"; 
    
    console.log(`Attempting to claim as volunteer: ${volunteerUid}`);
    
    const ref = db.collection("donations").doc(donationId);
    
    const updates = {
      status: "claimed",
      assignedVolunteer: volunteerUid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log("Updating document...");
    await ref.update(updates);
    console.log("Update SUCCESSFUL");

    // Try notification logic
    console.log("Testing notification logic...");
    const donationDoc = await ref.get();
    const donation = donationDoc.data();

    if (donation.donor) {
      await db.collection("notifications").add({
        recipient: donation.donor,
        message: `Your donation "${donation.title}" has been claimed.`,
        type: "success",
        relatedId: donationId,
        onModel: "Donation",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("Notification SUCCESSFUL");
    } else {
      console.log("Skip notification: No donor found on donation document.");
    }

    // Cleanup
    console.log("Cleaning up test data...");
    await ref.delete();
    console.log("Test donation deleted.");

    console.log("\n--- DEBUG COMPLETE: NO ERRORS FOUND ---");
  } catch (error) {
    console.error("\n--- DEBUG FAILED ---");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    if (error.code) console.error("Code:", error.code);
  }
}

debugClaim();
