/**
 * User Model (Chrisander)
 *
 * TODO (Chrisander):
 * 1. Import mongoose
 * 2. Define userSchema with these fields:
 *    - firstName: { type: String, required: true, trim: true }
 *    - lastName:  { type: String, required: true, trim: true }
 *    - email:     { type: String, required: true, unique: true, lowercase: true, trim: true }
 *    - studentId: { type: String, required: true, unique: true }
 *    - college:   { type: String, required: true, enum: ['CCS','CLA','COB','COE','COS','GCOE','SOE','BAGCED'] }
 *    - accountType: { type: String, enum: ['student','technician'], default: 'student' }
 *    - password:  { type: String, required: true }
 *    - bio:       { type: String, default: '' }
 *    - avatarUrl: { type: String, default: null }
 *    - avatarClass: { type: String, default: '' }
 * 3. Add timestamps: true to schema options
 * 4. Add a pre('save') hook that hashes the password with bcrypt (saltRounds = 10)
 *    - Only hash if password field is modified: if (!this.isModified('password')) return next();
 * 5. Add an instance method: userSchema.methods.comparePassword = async function(candidatePassword) { ... }
 *    - Use bcrypt.compare(candidatePassword, this.password)
 * 6. Export the model: module.exports = mongoose.model('User', userSchema);
 */

// TODO: Implement the above

const mongoose = require('mongoose'); // call mongoose to interact with MongoDB
const bcrypt = require('bcrypt'); // for hashing passwords

// This is the schema for our User model
const userSchema = new mongoose.Schema({
    firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },

  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },

  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },

  studentId: { 
    type: String, 
    required: true, 
    unique: true 
  },

  college: { 
    type: String, 
    required: true, 
    enum: ['CCS','CLA','COB','COE','COS','GCOE','SOE','BAGCED'] 
  },

  accountType: { 
    type: String, 
    enum: ['student','technician'], 
    default: 'student' 
  },

  password: { 
    type: String, 
    required: true 
  },

  bio: { 
    type: String, 
    default: '' 
  },

  avatarUrl: { 
    type: String, 
    default: null 
  },

  avatarClass: { 
    type: String, 
    default: '' 
  },

  notifications: {
    type: Boolean,
    default: true
  }
  
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically


// This async function awaits the password hashing process before saving the user
userSchema.pre('save', async function(next) {

  // if the password field has not been modified,
  //  we can skip hashing and move to the next middleware
  if (!this.isModified('password')) return next();

  // If the password has been modified (or it's a new user), 
  // we need to hash it before saving
  try {
    const saltRounds = 10; // This is the cost factor for bcrypt, higher means more secure but slower
    const hashedPassword = await bcrypt.hash(this.password, saltRounds); // Hash the password using bcrypt

    this.password = hashedPassword; // Replace the plain text password with the hashed version
    next(); 
  } 
  
  // If there's an error during hashing, pass it to the next middleware (error handler)
  catch (error) {
    next(error);
  }

});

// This method compares the candidate password with the hashed password in the database
// The candidate password is the one the user is trying to log in with, 
// and this.password is the hashed password stored in the database
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


// Export the User model so it can be used in other parts of the application
module.exports = mongoose.model('User', userSchema);