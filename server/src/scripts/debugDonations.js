// server/src/scripts/debugDonations.js
const mongoose = require('mongoose');
require('dotenv').config();
const Donation = require('../models/Donation');
const User = require('../models/User');

const debugDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');
        
        // Check database connection
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('📁 Collections in database:');
        collections.forEach(col => console.log(`  - ${col.name}`));
        
        // Count documents
        const donationCount = await Donation.countDocuments();
        const userCount = await User.countDocuments();
        console.log(`\n📊 Document counts:`);
        console.log(`  - Donations: ${donationCount}`);
        console.log(`  - Users: ${userCount}`);
        
        // Check donation schema
        console.log('\n🔍 Checking donation schema fields:');
        const sampleDonation = await Donation.findOne();
        if (sampleDonation) {
            console.log('Sample donation fields:', Object.keys(sampleDonation.toObject()));
            console.log('Has permissions field?', 'permissions' in sampleDonation);
            console.log('Has claimedBy field?', 'claimedBy' in sampleDonation);
        } else {
            console.log('No donations found in database');
        }
        
        // List all users by role
        console.log('\n👥 Users by role:');
        const roles = ['restaurant', 'ngo', 'volunteer', 'admin'];
        for (const role of roles) {
            const count = await User.countDocuments({ role });
            console.log(`  - ${role}: ${count}`);
            if (count > 0) {
                const users = await User.find({ role }).select('name email _id').limit(3);
                users.forEach(user => console.log(`    * ${user.name} (${user.email}) - ${user._id}`));
            }
        }
        
        // Check for donations with claimedBy
        console.log('\n🎯 Donations with claimedBy field:');
        const claimedDonations = await Donation.find({ claimedBy: { $exists: true, $ne: null } })
            .populate('claimedBy', 'name role')
            .populate('donor', 'name')
            .select('title status permissions claimedBy donor');
        
        console.log(`Found ${claimedDonations.length} claimed donations:`);
        claimedDonations.forEach((d, i) => {
            console.log(`${i + 1}. "${d.title}"`);
            console.log(`   Status: ${d.status}, Permissions: ${d.permissions || 'not set'}`);
            console.log(`   Claimed by: ${d.claimedBy?.name} (${d.claimedBy?.role})`);
            console.log(`   Donor: ${d.donor?.name}`);
            console.log();
        });
        
        // Test the NGO query
        console.log('\n🧪 Testing NGO query:');
        const ngoUsers = await User.find({ role: 'ngo' }).select('_id name');
        console.log(`Found ${ngoUsers.length} NGO users:`);
        
        for (const ngo of ngoUsers) {
            console.log(`\nNGO: ${ngo.name} (${ngo._id})`);
            
            // Query 1: claimedBy this NGO
            const claimedByNgo = await Donation.countDocuments({ claimedBy: ngo._id });
            console.log(`  Donations claimed by this NGO: ${claimedByNgo}`);
            
            // Query 2: managingNgo
            const managingNgo = await Donation.countDocuments({ managingNgo: ngo._id });
            console.log(`  Donations managed by this NGO: ${managingNgo}`);
            
            // Combined query (like in controller)
            const combined = await Donation.find({
                $or: [
                    { claimedBy: ngo._id },
                    { managingNgo: ngo._id }
                ]
            }).select('title status');
            
            console.log(`  Total (combined query): ${combined.length}`);
            if (combined.length > 0) {
                combined.forEach(d => console.log(`    - ${d.title} (${d.status})`));
            }
        }
        
        mongoose.connection.close();
        console.log('\n✅ Debug completed');
        
    } catch (error) {
        console.error('❌ Debug error:', error);
        process.exit(1);
    }
};

debugDatabase();