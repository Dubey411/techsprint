const { db } = require('./src/config/db');

async function testConnection() {
    try {
        console.log("Attempting to write...");
        const ref = db.collection('test_connection').doc('ping');
        await ref.set({ time: new Date().toISOString() });
        console.log("Write success!");
        
        console.log("Attempting to read...");
        const doc = await ref.get();
        console.log("Read success:", doc.data());
        console.log("Firestore is working correctly.");
        process.exit(0);
    } catch (error) {
        console.error("Firestore connection failed:", error);
        process.exit(1);
    }
}

testConnection();
