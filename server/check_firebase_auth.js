const { admin, db } = require("./src/config/db");
require("dotenv").config();

async function checkFirebaseAuth() {
    try {
        console.log("\n=== FIREBASE AUTH USERS ===");
        const authUsers = await admin.auth().listUsers(100);
        console.log(`Found ${authUsers.users.length} users in Firebase Auth:\n`);
        
        authUsers.users.forEach(user => {
            console.log(`- UID: ${user.uid}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Email Verified: ${user.emailVerified}`);
            console.log(`  Disabled: ${user.disabled}`);
            console.log('-------------------');
        });

        console.log("\n=== FIRESTORE USERS ===");
        const snapshot = await db.collection("users").get();
        console.log(`Found ${snapshot.size} users in Firestore:\n`);
        
        const firestoreUsers = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            firestoreUsers.push({
                uid: doc.id,
                email: data.email,
                role: data.role,
                name: data.name
            });
            console.log(`- UID: ${doc.id}`);
            console.log(`  Email: ${data.email}`);
            console.log(`  Role: ${data.role}`);
            console.log(`  Name: ${data.name}`);
            console.log('-------------------');
        });

        console.log("\n=== SYNC CHECK ===");
        const authUIDs = new Set(authUsers.users.map(u => u.uid));
        const firestoreUIDs = new Set(firestoreUsers.map(u => u.uid));

        console.log("Users in Auth but NOT in Firestore:");
        authUsers.users.forEach(u => {
            if (!firestoreUIDs.has(u.uid)) {
                console.log(`  - ${u.email} (${u.uid})`);
            }
        });

        console.log("\nUsers in Firestore but NOT in Auth:");
        firestoreUsers.forEach(u => {
            if (!authUIDs.has(u.uid)) {
                console.log(`  - ${u.email} (${u.uid})`);
            }
        });

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkFirebaseAuth();
