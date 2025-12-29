// server/src/scripts/createRealTestData.js
const mongoose = require('mongoose');
require('dotenv').config();
const Donation = require('../models/Donation');
const User = require('../models/User');

const createData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Get or create NGO user (use your actual NGO user email)
        let ngoUser = await User.findOne({ email: 'your-ngo-email@example.com' });
        if (!ngoUser) {
            ngoUser = await User.findOne({ role: 'ngo' });
        }
        
        if (!ngoUser) {
            console.log('❌ No NGO user found! Please log in as NGO first.');
            return;
        }
        
        console.log(`✅ Using NGO: ${ngoUser.name} (${ngoUser._id})`);
        
        // Create a real donation
        const donation = await Donation.create({
            donor: ngoUser._id, // For testing, use NGO as donor
            title: 'Test Donation for NGO',
            description: 'This is a test donation to verify NGO management',
            foodType: 'veg',
            quantity: '10 kg',
            expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
            location: {
                type: 'Point',
                coordinates: [77.2090, 28.6139]
            },
            status: 'claimed',
            claimedBy: ngoUser._id,
            permissions: 'ngo_only',
            approvedVolunteers: [],
            visibleTo: [],
            managingNgo: ngoUser._id
        });
        
        console.log('✅ Created test donation:', {
            id: donation._id,
            title: donation.title,
            permissions: donation.permissions,
            claimedBy: donation.claimedBy
        });
        
        // Verify it can be retrieved
        const retrieved = await Donation.findOne({ 
            claimedBy: ngoUser._id 
        }).populate('claimedBy', 'name');
        
        console.log('✅ Retrieved donation:', retrieved ? 'Yes' : 'No');
        if (retrieved) {
            console.log('Donation details:', {
                title: retrieved.title,
                claimedBy: retrieved.claimedBy?.name
            });
        }
        
        mongoose.connection.close();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

createData();