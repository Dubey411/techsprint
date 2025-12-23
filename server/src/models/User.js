const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['restaurant', 'ngo', 'volunteer', 'admin'],
        default: 'restaurant'
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
    },
    address: String,
    phone: String,
    verified: { type: Boolean, default: false },
    stats: {
        totalDonated: { type: Number, default: 0 },
        totalClaimed: { type: Number, default: 0 },
        reliabilityScore: { type: Number, default: 100 }
    },
    capacity: {
        refrigerationMax: { type: Number, default: 100 }, // kg
        refrigerationUsed: { type: Number, default: 0 },
        storageMax: { type: Number, default: 500 }, // kg (Dry)
        storageUsed: { type: Number, default: 0 },
        volunteerLimit: { type: Number, default: 10 }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
