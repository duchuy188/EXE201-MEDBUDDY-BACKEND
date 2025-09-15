const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        hospital: {
            type: String,
            required: true
        },
        location: {
            type: String
        },
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        notes: {
            type: String
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
