const { admin, db } = require("./src/config/db");
require("dotenv").config();

async function createTestUsers() {
    const testUsers = [
        {
            email: "test-ngo@foodconnect.com",
            password: "Test123!",
            name: "Test NGO",
            role: "ngo",
            address: "123 NGO Street, Delhi",
            location: { lat: 28.6139, lng: 77.2090 }
        },
        {
            email: "test-volunteer@foodconnect.com",
            password: "Test123!",
            name: "Test Volunteer",
            role: "volunteer",
            address: "456 Volunteer Road, Mumbai",
            location: { lat: 19.0760, lng: 72.8777 }
        }
    ];

    console.log("\n🔧 Creating test users...\n");

    for (const userData of testUsers) {
        try {
            let uid;
            
            // Try to create in Firebase Auth
            try {
                const userRecord = await admin.auth().createUser({
                    email: userData.email,
                    password: userData.password,
                    displayName: userData.name,
                });
                uid = userRecord.uid;
                console.log(`✅ Created in Firebase Auth: ${userData.email}`);
            } catch (authError) {
                if (authError.code === 'auth/email-already-exists') {
                    const existingUser = await admin.auth().getUserByEmail(userData.email);
                    uid = existingUser.uid;
                    console.log(`ℹ️  Already exists in Auth: ${userData.email}`);
                    
                    // Update password
                    await admin.auth().updateUser(uid, { password: userData.password });
                    console.log(`✅ Password reset to: ${userData.password}`);
                } else {
                    throw authError;
                }
            }

            // Create/Update in Firestore
            await db.collection("users").doc(uid).set({
                name: userData.name,
                email: userData.email,
                role: userData.role,
                address: userData.address,
                location: userData.location,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            
            console.log(`✅ Created/Updated in Firestore: ${userData.email}`);
            console.log(`   UID: ${uid}`);
            console.log(`   Role: ${userData.role}`);
            console.log(`   Password: ${userData.password}`);
            console.log('-------------------\n');
            
        } catch (error) {
            console.error(`❌ Error creating ${userData.email}:`, error.message);
        }
    }

    console.log("\n✨ Test users ready! Use these credentials to log in:\n");
    console.log("NGO Account:");
    console.log("  Email: test-ngo@foodconnect.com");
    console.log("  Password: Test123!");
    console.log("\nVolunteer Account:");
    console.log("  Email: test-volunteer@foodconnect.com");
    console.log("  Password: Test123!\n");

    process.exit(0);
}

createTestUsers();
