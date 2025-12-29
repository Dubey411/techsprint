// server/src/routes/testRoutes.js (create new file)
const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Test endpoint for debugging
router.get('/test/ngo-donations', protect, async (req, res) => {
    try {
        console.log('=== TEST ENDPOINT CALLED ===');
        console.log('User:', {
            id: req.user.id,
            name: req.user.name,
            role: req.user.role
        });
        
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ 
                error: 'Not an NGO',
                userRole: req.user.role 
            });
        }
        
        // Try different queries
        const queries = {
            claimedByUser: { claimedBy: req.user.id },
            managingNgoUser: { managingNgo: req.user.id },
            combined: { 
                $or: [
                    { claimedBy: req.user.id },
                    { managingNgo: req.user.id }
                ]
            }
        };
        
        const results = {};
        
        for (const [key, query] of Object.entries(queries)) {
            results[key] = await Donation.find(query)
                .populate('donor', 'name')
                .populate('claimedBy', 'name')
                .select('title status permissions');
        }
        
        res.json({
            user: {
                id: req.user.id,
                name: req.user.name,
                role: req.user.role
            },
            results: {
                claimedByCount: results.claimedByUser.length,
                managingNgoCount: results.managingNgoUser.length,
                combinedCount: results.combined.length,
                claimedByDonations: results.claimedByUser,
                managingNgoDonations: results.managingNgoUser
            }
        });
        
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;