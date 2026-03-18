const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
    ,eventId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'booked', 'cancelled'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['non_paid', 'paid', 'failed'],
        default: 'non_paid',
    },
    amount: {
        type: Number,
        required: true,
    },
}, { timestamps: true });   

module.exports = mongoose.model('Booking', bookingSchema);