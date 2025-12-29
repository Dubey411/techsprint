const { admin, db } = require("./src/config/db");

async function listDonations() {
  try {
    console.log("Fetching all donations...");
    const snapshot = await db.collection("donations").get();
    
    console.log(`Found ${snapshot.size} donations:`);
    snapshot.forEach(doc => {
      const d = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`Title: ${d.title}`);
      console.log(`Status: ${d.status}`);
      console.log(`Donor: ${d.donor}`);
      console.log(`Volunteer: ${d.assignedVolunteer}`);
      console.log(`NGO: ${d.claimedBy}`);
      console.log(`---`);
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
  }
}

listDonations();
