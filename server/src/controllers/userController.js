// // server/src/controllers/userController.js


// const User = require('../models/User');

// // @desc    Get all volunteers with optional filtering
// // @route   GET /api/users/volunteers
// // @access  Private (NGO/Admin)
// const getVolunteers = async (req, res) => {
//     try {
//         const { status, sortBy } = req.query; // status: 'available', 'busy', 'offline'

//         // Basic query for users with role 'volunteer'
//         let query = { role: 'volunteer' };

//         // For now, we don't have a real-time status field in the schema, 
//         // but we can simulate or filter if we add one later.
//         // If we had a 'status' field in User model, we'd add:
//         // if (status) query.status = status;

//         let volunteers = await User.find(query).select('-password');

//         // Mock sorting logic (e.g., by reliabilityScore)
//         if (sortBy === 'reliability') {
//             volunteers = volunteers.sort((a, b) => b.stats.reliabilityScore - a.stats.reliabilityScore);
//         }

//         res.json(volunteers);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// module.exports = { getVolunteers };



// server/src/controllers/userController.js
const User = require('../models/User');
const Donation = require('../models/Donation');
const { createNotification } = require('./notificationController');

// @desc    Get all volunteers with optional filtering
// @route   GET /api/users/volunteers
// @access  Private (NGO/Admin)
const getVolunteers = async (req, res) => {
    try {
        const { 
            status, 
            sortBy,
            lat,
            lng,
            radius = 50,
            available = true 
        } = req.query;

        // Basic query for users with role 'volunteer'
        let query = { role: 'volunteer' };

        // Filter by availability if provided
        if (status) {
            // Map frontend status to actual field
            switch(status) {
                case 'available':
                    query.isActive = true;
                    query.currentTask = null;
                    break;
                case 'busy':
                    query.currentTask = { $ne: null };
                    break;
                case 'offline':
                    query.isActive = false;
                    break;
            }
        } else if (available === 'true') {
            // Default to available volunteers
            query.isActive = true;
            query.currentTask = null;
        }

        // Filter by location if provided
        let locationFilter = {};
        if (lat && lng) {
            const distance = parseInt(radius) * 1000; // Convert km to meters
            locationFilter = {
                location: {
                    $near: {
                        $geometry: { 
                            type: 'Point', 
                            coordinates: [parseFloat(lng), parseFloat(lat)] 
                        },
                        $maxDistance: distance
                    }
                }
            };
        }

        // Combine queries
        const finalQuery = { ...query, ...locationFilter };

        let volunteers = await User.find(finalQuery)
            .select('-password')
            .populate('currentTask', 'title status')
            .lean();

        // Enhance volunteer data with stats
        volunteers = volunteers.map(volunteer => {
            // Calculate reliability score based on completed tasks
            const reliabilityScore = volunteer.completedTasks > 0 
                ? Math.min(100, (volunteer.completedTasks / (volunteer.completedTasks + (volunteer.failedTasks || 0))) * 100)
                : 0;

            return {
                ...volunteer,
                stats: {
                    reliabilityScore: Math.round(reliabilityScore),
                    totalDeliveries: volunteer.completedTasks || 0,
                    successRate: reliabilityScore
                },
                // Determine status for frontend
                status: volunteer.currentTask ? 'busy' : (volunteer.isActive ? 'available' : 'offline')
            };
        });

        // Apply sorting
        if (sortBy === 'reliability') {
            volunteers.sort((a, b) => b.stats.reliabilityScore - a.stats.reliabilityScore);
        } else if (sortBy === 'distance' && lat && lng) {
            // Sort by distance (MongoDB already returns nearest first due to $near)
        } else {
            // Default sort: available first, then by rating
            volunteers.sort((a, b) => {
                if (a.status === 'available' && b.status !== 'available') return -1;
                if (b.status === 'available' && a.status !== 'available') return 1;
                return (b.rating || 0) - (a.rating || 0);
            });
        }

        res.json(volunteers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update volunteer availability status
// @route   PUT /api/users/volunteer/status
// @access  Private (Volunteer)
const updateVolunteerStatus = async (req, res) => {
    try {
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({ message: 'Only volunteers can update status' });
        }

        const { isActive, currentLocation } = req.body;
        
        const updateData = { isActive };
        
        // Update location if provided
        if (currentLocation && currentLocation.lat && currentLocation.lng) {
            updateData.location = {
                type: 'Point',
                coordinates: [currentLocation.lng, currentLocation.lat],
                address: currentLocation.address || ''
            };
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select('-password');

        // Emit socket event for real-time updates
        if (req.app.get('io')) {
            req.app.get('io').emit('volunteer_status_updated', {
                volunteerId: user._id,
                isActive: user.isActive,
                location: user.location
            });
        }

        res.json({
            success: true,
            isActive: user.isActive,
            location: user.location
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Assign volunteer to a donation
// @route   POST /api/users/volunteers/:volunteerId/assign-donation
// @access  Private (NGO/Admin)
const assignVolunteerToDonation = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const { donationId } = req.body;

        // Find volunteer
        const volunteer = await User.findById(volunteerId);
        if (!volunteer || volunteer.role !== 'volunteer') {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        // Check if volunteer is available
        if (!volunteer.isActive || volunteer.currentTask) {
            return res.status(400).json({ 
                message: 'Volunteer is not available',
                currentTask: volunteer.currentTask
            });
        }

        // Find donation
        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Check if donation is available for assignment
        if (donation.status !== 'claimed') {
            return res.status(400).json({ 
                message: 'Donation cannot be assigned',
                currentStatus: donation.status
            });
        }

        // Verify NGO owns this claim (if user is NGO)
        if (req.user.role === 'ngo' && donation.claimedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to assign this donation' });
        }

        // Assign volunteer to donation
        donation.assignedVolunteer = volunteerId;
        donation.status = 'assigned';
        await donation.save();

        // Update volunteer's current task
        volunteer.currentTask = donationId;
        await volunteer.save();

        // Populate data for response
        await donation.populate('assignedVolunteer', 'name email phone location');
        await donation.populate('donor', 'name address phone');
        await donation.populate('claimedBy', 'name');

        // Create notifications
        await createNotification(
            volunteerId,
            `You have been assigned to pick up "${donation.title}" from ${donation.donor.name}.`,
            'info',
            donation._id,
            'Task'
        );

        await createNotification(
            req.user.id,
            `Volunteer ${volunteer.name} has been assigned to pick up "${donation.title}".`,
            'success',
            donation._id,
            'Donation'
        );

        await createNotification(
            donation.donor._id,
            `Volunteer ${volunteer.name} will pick up your donation "${donation.title}".`,
            'info',
            donation._id,
            'Donation'
        );

        // Emit socket event for real-time updates
        if (req.app.get('io')) {
            req.app.get('io').emit('volunteer_assigned', {
                donationId: donation._id,
                volunteerId,
                ngoId: req.user.id
            });
        }

        res.json({
            success: true,
            message: 'Volunteer assigned successfully',
            donation,
            volunteer: {
                _id: volunteer._id,
                name: volunteer.name,
                phone: volunteer.phone
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get volunteer's current task
// @route   GET /api/users/volunteer/tasks/current
// @access  Private (Volunteer)
const getVolunteerCurrentTask = async (req, res) => {
    try {
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({ message: 'Only volunteers can access tasks' });
        }

        const volunteer = await User.findById(req.user.id)
            .populate({
                path: 'currentTask',
                populate: [
                    { path: 'donor', select: 'name address phone location' },
                    { path: 'claimedBy', select: 'name address phone' }
                ]
            });

        if (!volunteer.currentTask) {
            return res.json({ task: null });
        }

        res.json({ task: volunteer.currentTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Complete volunteer task
// @route   PUT /api/users/volunteer/tasks/:taskId/complete
// @access  Private (Volunteer)
const completeVolunteerTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, notes } = req.body; // status: 'picked_up', 'delivered'

        if (req.user.role !== 'volunteer') {
            return res.status(403).json({ message: 'Only volunteers can update tasks' });
        }

        // Find donation/task
        const donation = await Donation.findById(taskId);
        if (!donation) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Verify volunteer is assigned to this task
        if (donation.assignedVolunteer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        // Update donation status
        donation.status = status;
        if (notes) donation.deliveryNotes = notes;
        await donation.save();

        // If task is delivered, update volunteer stats
        if (status === 'delivered') {
            const volunteer = await User.findById(req.user.id);
            volunteer.completedTasks += 1;
            volunteer.currentTask = null;
            
            // Update rating based on completion
            const newRating = Math.min(5, (volunteer.rating * (volunteer.completedTasks - 1) + 5) / volunteer.completedTasks);
            volunteer.rating = parseFloat(newRating.toFixed(2));
            
            await volunteer.save();

            // Create completion notification
            await createNotification(
                donation.claimedBy,
                `Volunteer ${req.user.name} has delivered "${donation.title}" to your location.`,
                'success',
                donation._id,
                'Donation'
            );
        }

        res.json({
            success: true,
            message: `Task marked as ${status}`,
            donation
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get volunteer statistics
// @route   GET /api/users/volunteer/stats
// @access  Private (Volunteer)
const getVolunteerStats = async (req, res) => {
    try {
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({ message: 'Only volunteers can access stats' });
        }

        const volunteer = await User.findById(req.user.id);
        
        // Get additional stats from donations
        const deliveredCount = await Donation.countDocuments({
            assignedVolunteer: req.user.id,
            status: 'delivered'
        });

        const inProgressCount = await Donation.countDocuments({
            assignedVolunteer: req.user.id,
            status: { $in: ['assigned', 'picked_up'] }
        });

        // Calculate success rate
        const totalAssigned = deliveredCount + (volunteer.failedTasks || 0);
        const successRate = totalAssigned > 0 
            ? Math.round((deliveredCount / totalAssigned) * 100)
            : 0;

        res.json({
            stats: {
                completedDeliveries: deliveredCount,
                inProgress: inProgressCount,
                successRate,
                rating: volunteer.rating || 0,
                reliabilityScore: Math.round(successRate * (volunteer.rating || 5) / 5),
                joinedDate: volunteer.createdAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getVolunteers,
    updateVolunteerStatus,
    assignVolunteerToDonation,
    getVolunteerCurrentTask,
    completeVolunteerTask,
    getVolunteerStats
};