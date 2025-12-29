
// server/src/models/Donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    foodType: {
        type: String,
        enum: ['veg', 'non-veg', 'both', 'cooked', 'bakery'],
        required: true
    },
    quantity: { type: String, required: true }, // e.g., "5 kg" or "20 packets"
    expiryDate: { type: Date, required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' },
        address: String // Optional: store address text too if needed
    },
    dropLocation: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' },
        address: String
    },
    // ADD THIS FIELD HERE - food locations array
    foodLocations: [{
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    }],
    status: {
        type: String,
        enum: ['available', 'claimed', 'picked_up', 'completed', 'expired'],
        default: 'available'
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permissions: {
        type: String,
        enum: ['private', 'ngo_only', 'all_volunteers'],
        default: 'private' // Make sure this default is set
    },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);



