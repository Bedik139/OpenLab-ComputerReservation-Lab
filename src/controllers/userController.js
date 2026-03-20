/**
 * User Controller (Ivan)
 *
 * TODO (Ivan):
 * 1. Import models:
 *    const User = require('../models/User');
 *    const Reservation = require('../models/Reservation');
 *
 * 2. search(req, res):
 *    - Extract ?q=searchTerm&college=CCS from req.query
 *    - Build query: if q, match firstName/lastName/studentId with regex (case-insensitive)
 *    - If college, add { college: college } to filter
 *    - Exclude password field: .select('-password')
 *    - Return res.json(users);
 *
 * 3. getById(req, res):
 *    - Find user by _id, exclude password
 *    - Also fetch their upcoming reservations (non-anonymous only)
 *    - Return res.json({ user, reservations });
 *
 * 4. updateProfile(req, res):
 *    - Extract { firstName, lastName, college, bio } from req.body
 *    - Find user by req.session.user._id and update
 *    - Update session data to match
 *    - Return res.json({ success: true, user: req.session.user });
 *
 * 5. changePassword(req, res):
 *    - Extract { currentPassword, newPassword } from req.body
 *    - Find user and verify current password with user.comparePassword()
 *    - Set user.password = newPassword (pre-save hook will hash)
 *    - Save and return res.json({ success: true });
 *
 * 6. deleteAccount(req, res):
 *    - Delete user document
 *    - Delete all user's reservations
 *    - Destroy session
 *    - Return res.json({ success: true });
 *
 * 7. Export all functions
 */

// TODO: Implement the above

// 1. Import models
const User = require('../models/User');
const Reservation = require('../models/Reservation');

// 2. search(req, res)
const search = async (req, res) => {
    try {
        const { q, college } = req.query;
        let queryObj = {};

        // If there's a search term, match against firstName, lastName, or studentId
        if (q) {
            const regex = new RegExp(q, 'i'); // 'i' makes it case-insensitive
            queryObj.$or = [
                { firstName: regex },
                { lastName: regex },
                { studentId: regex }
            ];
        }

        // If a specific college is selected, add it to the filter
        if (college) {
            queryObj.college = college;
        }

        // Find users matching the query and explicitly exclude the password field
        const users = await User.find(queryObj).select('-password');
        
        return res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).json({ error: 'Internal server error during search' });
    }
};

// 3. getById(req, res)
const getById = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find user, excluding password
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch their upcoming reservations, but ONLY the non-anonymous ones
        const reservations = await Reservation.find({ 
            user: userId, 
            status: 'upcoming',
            isAnonymous: false 
        }).populate('lab', 'building code'); // Populating basic lab info for display

        return res.json({ success: true, user, reservations });
    } catch (error) {
        console.error(`Error fetching user ${req.params.id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 4. updateProfile(req, res)
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, college, bio } = req.body;
        const userId = req.session.user._id;

        // Back-end validation
        if (!firstName || !firstName.trim()) {
            return res.status(400).json({ error: 'First name is required.' });
        }
        if (!lastName || !lastName.trim()) {
            return res.status(400).json({ error: 'Last name is required.' });
        }
        if (college) {
            const validColleges = ['CCS', 'CLA', 'COB', 'COE', 'COS', 'GCOE', 'SOE', 'BAGCED'];
            if (!validColleges.includes(college)) {
                return res.status(400).json({ error: 'Please select a valid college.' });
            }
        }
        if (bio && bio.length > 500) {
            return res.status(400).json({ error: 'Bio must be 500 characters or less.' });
        }

        // Find user and update their details
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { firstName, lastName, college, bio }, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Keep the session data in sync with the updated database record
        req.session.user.firstName = updatedUser.firstName;
        req.session.user.lastName = updatedUser.lastName;
        req.session.user.college = updatedUser.college;
        req.session.user.bio = updatedUser.bio;

        return res.json({ success: true, user: req.session.user });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Internal server error updating profile' });
    }
};

// 5. changePassword(req, res)
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.user._id;

        // Back-end validation
        if (!currentPassword) {
            return res.status(400).json({ error: 'Current password is required.' });
        }
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
        }

        // Find the user (we need the password field here to compare it!)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect current password' });
        }

        // Set new password (the pre-save hook in the User model will hash it automatically)
        user.password = newPassword;
        await user.save();

        return res.json({ success: true, message: 'Password successfully updated' });
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ error: 'Internal server error changing password' });
    }
};

// 6. deleteAccount(req, res)
const deleteAccount = async (req, res) => {
    try {
        const userId = req.session.user._id;

        // Delete all reservations owned by this user
        await Reservation.deleteMany({ user: userId });

        // Delete the user document itself
        await User.findByIdAndDelete(userId);

        // Destroy the session and clear the cookie
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session during account deletion:', err);
                return res.status(500).json({ error: 'Account deleted, but failed to clear session' });
            }
            res.clearCookie('connect.sid');
            return res.json({ success: true, message: 'Account and all associated reservations successfully deleted' });
        });

    } catch (error) {
        console.error('Error deleting account:', error);
        return res.status(500).json({ error: 'Internal server error deleting account' });
    }
};

// 7. Export all functions
module.exports = {
    search,
    getById,
    updateProfile,
    changePassword,
    deleteAccount
};