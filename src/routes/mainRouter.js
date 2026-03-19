/**
 * Main Router (Ivan)
 *
 * Single router file that defines all routes for the application.
 * Following the mc3-debttracker pattern, we use "just one" router
 * for the meantime. This can be broken into sub-files later.
 *
 * TODO (Ivan):
 * 1. Import express.Router()
 * 2. Import controllers:
 *    - authController   from '../controllers/authController'
 *    - labController    from '../controllers/labController'
 *    - reservationController from '../controllers/reservationController'
 *    - userController   from '../controllers/userController'
 *    - walkinController from '../controllers/walkinController'
 * 3. Import middleware:
 *    - { authMiddleware, techMiddleware } from '../middleware/auth'
 * 4. Import models (for page routes that need data):
 *    - Lab              from '../models/Lab'
 *    - Reservation      from '../models/Reservation'
 *
 * 5. Define PAGE routes (render Handlebars views):
 *    GET /                  → render('index', { layout: 'auth', title: 'OpenLab', activePage: 'index' })
 *    GET /login             → if session, redirect /dashboard; else render('login', { layout: 'auth', ... })
 *    GET /register          → if session, redirect /dashboard; else render('register', { layout: 'auth', ... })
 *    GET /adminsignup       → if session, redirect /dashboard; else render('adminsignup', { layout: 'auth', ... })
 *    GET /changepassword    → [authMiddleware] render('changepassword', { layout: 'auth', ... })
 *    GET /dashboard         → [authMiddleware] fetch stats, render('dashboard', { layout: 'dashboard', ... })
 *    GET /cmpslots          → [authMiddleware] fetch labs, render('cmpslots', { layout: 'dashboard', ... })
 *    GET /reserve           → [authMiddleware] fetch lab/seats, render('reserve', { layout: 'dashboard', ... })
 *    GET /reservations      → [authMiddleware] fetch reservations, render('reservations', { layout: 'dashboard', ... })
 *    GET /profile           → [authMiddleware] fetch user data, render('profile', { layout: 'dashboard', ... })
 *    GET /profile/:id       → [authMiddleware] fetch target user, render('public-profile', { layout: 'dashboard', ... })
 *    GET /users             → [authMiddleware] fetch users, render('users', { layout: 'dashboard', ... })
 *    GET /walkin            → [techMiddleware] fetch labs/walkins, render('walkin', { layout: 'dashboard', ... })
 *
 * 6. Define AUTH API routes:
 *    POST /api/login        → authController.login
 *    POST /api/register     → authController.register
 *    POST /api/logout       → authController.logout
 *
 * 7. Define RESERVATION API routes (all require authMiddleware):
 *    GET    /api/reservations          → reservationController.getAll
 *    GET    /api/reservations/:id      → reservationController.getById
 *    POST   /api/reservations          → reservationController.create
 *    PUT    /api/reservations/:id      → reservationController.update
 *    PUT    /api/reservations/:id/cancel → reservationController.cancel
 *    DELETE /api/reservations/:id      → reservationController.delete
 *
 * 8. Define LAB API routes:
 *    GET /api/labs                     → labController.getAll
 *    GET /api/labs/:code               → labController.getByCode
 *    GET /api/labs/:code/seats         → labController.getSeats
 *
 * 9. Define USER API routes (all require authMiddleware):
 *    GET    /api/users                 → userController.search
 *    GET    /api/users/:id             → userController.getById
 *    PUT    /api/profile               → userController.updateProfile
 *    PUT    /api/profile/password      → userController.changePassword
 *    DELETE /api/profile               → userController.deleteAccount
 *
 * 10. Define WALK-IN API routes (all require techMiddleware):
 *    GET    /api/walkin                → walkinController.getAll
 *    POST   /api/walkin                → walkinController.create
 *    PUT    /api/walkin/:id/remove     → walkinController.removeNoShow
 *
 * 11. Export router
 */

// TODO: Implement the above

// 1. Import express.Router()
const express = require('express');
const router = express.Router();

// 2. Import controllers
const authController = require('../controllers/authController');
const labController = require('../controllers/labController');
const reservationController = require('../controllers/reservationController');
const userController = require('../controllers/userController');
const walkinController = require('../controllers/walkinController');

// 3. Import middleware
const { authMiddleware, techMiddleware } = require('../middleware/auth');

// 4. Import models (for page routes that need initial data)
const Lab = require('../models/Lab');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

