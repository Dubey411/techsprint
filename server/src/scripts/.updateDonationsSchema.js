// server/src/scripts/addPermissionsToDonations.js
const mongoose = require('mongoose');
require('dotenv').config();
const Donation = require('../models/Donation');

const migrateDonations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('Connected to database');
        
        // Update all donations to have default permissions
        const result = await Donation.updateMany(
            { 
                $or: [
                    { permissions: { $exists: false } },
                    { permissions: null }
                ]
            },
            { 
                $set: { 
                    permissions: 'private',
                    approvedVolunteers: [],
                    visibleTo: []
                } 
            }
        );
        
        console.log(`Updated ${result.modifiedCount} donations with default permissions`);
        
        // Also add managingNgo field to claimed donations
        const ngoResult = await Donation.updateMany(
            { 
                claimedBy: { $exists: true, $ne: null },
                managingNgo: { $exists: false }
            },
            { 
                $set: { 
                    managingNgo: { $ifNull: ['$claimedBy', null] }
                } 
            }
        );
        
        console.log(`Updated ${ngoResult.modifiedCount} donations with managingNgo field`);
        
        mongoose.connection.close();
        console.log('Migration completed successfully');
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateDonations();