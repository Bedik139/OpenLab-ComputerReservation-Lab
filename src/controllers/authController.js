/**
 * Auth Controller (Ivan)
 *
 * TODO (Ivan):
 * 1. Import User model: const User = require('../models/User');
 *
 * 2. login(req, res):
 *    - Extract { email, password } from req.body
 *    - Find user by email: const user = await User.findOne({ email: email.toLowerCase() });
 *    - If not found, return res.status(401).json({ error: 'Invalid email or password' });
 *    - Compare password: const match = await user.comparePassword(password);
 *    - If no match, return 401
 *    - If technician-only login (req.body.techOnly) and user.accountType !== 'technician', return 403
 *    - Set session:
 *      req.session.user = {
 *        _id: user._id,
 *        firstName: user.firstName,
 *        lastName: user.lastName,
 *        email: user.email,
 *        studentId: user.studentId,
 *        college: user.college,
 *        accountType: user.accountType,
 *        bio: user.bio,
 *        avatarUrl: user.avatarUrl,
 *        avatarClass: user.avatarClass
 *      };
 *    - Return res.json({ success: true, user: req.session.user });
 *
 * 3. register(req, res):
 *    - Extract { firstName, lastName, studentId, email, college, accountType, password } from req.body
 *    - Check if email already exists
 *    - Check if studentId already exists
 *    - Create new User document
 *    - Set session (same shape as login)
 *    - Return res.json({ success: true, user: req.session.user });
 *
 * 4. logout(req, res):
 *    - req.session.destroy()
 *    - Return res.json({ success: true });
 *
 * 5. Export: module.exports = { login, register, logout };
 */

// TODO: Implement the above

// 1. Import User model
const User = require('../models/User');

// 2. login(req, res)
const login = async (req, res) => {
    try {
        const { email, password, techOnly } = req.body;

        // Back-end validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }

        // Find user by email (ensure it's case-insensitive by converting to lowercase)
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // If not found, return 401
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password (assuming a method exists on the User schema)
        const match = await user.comparePassword(password);
        
        // If no match, return 401
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if technician-only login was requested and if user qualifies
        if (techOnly && user.accountType !== 'technician') {
            return res.status(403).json({ error: 'Access denied. Technician account required.' });
        }

        // Set session variables
        req.session.user = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            studentId: user.studentId,
            college: user.college,
            accountType: user.accountType,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            avatarClass: user.avatarClass
        };

        // Handle "Remember Me" — extend cookie to 3 weeks
        const rememberMe = req.body.rememberMe;
        if (rememberMe) {
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 21; // 3 weeks
        }

        // Return success
        return res.json({ success: true, user: req.session.user });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ error: 'Internal server error during login' });
    }
};

// 3. register(req, res)
const register = async (req, res) => {
    try {
        const { firstName, lastName, studentId, email, college, accountType, password } = req.body;

        // Back-end validation
        if (!firstName || !firstName.trim()) {
            return res.status(400).json({ error: 'First name is required.' });
        }
        if (!lastName || !lastName.trim()) {
            return res.status(400).json({ error: 'Last name is required.' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }
        if (!studentId || !/^[0-9]{8}$/.test(studentId)) {
            return res.status(400).json({ error: 'Student ID must be exactly 8 digits.' });
        }
        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        }
        const validColleges = ['CCS', 'CLA', 'COB', 'COE', 'COS', 'GCOE', 'SOE', 'BAGCED'];
        if (!college || !validColleges.includes(college)) {
            return res.status(400).json({ error: 'Please select a valid college.' });
        }
        const validAccountTypes = ['student', 'technician'];
        if (accountType && !validAccountTypes.includes(accountType)) {
            return res.status(400).json({ error: 'Invalid account type.' });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email is already in use.' });
        }

        // Check if studentId already exists (only if studentId is provided)
        if (studentId) {
            const existingStudentId = await User.findOne({ studentId });
            if (existingStudentId) {
                return res.status(400).json({ error: 'Student ID is already registered.' });
            }
        }

        // Create new User document 
        // Note: Password hashing should ideally be handled by a pre-save hook in the User model!
        const newUser = new User({
            firstName,
            lastName,
            studentId,
            email: email.toLowerCase(),
            college,
            accountType: accountType || 'student', // default to student if not provided
            password
        });

        const user = await newUser.save();

        // Set session
        req.session.user = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            studentId: user.studentId,
            college: user.college,
            accountType: user.accountType,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            avatarClass: user.avatarClass
        };

        return res.status(201).json({ success: true, user: req.session.user });

    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ error: 'Internal server error during registration' });
    }
};

// 4. logout(req, res)
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout Error:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        
        // Clear the session cookie from the browser
        res.clearCookie('connect.sid'); 
        return res.json({ success: true });
    });
};

// 5. Export functions
module.exports = { login, register, logout };