// ==========================================
// 5. PAGE ROUTES (Render Handlebars Views)
// ==========================================

// Public Pages
router.get('/', (req, res) => {
    res.render('index', { layout: 'auth', title: 'OpenLab', activePage: 'index' });
});

router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('login', { layout: 'auth', title: 'Login', activePage: 'login' });
});

router.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('register', { layout: 'auth', title: 'Register', activePage: 'register' });
});

router.get('/adminsignup', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('adminsignup', { layout: 'auth', title: 'Admin Signup', activePage: 'adminsignup' });
});

// Protected Pages (Require Authentication)
router.get('/changepassword', authMiddleware, (req, res) => {
    res.render('changepassword', { layout: 'auth', title: 'Change Password' });
});

router.get('/dashboard', authMiddleware, async (req, res) => {
    // Fetch some basic stats for the dashboard if needed
    const myReservationsCount = await Reservation.countDocuments({ user: req.session.user._id, status: 'upcoming' });
    res.render('dashboard', { 
        layout: 'dashboard', 
        title: 'Dashboard', 
        activePage: 'dashboard',
        stats: { upcoming: myReservationsCount }
    });
});

router.get('/cmpslots', authMiddleware, async (req, res) => {
    const labs = await Lab.find().lean();
    res.render('cmpslots', { layout: 'dashboard', title: 'Computer Slots', activePage: 'cmpslots', labs });
});

router.get('/reserve', authMiddleware, async (req, res) => {
    const labs = await Lab.find().lean();
    res.render('reserve', { layout: 'dashboard', title: 'Reserve a Slot', activePage: 'reserve', labs });
});

router.get('/reservations', authMiddleware, async (req, res) => {
    res.render('reservations', { layout: 'dashboard', title: 'My Reservations', activePage: 'reservations' });
});

router.get('/profile', authMiddleware, (req, res) => {
    res.render('profile', { layout: 'dashboard', title: 'My Profile', activePage: 'profile' });
});

router.get('/profile/:id', authMiddleware, async (req, res) => {
    const targetUser = await User.findById(req.params.id).select('-password').lean();
    res.render('public-profile', { 
        layout: 'dashboard', 
        title: targetUser ? `${targetUser.firstName}'s Profile` : 'User Not Found',
        targetUser 
    });
});

router.get('/users', authMiddleware, (req, res) => {
    res.render('users', { layout: 'dashboard', title: 'Find Users', activePage: 'users' });
});

// Technician Pages (Require Technician Account)
router.get('/walkin', techMiddleware, async (req, res) => {
    const labs = await Lab.find().lean();
    res.render('walkin', { layout: 'dashboard', title: 'Walk-In Management', activePage: 'walkin', labs });
});


// ==========================================
// 6. AUTH API ROUTES
// ==========================================
router.post('/api/login', authController.login);
router.post('/api/register', authController.register);
router.post('/api/logout', authController.logout);


// ==========================================
// 7. RESERVATION API ROUTES
// ==========================================
router.get('/api/reservations', authMiddleware, reservationController.getAll);
router.get('/api/reservations/:id', authMiddleware, reservationController.getById);
router.post('/api/reservations', authMiddleware, reservationController.create);
router.put('/api/reservations/:id', authMiddleware, reservationController.update);
router.put('/api/reservations/:id/cancel', authMiddleware, reservationController.cancel);
router.delete('/api/reservations/:id', authMiddleware, reservationController.delete);


// ==========================================
// 8. LAB API ROUTES
// ==========================================
router.get('/api/labs', labController.getAll);
router.get('/api/labs/:code', labController.getByCode);
router.get('/api/labs/:code/seats', labController.getSeats);


// ==========================================
// 9. USER API ROUTES
// ==========================================
router.get('/api/users', authMiddleware, userController.search);
router.get('/api/users/:id', authMiddleware, userController.getById);
router.put('/api/profile', authMiddleware, userController.updateProfile);
router.put('/api/profile/password', authMiddleware, userController.changePassword);
router.delete('/api/profile', authMiddleware, userController.deleteAccount);


// ==========================================
// 10. WALK-IN API ROUTES (Technicians Only)
// ==========================================
router.get('/api/walkin', techMiddleware, walkinController.getAll);
router.post('/api/walkin', techMiddleware, walkinController.create);
router.put('/api/walkin/:id/remove', techMiddleware, walkinController.removeNoShow);


// 11. Export router
module.exports = router;
