const { admin, db } = require("./src/config/db");
require("dotenv").config();

async function checkUsers() {
    try {
        const snapshot = await db.collection("users").get();
        console.log(`\nFound ${snapshot.size} users in Firestore:\n`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- ID: ${doc.id}`);
            console.log(`  Name: ${data.name}`);
            console.log(`  Email: ${data.email}`);
            console.log(`  Role: ${data.role}`);
            console.log('-------------------');
        });
        process.exit(0);
    } catch (err) {
        console.error("Error checking users:", err);
        process.exit(1);
    }
}

checkUsers();
