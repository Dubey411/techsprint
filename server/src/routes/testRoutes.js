const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Test endpoint for debugging
router.get('/test/ngo-donations', protect, async (req, res) => {
    try {
        console.log('=== TEST ENDPOINT CALLED ===');
        console.log('User:', {
            uid: req.user.uid,
            name: req.user.name,
            role: req.user.role
        });
        
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ 
                error: 'Not an NGO',
                userRole: req.user.role 
            });
        }
        
        // Firestore doesn't support $or across different fields in a simple way without multiple queries
        // or using index-heavy queries. Here we'll do two separate queries for simplicity.
        
        const claimedBySnap = await db.collection("donations")
            .where("claimedBy", "==", req.user.uid)
            .get();
            
        const managingNgoSnap = await db.collection("donations")
            .where("managingNgo", "==", req.user.uid)
            .get();
            
        const results = {
            claimedBy: claimedBySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            managingNgo: managingNgoSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        };
        
        res.json({
            user: {
                uid: req.user.uid,
                name: req.user.name,
                role: req.user.role
            },
            results: {
                claimedByCount: results.claimedBy.length,
                managingNgoCount: results.managingNgo.length,
                claimedByDonations: results.claimedBy,
                managingNgoDonations: results.managingNgo
            }
        });
        
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;