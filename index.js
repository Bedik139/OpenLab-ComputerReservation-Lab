/**
 * Express Server (Ivan)
 *
 * Main entry point of the application.
 * Following the mc3-debttracker structure:
 *   - index.js at the root
 *   - src/models/conn.js for DB connection
 *   - src/routes/mainRouter.js for all routes (single router)
 *   - src/views/ for Handlebars templates
 *   - public/ for static files
 *
 * TODO (Ivan):
 * 1. Import required modules:
 *    - express, express-handlebars, express-session, connect-mongo, path, dotenv
 * 2. Load .env: require('dotenv').config();  (or require('dotenv/config'))
 * 3. Import DB connection from './src/models/conn.js':
 *    - const { connect } = require('./src/models/conn.js');
 * 4. Import the main router from './src/routes/mainRouter.js':
 *    - const router = require('./src/routes/mainRouter.js');
 * 5. Import Handlebars helpers from './src/helpers/hbs-helpers'
 * 6. Create Express app: const app = express();
 * 7. Configure Handlebars engine:
 *    const hbs = create({
 *      extname: '.hbs',
 *      defaultLayout: 'dashboard',
 *      layoutsDir: path.join(__dirname, 'src/views/layouts'),
 *      partialsDir: path.join(__dirname, 'src/views/partials'),
 *      helpers: require('./src/helpers/hbs-helpers')
 *    });
 *    app.engine('.hbs', hbs.engine);
 *    app.set('view engine', '.hbs');
 *    app.set('views', path.join(__dirname, 'src/views'));
 * 8. Middleware:
 *    app.use(express.json());
 *    app.use(express.urlencoded({ extended: true }));
 *    app.use(express.static(path.join(__dirname, 'public')));
 * 9. Session configuration:
 *    app.use(session({
 *      secret: process.env.SESSION_SECRET,
 *      resave: false,
 *      saveUninitialized: false,
 *      store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
 *      cookie: { maxAge: 1000 * 60 * 60 * 24 }  // 24 hours
 *    }));
 * 10. Make session user available to all templates:
 *     app.use((req, res, next) => {
 *       res.locals.user = req.session.user || null;
 *       next();
 *     });
 * 11. Mount the single main router:
 *     app.use(router);
 * 12. 404 handler:
 *     app.use((req, res) => {
 *       res.status(404).render('error', { layout: 'dashboard', title: 'Not Found', errorCode: 404, errorMessage: 'Page not found' });
 *     });
 * 13. Start server and connect to DB:
 *     const PORT = process.env.PORT || 3000;
 *     app.listen(PORT, async () => {
 *       console.log(`Server running on http://localhost:${PORT}`);
 *       try {
 *         await connect();
 *         console.log('Now connected to MongoDB');
 *       } catch (err) {
 *         console.error('Connection to MongoDB failed:', err);
 *       }
 *     });
 */

// TODO: Implement the above

// 1. Import required modules
const express = require('express');
const { create } = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

// 2. Load .env
require('dotenv').config();

// 3. Import DB connection
const { connect } = require('./src/models/conn.js');

// 4. Import the main router
const router = require('./src/routes/mainRouter.js');

// 6. Create Express app
const app = express();

// 7. Configure Handlebars engine (incorporating step 5)
const hbs = create({
    extname: '.hbs',
    defaultLayout: 'dashboard',
    layoutsDir: path.join(__dirname, 'src/views/layouts'),
    partialsDir: path.join(__dirname, 'src/views/partials'),
    helpers: require('./src/helpers/hbs-helpers') // 5. Import Handlebars helpers
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'src/views'));

// 8. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 9. Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }  // 24 hours
}));

// 10. Make session user available to all templates + refresh "Remember Me" on each visit
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    // If session has a 3-week maxAge (Remember Me), refresh it on every visit
    if (req.session.user && req.session.cookie.maxAge > 1000 * 60 * 60 * 24) {
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 21; // extend to 3 weeks
    }
    next();
});

// 11. Mount the single main router
app.use(router);

// 12. 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        layout: 'dashboard', 
        title: 'Not Found', 
        errorCode: 404, 
        errorMessage: 'Page not found' 
    });
});

// 13. Start server and connect to DB
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
        await connect();
        console.log('Now connected to MongoDB');
    } catch (err) {
        console.error('Connection to MongoDB failed:', err);
    }
});
