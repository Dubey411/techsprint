// server/src/models/Volunteer.js (optional extension)
const mongoose = require('mongoose');
const User = require('./User');

const volunteerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Enhanced volunteer details
    skills: [{
        type: String,
        enum: ['driving', 'lifting', 'cooking', 'packaging', 'first_aid', 'language', 'other']
    }],
    
    certifications: [{
        name: String,
        issuingAuthority: String,
        issueDate: Date,
        expiryDate: Date,
        documentUrl: String
    }],
    
    availability: {
        monday: { type: Boolean, default: false },
        tuesday: { type: Boolean, default: false },
        wednesday: { type: Boolean, default: false },
        thursday: { type: Boolean, default: false },
        friday: { type: Boolean, default: false },
        saturday: { type: Boolean, default: false },
        sunday: { type: Boolean, default: false },
        preferredTimeSlots: [String]
    },
    
    taskHistory: [{
        donation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Donation'
        },
        assignedAt: Date,
        completedAt: Date,
        status: String,
        distance: Number, // km
        ratingGiven: Number,
        feedback: String
    }],
    
    preferences: {
        maxDistance: { type: Number, default: 20 }, // km
        maxWeight: { type: Number, default: 20 }, // kg
        preferredAreas: [String],
        blackoutAreas: [String],
        notificationRadius: { type: Number, default: 10 } // km
    }
}, { timestamps: true });

// Method to check if volunteer is available
volunteerSchema.methods.isAvailableNow = function() {
    const user = this.populated('user') || this.user;
    if (!user) return false;
    
    // Check user-level availability
    if (!user.isActive) return false;
    if (user.currentTask) return false;
    
    // Check day availability
    const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    if (!this.availability[today]) return false;
    
    // Check time slot if preferredTimeSlots exists
    if (this.availability.preferredTimeSlots && this.availability.preferredTimeSlots.length > 0) {
        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit' });
        // Implement time slot checking logic
    }
    
    return true;
};

module.exports = mongoose.model('Volunteer', volunteerSchema);