// server/src/scripts/createTestDonations.js
const mongoose = require('mongoose');
require('dotenv').config();
const Donation = require('../models/Donation');
const User = require('../models/User');

const createTestData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Find an NGO user
        const ngoUser = await User.findOne({ role: 'ngo' });
        
        if (!ngoUser) {
            console.log('No NGO user found. Creating one...');
            // Create a test NGO user
            ngoUser = await User.create({
                name: 'Test NGO',
                email: 'ngo@test.com',
                password: 'password123',
                role: 'ngo',
                verified: true
            });
        }
        
        // Find a restaurant user
        let restaurantUser = await User.findOne({ role: 'restaurant' });
        
        if (!restaurantUser) {
            console.log('No restaurant user found. Creating one...');
            restaurantUser = await User.create({
                name: 'Test Restaurant',
                email: 'restaurant@test.com',
                password: 'password123',
                role: 'restaurant',
                verified: true
            });
        }
        
        // Create test donations
        const testDonations = [
            {
                donor: restaurantUser._id,
                title: 'Fresh Vegetable Platter',
                description: 'Assorted fresh vegetables from today\'s delivery',
                foodType: 'veg',
                quantity: '15 kg',
                expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                location: {
                    type: 'Point',
                    coordinates: [77.2090, 28.6139] // Delhi coordinates
                },
                status: 'claimed',
                claimedBy: ngoUser._id,
                permissions: 'private',
                approvedVolunteers: [],
                visibleTo: []
            },
            {
                donor: restaurantUser._id,
                title: 'Cooked Rice and Curry',
                description: 'Freshly cooked meals from lunch service',
                foodType: 'veg',
                quantity: '50 meals',
                expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
                location: {
                    type: 'Point',
                    coordinates: [77.1025, 28.7041]
                },
                status: 'claimed',
                claimedBy: ngoUser._id,
                permissions: 'all_volunteers',
                approvedVolunteers: [],
                visibleTo: []
            },
            {
                donor: restaurantUser._id,
                title: 'Bakery Items',
                description: 'Fresh bread, pastries, and cakes',
                foodType: 'bakery',
                quantity: '30 packets',
                expiryDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
                location: {
                    type: 'Point',
                    coordinates: [77.1860, 28.5355]
                },
                status: 'claimed',
                claimedBy: ngoUser._id,
                permissions: 'ngo_only',
                approvedVolunteers: [],
                visibleTo: []
            }
        ];
        
        // Clear old test donations
        await Donation.deleteMany({ donor: restaurantUser._id });
        
        // Insert test donations
        const created = await Donation.insertMany(testDonations);
        
        console.log(`Created ${created.length} test donations`);
        console.log('\nTest donations:');
        created.forEach((d, i) => {
            console.log(`${i + 1}. "${d.title}" - ${d.permissions} - Claimed by NGO`);
        });
        
        mongoose.connection.close();
        console.log('\nTest data created successfully!');
        
    } catch (error) {
        console.error('Error creating test data:', error);
        process.exit(1);
    }
};

createTestData();