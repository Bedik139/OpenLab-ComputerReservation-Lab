/**
 * Authentication Middleware (Ivan)
 *
 * TODO (Ivan):
 * 1. authMiddleware(req, res, next):
 *    - Check if req.session.user exists
 *    - If yes, call next()
 *    - If no, redirect to '/login' for page requests (req.accepts('html'))
 *      or return res.status(401).json({ error: 'Not authenticated' }) for API requests
 *
 * 2. techMiddleware(req, res, next):
 *    - First call authMiddleware logic (or chain it)
 *    - Then check if req.session.user.accountType === 'technician'
 *    - If yes, call next()
 *    - If no, redirect to '/dashboard' for page requests
 *      or return res.status(403).json({ error: 'Technicians only' }) for API requests
 *
 * 3. Export both: module.exports = { authMiddleware, techMiddleware };
 */

// TODO: Implement the above

const authMiddleware = (req, res, next) => {
    // 1. Check if the user is logged in (session exists)
    if (req.session && req.session.user) {
        return next(); // User is good to go, proceed to the controller
    }

    // 2. If not logged in, determine the type of request
    // If it's an API route (e.g., /api/reservations) or specifically asking for JSON
    if (req.originalUrl.startsWith('/api/') || req.accepts(['html', 'json']) === 'json') {
        return res.status(401).json({ error: 'Not authenticated. Please log in.' });
    }

    // Otherwise, it's a standard browser request, so redirect them to the login page
    return res.redirect('/login');
};


const techMiddleware = (req, res, next) => {
    // 1. First, verify they are actually logged in
    if (!req.session || !req.session.user) {
        if (req.originalUrl.startsWith('/api/') || req.accepts(['html', 'json']) === 'json') {
            return res.status(401).json({ error: 'Not authenticated. Please log in.' });
        }
        return res.redirect('/login');
    }

    // 2. Check if the logged-in user is a technician
    if (req.session.user.accountType === 'technician') {
        return next(); // They are a technician, let them through
    }

    // 3. If they are a normal student, block them
    if (req.originalUrl.startsWith('/api/') || req.accepts(['html', 'json']) === 'json') {
        return res.status(403).json({ error: 'Forbidden: Technicians only.' });
    }

    // Redirect standard browser requests back to the normal dashboard
    return res.redirect('/dashboard');
};

// Export both middlewares so they can be used in the router
module.exports = { authMiddleware, techMiddleware };