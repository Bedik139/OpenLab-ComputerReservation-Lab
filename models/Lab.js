/**
 * Lab Model (Chrisander)
 *
 * TODO (Chrisander):
 * 1. Import mongoose
 * 2. Define labSchema with these fields:
 *    - code:        { type: String, required: true, unique: true }  // e.g. "GK101A"
 *    - building:    { type: String, required: true }                // e.g. "Gokongwei Building"
 *    - buildingKey: { type: String, required: true }                // e.g. "gokongwei" (for filtering)
 *    - totalSeats:  { type: Number, required: true }
 *    - rows:        [String]                                        // e.g. ["A","B","C","D"]
 *    - cols:        { type: Number, required: true }                // e.g. 10
 *    - hours:       { type: String, required: true }                // e.g. "7:00 AM - 9:00 PM"
 * 3. Export the model: module.exports = mongoose.model('Lab', labSchema);
 */

// TODO: Implement the above

const mongoose = require('mongoose'); // call mongoose to interact with MongoDB

// This is the schema for our Lab model
const labSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },

  building: {
    type: String,
    required: true
  },

  buildingKey: {
    type: String,
    required: true
  },

  totalSeats: {
    type: Number,
    required: true
  },

  rows: [String], 
  cols: {
    type: Number,
    required: true
  },

  hours: {
    type: String,
    required: true
  }
});



// Export the Lab model so it can be used in other parts of the application
module.exports = mongoose.model('Lab', labSchema);
