/**
 * Reservation Model (Chrisander)
 *
 * TODO (Chrisander):
 * 1. Import mongoose
 * 2. Define reservationSchema with these fields:
 *    - user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
 *    - lab:       { type: String, required: true }
 *    - seat:      { type: String, required: true }
 *    - building:  { type: String, required: true }
 *    - date:      { type: Date, required: true }
 *    - timeSlot:  { type: String, required: true }
 *    - status:    { type: String, enum: ['upcoming','completed','cancelled'], default: 'upcoming' }
 *    - anonymous: { type: Boolean, default: false }
 *    - isWalkIn:  { type: Boolean, default: false }
 *    - createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
 * 3. Add timestamps: true (createdAt serves as "bookedOn")
 * 4. Add compound index for preventing double-booking:
 *    reservationSchema.index({ lab: 1, seat: 1, date: 1, timeSlot: 1, status: 1 });
 * 5. Add index for fast user lookups:
 *    reservationSchema.index({ user: 1, status: 1 });
 * 6. Export the model: module.exports = mongoose.model('Reservation', reservationSchema);
 */

// TODO: Implement the above

const mongoose = require('mongoose'); // call mongoose to interact with MongoDB

// This is the schema for our Reservation model
const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reservation belongs to a User
    required: true
  },

  lab: {
    type: String,
    required: true
  },

  seat: {
    type: String,
    required: true
  },

  building: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  timeSlot: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['upcoming','completed','cancelled'],
    default: 'upcoming'
  },

  isAnonymous: {
    type: Boolean,
    default: false
  },

  isWalkIn: {
    type: Boolean,
    default: false
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true }); // timestamps: true automatically adds createdAt and updatedAt fields

// Helps prevent double-booking by checking if a reservation already exists
// for the same lab, seat, date, and time slot.
reservationSchema.index({
  lab: 1,
  seat: 1,
  date: 1,
  timeSlot: 1,
  status: 1
});


// Index for fast user lookup
reservationSchema.index({
  user: 1,
  status: 1
});


// Export the Reservation model so it can be used in other parts of the application
module.exports = mongoose.model('Reservation', reservationSchema);
