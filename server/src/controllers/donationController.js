const Donation = require('../models/Donation');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (Restaurant/Donor)
const createDonation = async (req, res) => {
    try {
        const { title, description, foodType, quantity, expiryDate, location } = req.body;

        // Default to user's location if not provided
        let donationLocation = location;
        if (!donationLocation && req.user.location) {
            donationLocation = req.user.location;
        }

        const donation = await Donation.create({
            donor: req.user.id,
            title,
            description,
            foodType,
            quantity,
            expiryDate,
            location: donationLocation
        });

        // Emitting socket event for real-time notification
        if (req.app.get('io')) {
            req.app.get('io').emit('new_donation', donation);
        }

        res.status(201).json(donation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all donations (Admin) or available donations (NGO/Volunteer)
// @route   GET /api/donations
// @access  Private
const getDonations = async (req, res) => {
    try {
        const { lat, lng, radius, status } = req.query;

        let query = {};

        // Filter by status if provided, otherwise show available
        if (status) {
            query.status = status;
        } else {
            // For volunteers, we might want 'available' or 'claimed' (which implies ready for pickup)
            // For now default to available
            query.status = 'available';
        }

        if (lat && lng) {
            const distance = radius ? parseInt(radius) * 1000 : 10000; // Default 10km
            query.location = {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: distance
                }
            };
        }

        const donations = await Donation.find(query).populate('donor', 'name address phone');
        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Claim a donation
// @route   PUT /api/donations/:id/claim
// @access  Private (NGO/Volunteer)
const claimDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.status !== 'available') {
            return res.status(400).json({ message: 'Donation already claimed' });
        }

        if (req.user.role === 'ngo') {
            donation.status = 'claimed';
            donation.claimedBy = req.user.id;
        } else if (req.user.role === 'volunteer') {
            donation.status = 'claimed'; // Or 'pickup_in_progress' if we want to distinguish
            donation.assignedVolunteer = req.user.id;
        }

        await donation.save();

        if (req.app.get('io')) {
            req.app.get('io').emit('donation_updated', donation);
        }

        // Notify Donor
        await createNotification(
            donation.donor,
            `Your donation "${donation.title}" has been claimed by ${req.user.name}.`,
            'success',
            donation._id,
            'Donation'
        );

        res.json(donation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get donations created by current user (Restaurant)
// @route   GET /api/donations/my
// @access  Private
const getMyDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user.id }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get tasks assigned to volunteer
// @route   GET /api/donations/tasks
// @access  Private (Volunteer)
const getVolunteerTasks = async (req, res) => {
    try {
        const tasks = await Donation.find({ assignedVolunteer: req.user.id, status: { $in: ['claimed', 'picked_up'] } })
            .populate('donor', 'name address phone location')
            .populate('claimedBy', 'name address phone location') // Add if claimed by NGO
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update task status (e.g. picked_up, completed)
// @route   PUT /api/donations/:id/status
// @access  Private (Volunteer)
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const donation = await Donation.findById(req.params.id);

        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        if (donation.assignedVolunteer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        donation.status = status;
        await donation.save();

        if (req.app.get('io')) {
            req.app.get('io').emit('donation_updated', donation);
        }

        const action = status === 'picked_up' ? 'picked up' : 'delivered';

        // Notify Donor
        await createNotification(
            donation.donor,
            `Your donation "${donation.title}" has been ${action}.`,
            'info',
            donation._id,
            'Donation'
        );

        // Notify ClaimedBy (NGO) if exists and not same as current user (Volunteer picking up for NGO)
        if (donation.claimedBy && donation.claimedBy.toString() !== req.user.id) {
            await createNotification(
                donation.claimedBy,
                `Donation "${donation.title}" has been ${action} by ${req.user.name}.`,
                'info',
                donation._id,
                'Donation'
            );
        }

        res.json(donation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get donations claimed by current NGO
// @route   GET /api/donations/claimed
// @access  Private (NGO)
const getClaimedDonations = async (req, res) => {
    try {
        const donations = await Donation.find({
            claimedBy: req.user.id,
            status: { $ne: 'expired' } // Fetch all active/completed history, or filter further in frontend
        })
            .populate('donor', 'name address phone location')
            .populate('assignedVolunteer', 'name phone location')
            .sort({ updatedAt: -1 });

        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createDonation, getDonations, claimDonation, getMyDonations, getVolunteerTasks, updateTaskStatus, getClaimedDonations };
