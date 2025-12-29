const { admin, db } = require("./src/config/db");

async function listCollections() {
  try {
    console.log("Attempting to list collections...");
    const collections = await db.listCollections();
    console.log("Collections found:", collections.length);
    collections.forEach(c => console.log(" - " + c.id));
    
    // Check project ID
    const project = admin.instanceId ? await admin.projectManagement().listAppMetadata() : "N/A";
    console.log("Project info:", project);
  } catch (error) {
    console.error("Error listing collections:", error);
  }
}

listCollections();
