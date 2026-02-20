/**
 * OpenLab Computer Reservation System
 * @file app.js
 * @description Main application logic — all data is centralized here and
 *              rendered via jQuery DOM manipulation. No hardcoded HTML data.
 */

// =============================================================================
// CONSTANTS & DATA STORE
// =============================================================================

var USER_KEY = 'openlab_user';
var RESERVATIONS_KEY = 'openlab_reservations';
var ACCOUNTS_KEY = 'openlab_accounts';
var ALL_RESERVATIONS_KEY = 'openlab_all_reservations';

/** Shared time slot options (30-min intervals, 7:30 AM – 5:30 PM) */
var TIME_SLOTS = [
    { value: "07:30", label: "07:30 AM - 08:00 AM" },
    { value: "08:00", label: "08:00 AM - 08:30 AM" },
    { value: "08:30", label: "08:30 AM - 09:00 AM" },
    { value: "09:00", label: "09:00 AM - 09:30 AM" },
    { value: "09:30", label: "09:30 AM - 10:00 AM" },
    { value: "10:00", label: "10:00 AM - 10:30 AM" },
    { value: "10:30", label: "10:30 AM - 11:00 AM" },
    { value: "11:00", label: "11:00 AM - 11:30 AM" },
    { value: "11:30", label: "11:30 AM - 12:00 PM" },
    { value: "12:00", label: "12:00 PM - 12:30 PM" },
    { value: "12:30", label: "12:30 PM - 01:00 PM" },
    { value: "13:00", label: "01:00 PM - 01:30 PM" },
    { value: "13:30", label: "01:30 PM - 02:00 PM" },
    { value: "14:00", label: "02:00 PM - 02:30 PM" },
    { value: "14:30", label: "02:30 PM - 03:00 PM" },
    { value: "15:00", label: "03:00 PM - 03:30 PM" },
    { value: "15:30", label: "03:30 PM - 04:00 PM" },
    { value: "16:00", label: "04:00 PM - 04:30 PM" },
    { value: "16:30", label: "04:30 PM - 05:00 PM" },
    { value: "17:00", label: "05:00 PM - 05:30 PM" }
];

/** College options for registration and profile */
var COLLEGES = [
    { value: "CCS",    label: "College of Computer Studies" },
    { value: "CLA",    label: "College of Liberal Arts" },
    { value: "COB",    label: "College of Business" },
    { value: "COE",    label: "College of Engineering" },
    { value: "COS",    label: "College of Science" },
    { value: "GCOE",   label: "Gokongwei College of Engineering" },
    { value: "SOE",    label: "School of Economics" },
    { value: "BAGCED", label: "Br. Andrew Gonzalez College of Education" }
];

/** Computer labs with building info, hours, and total seats */
var LABS = [
    {
        code: "AG1010",
        building: "Andrew Building",
        buildingKey: "andrew",
        totalSeats: 30,
        rows: ["A", "B", "C"],
        cols: 10,
        hours: "7:30 AM - 6:00 PM",
        occupied: ["A3", "A7", "B1", "B4", "B8", "C2", "C5", "C6", "C10", "A9", "B6", "C8"],
        reserved: ["A5", "B10"]
    },
    {
        code: "LS313",
        building: "La Salle Hall",
        buildingKey: "lasalle",
        totalSeats: 25,
        rows: ["A", "B", "C", "D", "E"],
        cols: 5,
        hours: "8:00 AM - 7:00 PM",
        occupied: ["A2", "A4", "B1", "B3", "B5", "C2", "C4", "D1", "D3", "D5", "E2", "E4", "A1", "C1", "D2", "E3", "E5"],
        reserved: ["B2"]
    },
    {
        code: "GK101A",
        building: "Gokongwei Building",
        buildingKey: "gokongwei",
        totalSeats: 40,
        rows: ["A", "B", "C", "D"],
        cols: 10,
        hours: "7:00 AM - 9:00 PM",
        occupied: ["A3", "A9", "B1", "B4", "B8", "C2", "C5", "C6", "C10", "D3", "D7", "D8"],
        reserved: ["A7", "B10"]
    },
    {
        code: "GK101B",
        building: "Gokongwei Building",
        buildingKey: "gokongwei",
        totalSeats: 40,
        rows: ["A", "B", "C", "D"],
        cols: 10,
        hours: "7:00 AM - 9:00 PM",
        occupied: ["A1", "A5", "A8", "B2", "B6", "B9", "C1", "C4", "C7", "C10", "D2", "D5", "D8", "A3", "B3", "C3", "D3", "A10", "B7", "C8", "D6", "D9", "D10", "A6", "B5"],
        reserved: ["A2", "C9"]
    },
    {
        code: "GK304",
        building: "Gokongwei Building",
        buildingKey: "gokongwei",
        totalSeats: 20,
        rows: ["A", "B", "C", "D"],
        cols: 5,
        hours: "8:00 AM - 6:00 PM",
        occupied: ["A2", "A4", "B1", "B3", "B5", "C2", "C4", "D1", "D3", "D5"],
        reserved: ["A5"]
    }
];

/** Seat occupant data — who occupies/reserved each seat (for tooltips) */
var SEAT_OCCUPANTS = {
    "GK101A": {
        "A3": { name: "Maria Clara Santos", id: "12340001", anonymous: false },
        "A7": { name: "Anonymous", id: null, anonymous: true },
        "A9": { name: "Jose Rizal Jr.", id: "12340002", anonymous: false },
        "B1": { name: "Ana Garcia Lopez", id: "12340003", anonymous: false },
        "B4": { name: "Karl Reyes Mendoza", id: "12340004", anonymous: false },
        "B8": { name: "Lea Domingo Cruz", id: "12340005", anonymous: false },
        "B10": { name: "Anonymous", id: null, anonymous: true },
        "C2": { name: "Maria Clara Santos", id: "12340001", anonymous: false },
        "C5": { name: "Jose Rizal Jr.", id: "12340002", anonymous: false },
        "C6": { name: "Ana Garcia Lopez", id: "12340003", anonymous: false },
        "C10": { name: "Karl Reyes Mendoza", id: "12340004", anonymous: false },
        "D3": { name: "Lea Domingo Cruz", id: "12340005", anonymous: false },
        "D7": { name: "Maria Clara Santos", id: "12340001", anonymous: false },
        "D8": { name: "Jose Rizal Jr.", id: "12340002", anonymous: false }
    }
};

/** Sample users for the Find Users page and public profiles */
var SAMPLE_USERS = [
    {
        id: "12340001",
        firstName: "Maria Clara",
        lastName: "Santos",
        email: "maria_santos@dlsu.edu.ph",
        college: "CCS",
        accountType: "student",
        password: "password123",
        avatarClass: "",
        bio: "CCS sophomore | Usually found at GK101A grinding CCAPDEV projects",
        totalSessions: 32,
        completed: 28,
        cancelled: 2,
        hoursUsed: 16,
        memberSince: "August 2024",
        reservations: [
            { lab: "GK101A", seat: "C7", date: "Feb 11, 2025", time: "10:00 AM - 10:30 AM" },
            { lab: "LS313",  seat: "A3", date: "Feb 13, 2025", time: "02:00 PM - 02:30 PM" },
            { lab: "AG1010", seat: "B2", date: "Feb 14, 2025", time: "09:00 AM - 09:30 AM" }
        ]
    },
    {
        id: "12340002",
        firstName: "Jose Rizal",
        lastName: "Jr.",
        email: "jose_rizal@dlsu.edu.ph",
        college: "CLA",
        accountType: "student",
        password: "password123",
        avatarClass: "orange",
        bio: "CLA student | History enthusiast and lab regular",
        totalSessions: 28,
        completed: 25,
        cancelled: 1,
        hoursUsed: 14,
        memberSince: "September 2024",
        reservations: [
            { lab: "LS313",  seat: "B4", date: "Feb 12, 2025", time: "09:00 AM - 09:30 AM" },
            { lab: "AG1010", seat: "A1", date: "Feb 15, 2025", time: "01:00 PM - 01:30 PM" }
        ]
    },
    {
        id: "12340003",
        firstName: "Ana Garcia",
        lastName: "Lopez",
        email: "ana_lopez@dlsu.edu.ph",
        college: "GCOE",
        accountType: "student",
        password: "password123",
        avatarClass: "purple",
        bio: "Engineering student | Prefers the quiet hours at GK304",
        totalSessions: 45,
        completed: 40,
        cancelled: 3,
        hoursUsed: 22.5,
        memberSince: "June 2024",
        reservations: [
            { lab: "GK304",  seat: "D2", date: "Feb 10, 2025", time: "08:00 AM - 08:30 AM" },
            { lab: "GK101B", seat: "C5", date: "Feb 11, 2025", time: "03:00 PM - 03:30 PM" },
            { lab: "GK304",  seat: "D2", date: "Feb 13, 2025", time: "08:00 AM - 08:30 AM" }
        ]
    },
    {
        id: "12340004",
        firstName: "Karl Reyes",
        lastName: "Mendoza",
        email: "karl_mendoza@dlsu.edu.ph",
        college: "COB",
        accountType: "student",
        password: "password123",
        avatarClass: "teal",
        bio: "Business student | Uses labs for group projects and presentations",
        totalSessions: 19,
        completed: 17,
        cancelled: 1,
        hoursUsed: 9.5,
        memberSince: "October 2024",
        reservations: [
            { lab: "AG1010", seat: "A5", date: "Feb 14, 2025", time: "11:00 AM - 11:30 AM" }
        ]
    },
    {
        id: "12340005",
        firstName: "Lea Domingo",
        lastName: "Cruz",
        email: "lea_cruz@dlsu.edu.ph",
        college: "COS",
        accountType: "student",
        password: "password123",
        avatarClass: "red",
        bio: "Science major | Data analysis and research computing",
        totalSessions: 37,
        completed: 34,
        cancelled: 2,
        hoursUsed: 18.5,
        memberSince: "July 2024",
        reservations: [
            { lab: "GK101A", seat: "B8", date: "Feb 10, 2025", time: "02:00 PM - 02:30 PM" },
            { lab: "GK101A", seat: "B8", date: "Feb 12, 2025", time: "02:00 PM - 02:30 PM" }
        ]
    },
    {
        id: "99999999",
        firstName: "Admin",
        lastName: "Technician",
        email: "tech_admin@dlsu.edu.ph",
        college: "CCS",
        accountType: "technician",
        password: "admin123",
        avatarClass: "blue",
        bio: "Lab technician | Managing computer lab reservations and walk-in students",
        totalSessions: 0,
        completed: 0,
        cancelled: 0,
        hoursUsed: 0,
        memberSince: "January 2025",
        reservations: []
    }
];

/** Default reservations for the logged-in user (seeded into localStorage) */
var DEFAULT_RESERVATIONS = [
    {
        id: 1,
        lab: "GK101A",
        seat: "B5",
        building: "Gokongwei Building",
        date: "2025-02-10",
        displayDate: "Feb 10, 2025",
        timeSlot: "09:00 AM - 09:30 AM",
        status: "upcoming",
        bookedOn: "Feb 8, 2025",
        anonymous: false
    },
    {
        id: 2,
        lab: "LS313",
        seat: "A8",
        building: "La Salle Hall",
        date: "2025-02-12",
        displayDate: "Feb 12, 2025",
        timeSlot: "02:00 PM - 02:30 PM",
        status: "upcoming",
        bookedOn: "Feb 9, 2025",
        anonymous: false
    },
    {
        id: 3,
        lab: "AG1010",
        seat: "C3",
        building: "Andrew Building",
        date: "2025-02-08",
        displayDate: "Feb 8, 2025",
        timeSlot: "11:00 AM - 11:30 AM",
        status: "completed",
        bookedOn: "Feb 6, 2025",
        anonymous: false
    },
    {
        id: 4,
        lab: "GK101A",
        seat: "D7",
        building: "Gokongwei Building",
        date: "2025-02-07",
        displayDate: "Feb 7, 2025",
        timeSlot: "03:00 PM - 03:30 PM",
        status: "completed",
        bookedOn: "Feb 5, 2025",
        anonymous: false
    },
    {
        id: 5,
        lab: "GK304",
        seat: "A2",
        building: "Gokongwei Building",
        date: "2025-02-06",
        displayDate: "Feb 6, 2025",
        timeSlot: "10:00 AM - 10:30 AM",
        status: "cancelled",
        bookedOn: "Feb 4, 2025",
        anonymous: false
    },
    {
        id: 6,
        lab: "GK101B",
        seat: "B3",
        building: "Gokongwei Building",
        date: "2025-02-05",
        displayDate: "Feb 5, 2025",
        timeSlot: "01:00 PM - 01:30 PM",
        status: "completed",
        bookedOn: "Feb 3, 2025",
        anonymous: true
    },
    {
        id: 7,
        lab: "LS313",
        seat: "D1",
        building: "La Salle Hall",
        date: "2025-02-04",
        displayDate: "Feb 4, 2025",
        timeSlot: "09:30 AM - 10:00 AM",
        status: "completed",
        bookedOn: "Feb 2, 2025",
        anonymous: false
    }
];

/** Recent activity items for the dashboard */
var ACTIVITIES = [
    { type: "completed", text: 'Completed session at <strong>AG1010</strong>',     time: "Today, 11:30 AM" },
    { type: "booked",    text: 'Booked seat at <strong>GK101A</strong>',            time: "Yesterday, 3:45 PM" },
    { type: "completed", text: 'Completed session at <strong>LS313</strong>',       time: "Feb 7, 2025" },
    { type: "cancelled", text: 'Cancelled reservation at <strong>GK304</strong>',   time: "Feb 6, 2025" },
    { type: "booked",    text: 'Booked seat at <strong>LS313</strong>',             time: "Feb 5, 2025" }
];

/** Favorite / frequently used labs for the dashboard */
var FAVORITE_LABS = [
    { code: "GK101A", building: "Gokongwei Building", visits: 8 },
    { code: "LS313",  building: "La Salle Hall",      visits: 5 },
    { code: "AG1010", building: "Andrew Building",     visits: 2 }
];

/** Walk-in reservations (sample data for the technician page) */
var WALKIN_RESERVATIONS = [
    { id: 1, lab: "GK101A", seat: "B5", time: "09:00 AM", studentName: "Tyrion Dela Cruz", studentId: "12345678", canRemove: true },
    { id: 2, lab: "GK101A", seat: "A8", time: "09:00 AM", studentName: "Jerwin Santos",    studentId: "12340001", canRemove: false },
    { id: 3, lab: "LS313",  seat: "C3", time: "09:30 AM", studentName: "Jose Reyes",       studentId: "12340002", canRemove: false }
];

/** Features for the landing page */
var FEATURES = [
    { title: "Real-Time Availability", desc: "See which seats are open now across all labs" },
    { title: "Easy Reservations",      desc: "Book 30-min slots up to 7 days ahead" },
    { title: "Multiple Buildings",     desc: "Gokongwei, Andrew, and La Salle labs" }
];


// =============================================================================
// UTILITY HELPERS
// =============================================================================

function isLoggedIn() {
    return localStorage.getItem(USER_KEY) !== null;
}

function getCurrentUser() {
    var userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

function logout() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(RESERVATIONS_KEY);
    var path = window.location.pathname;
    window.location.href = (path.indexOf("/pages/") > -1) ? "../index.html" : "index.html";
}

function authGuard() {
    var path = window.location.pathname;
    var loggedIn = isLoggedIn();
    var user = getCurrentUser();
    var isProtected = (path.indexOf("dashboard.html") > -1) ||
        (path.indexOf("reservations.html") > -1) ||
        (path.indexOf("reserve.html") > -1) ||
        (path.indexOf("profile.html") > -1);
    var isTechnicianOnly = (path.indexOf("walkin.html") > -1);
    var isAuthPage = (path.indexOf("login.html") > -1) ||
        (path.indexOf("register.html") > -1);

    if ((isProtected || isTechnicianOnly) && !loggedIn) {
        window.location.href = (path.indexOf("/pages/") > -1) ? "login.html" : "pages/login.html";
    } else if (isTechnicianOnly && loggedIn && (!user || user.accountType !== 'technician')) {
        alert("Access denied. Technicians only.");
        window.location.href = (path.indexOf("/pages/") > -1) ? "dashboard.html" : "pages/dashboard.html";
    } else if (isAuthPage && loggedIn) {
        window.location.href = (path.indexOf("/pages/") > -1) ? "dashboard.html" : "pages/dashboard.html";
    }
}

/** Get / initialize reservations from localStorage */
function getReservations() {
    var stored = localStorage.getItem(RESERVATIONS_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(DEFAULT_RESERVATIONS));
    return DEFAULT_RESERVATIONS;
}

function saveReservations(list) {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(list));
}

/** Resolve href based on whether current page is in /pages/ or root */
function resolvePath(file) {
    var inPages = window.location.pathname.indexOf("/pages/") > -1;
    if (file.indexOf("index.html") > -1) {
        return inPages ? "../index.html" : "index.html";
    }
    return inPages ? file : "pages/" + file;
}

/** Get initials from a name */
function getInitials(firstName, lastName) {
    return (firstName ? firstName.charAt(0) : "") + (lastName ? lastName.charAt(0) : "");
}

/** Find a lab object by code */
function getLabByCode(code) {
    for (var i = 0; i < LABS.length; i++) {
        if (LABS[i].code === code) return LABS[i];
    }
    return null;
}

/** Find a sample user by ID */
function getUserById(id) {
    for (var i = 0; i < SAMPLE_USERS.length; i++) {
        if (SAMPLE_USERS[i].id === id) return SAMPLE_USERS[i];
    }
    return null;
}

/** Build time slot <option> elements */
function buildTimeSlotOptions(selectedValue) {
    var html = '';
    for (var i = 0; i < TIME_SLOTS.length; i++) {
        var ts = TIME_SLOTS[i];
        var sel = (ts.value === selectedValue) ? ' selected' : '';
        html += '<option value="' + ts.value + '"' + sel + '>' + ts.label + '</option>';
    }
    return html;
}

/** Build college <option> elements */
function buildCollegeOptions(selectedValue, includePlaceholder) {
    var html = '';
    if (includePlaceholder) {
        html += '<option value="" disabled selected>Select your college</option>';
    }
    for (var i = 0; i < COLLEGES.length; i++) {
        var c = COLLEGES[i];
        var sel = (c.value === selectedValue) ? ' selected' : '';
        html += '<option value="' + c.value + '"' + sel + '>' + c.label + '</option>';
    }
    return html;
}

/** Format date string like "2025-02-10" to "February 10, 2025" */
function formatDateLong(dateStr) {
    var months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
    var parts = dateStr.split("-");
    var m = parseInt(parts[1], 10) - 1;
    var d = parseInt(parts[2], 10);
    return months[m] + " " + d + ", " + parts[0];
}

/** Parse date "2025-02-10" into {day, month, year} */
function parseDateParts(dateStr) {
    var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    var parts = dateStr.split("-");
    return {
        day: parts[2],
        month: months[parseInt(parts[1], 10) - 1],
        year: parts[0]
    };
}


// =============================================================================
// ACCOUNT MANAGEMENT
// =============================================================================

/** Seed accounts from SAMPLE_USERS on first run */
function initializeAccounts() {
    var stored = localStorage.getItem(ACCOUNTS_KEY);
    if (!stored) {
        var accounts = [];
        for (var i = 0; i < SAMPLE_USERS.length; i++) {
            var u = SAMPLE_USERS[i];
            accounts.push({
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                studentId: u.id,
                college: u.college,
                accountType: u.accountType || 'student',
                password: u.password || 'password123',
                bio: u.bio || ''
            });
        }
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
}

function getAccounts() {
    var stored = localStorage.getItem(ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function findAccountByEmail(email) {
    var accounts = getAccounts();
    for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].email.toLowerCase() === email.toLowerCase()) {
            return accounts[i];
        }
    }
    return null;
}

function authenticateUser(email, password) {
    var account = findAccountByEmail(email);
    if (!account) return null;
    if (account.password !== password) return null;
    return account;
}

function registerAccount(data) {
    var accounts = getAccounts();
    if (findAccountByEmail(data.email)) {
        return { success: false, error: 'Email already registered.' };
    }
    for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].studentId === data.studentId) {
            return { success: false, error: 'Student ID already registered.' };
        }
    }
    var newAccount = {
        id: data.studentId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        studentId: data.studentId,
        college: data.college,
        accountType: data.accountType,
        password: data.password,
        bio: ''
    };
    accounts.push(newAccount);
    saveAccounts(accounts);
    return { success: true, account: newAccount };
}

function updateAccountPassword(email, newPassword) {
    var accounts = getAccounts();
    for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].email.toLowerCase() === email.toLowerCase()) {
            accounts[i].password = newPassword;
            saveAccounts(accounts);
            return true;
        }
    }
    return false;
}


// =============================================================================
// GLOBAL RESERVATION STORE (all users' reservations)
// =============================================================================

function getAllReservations() {
    var stored = localStorage.getItem(ALL_RESERVATIONS_KEY);
    if (!stored) {
        localStorage.setItem(ALL_RESERVATIONS_KEY, JSON.stringify([]));
        return [];
    }
    return JSON.parse(stored);
}

function saveAllReservations(list) {
    localStorage.setItem(ALL_RESERVATIONS_KEY, JSON.stringify(list));
}

/** Seed default reservations into global store for a user on first login */
function seedUserReservations(userEmail) {
    var allRes = getAllReservations();
    var hasAny = false;
    for (var i = 0; i < allRes.length; i++) {
        if (allRes[i].userEmail === userEmail) { hasAny = true; break; }
    }
    if (!hasAny) {
        var seeded = [];
        for (var j = 0; j < DEFAULT_RESERVATIONS.length; j++) {
            var r = DEFAULT_RESERVATIONS[j];
            seeded.push({
                id: r.id,
                lab: r.lab,
                seat: r.seat,
                building: r.building,
                date: r.date,
                displayDate: r.displayDate,
                timeSlot: r.timeSlot,
                status: r.status,
                bookedOn: r.bookedOn,
                anonymous: r.anonymous,
                userEmail: userEmail,
                isWalkIn: false
            });
        }
        allRes = allRes.concat(seeded);
        saveAllReservations(allRes);
        saveReservations(seeded);
    } else {
        var userRes = [];
        for (var k = 0; k < allRes.length; k++) {
            if (allRes[k].userEmail === userEmail) userRes.push(allRes[k]);
        }
        saveReservations(userRes);
    }
}


// =============================================================================
// NAVBAR BUILDER
// =============================================================================

function buildNavbar(activePage) {
    var inPages = window.location.pathname.indexOf("/pages/") > -1;
    var user = getCurrentUser();

    var navLinks = [
        { href: inPages ? "../index.html" : "index.html",    label: "Home",             page: "index" },
        { href: inPages ? "cmpslots.html" : "pages/cmpslots.html", label: "Available Slots", page: "cmpslots" },
        { href: inPages ? "dashboard.html" : "pages/dashboard.html", label: "Dashboard",    page: "dashboard" },
        { href: inPages ? "reservations.html" : "pages/reservations.html", label: "My Reservations", page: "reservations" }
    ];

    if (user) {
        if (user.accountType === 'technician') {
            navLinks.push({ href: inPages ? "walkin.html" : "pages/walkin.html", label: "Walk-In", page: "walkin" });
        }
        navLinks.push({ href: inPages ? "profile.html" : "pages/profile.html", label: "Profile", page: "profile" });
        navLinks.push({ href: inPages ? "users.html" : "pages/users.html", label: "Find Users", page: "users" });
    } else {
        navLinks.push({ href: inPages ? "login.html" : "pages/login.html", label: "Login", page: "login" });
    }

    var $nav = $('<nav class="topnav"></nav>');
    var $container = $('<div class="nav-container"></div>');
    $container.append('<a href="' + (inPages ? "../index.html" : "index.html") + '" class="logo">OpenLab</a>');

    var $links = $('<div class="nav-links"></div>');
    for (var i = 0; i < navLinks.length; i++) {
        var link = navLinks[i];
        var activeClass = (link.page === activePage) ? ' class="active"' : '';
        $links.append('<a href="' + link.href + '"' + activeClass + '>' + link.label + '</a>');
    }
    $links.append('<div class="search-bar"><input type="text" placeholder="Search..."></div>');

    $container.append($links);
    $nav.append($container);

    $('.site-wrapper').prepend($nav);
}


// =============================================================================
// INDEX PAGE (index.html)
// =============================================================================

function buildIndexPage() {
    // Banner content
    var $banner = $('.banner-content');
    $banner.append(
        '<h1>Find Your Seat,<br>Skip the Search</h1>' +
        '<p>Check real-time computer lab availability across DLSU.<br>' +
        'Reserve your slot in seconds — no more wandering.</p>' +
        '<div class="banner-buttons">' +
            '<a href="' + resolvePath("cmpslots.html") + '" class="btn btn-primary">View Labs</a>' +
            '<a href="' + resolvePath("register.html") + '" class="btn btn-outline">Register Now</a>' +
        '</div>'
    );

    // Features grid
    var $grid = $('.features-grid');
    for (var i = 0; i < FEATURES.length; i++) {
        $grid.append(
            '<article class="feature-card">' +
                '<h3>' + FEATURES[i].title + '</h3>' +
                '<p>' + FEATURES[i].desc + '</p>' +
            '</article>'
        );
    }
}


// =============================================================================
// DASHBOARD PAGE (pages/dashboard.html)
// =============================================================================

function buildDashboard() {
    var user = getCurrentUser();
    if (!user) return;

    var isTechnician = user.accountType === 'technician';
    var reservations = isTechnician ? getAllReservations() : getReservations();
    var upcoming = reservations.filter(function(r) { return r.status === "upcoming"; });
    var completed = reservations.filter(function(r) { return r.status === "completed"; });

    // Calculate stats
    var totalHours = (completed.length * 0.5);
    var streak = Math.min(completed.length, 5);

    var $container = $('.dashboard-container');

    // Welcome Header
    var welcomeTitle = isTechnician
        ? '<h1>Technician Dashboard</h1>'
        : '<h1>Welcome back, ' + user.firstName + '!</h1>';
    var welcomeDesc = isTechnician
        ? '<p>Manage lab reservations and walk-in students</p>'
        : '<p>Here\'s an overview of your lab reservations</p>';

    $container.append(
        '<div class="welcome-header">' +
            '<div class="welcome-text">' + welcomeTitle + welcomeDesc + '</div>' +
            '<a href="cmpslots.html" class="new-reservation-btn">+ New Reservation</a>' +
            '<a href="../index.html" class="signout-btn" id="signoutBtn">Sign-out</a>' +
        '</div>'
    );

    // Stats Grid
    var upLabel = isTechnician ? 'All Upcoming' : 'Upcoming Reservations';
    $container.append(
        '<div class="stats-grid">' +
            '<div class="stat-card"><div class="stat-icon upcoming"></div>' +
                '<div class="stat-content"><span class="stat-number">' + upcoming.length + '</span>' +
                '<span class="stat-label">' + upLabel + '</span></div></div>' +
            '<div class="stat-card"><div class="stat-icon completed"></div>' +
                '<div class="stat-content"><span class="stat-number">' + completed.length + '</span>' +
                '<span class="stat-label">Completed Sessions</span></div></div>' +
            '<div class="stat-card"><div class="stat-icon hours"></div>' +
                '<div class="stat-content"><span class="stat-number">' + totalHours.toFixed(1) + '</span>' +
                '<span class="stat-label">Hours This Month</span></div></div>' +
            '<div class="stat-card"><div class="stat-icon streak"></div>' +
                '<div class="stat-content"><span class="stat-number">' + streak + '</span>' +
                '<span class="stat-label">Day Streak</span></div></div>' +
        '</div>'
    );

    // Dashboard Grid
    var $grid = $('<div class="dashboard-grid"></div>');

    // Upcoming Reservations Card
    var cardTitle = isTechnician ? 'All Upcoming Reservations' : 'Upcoming Reservations';
    var upcomingHtml = '<div class="dashboard-card upcoming-reservations">' +
        '<div class="card-header"><h3>' + cardTitle + '</h3>' +
        '<a href="reservations.html" class="view-all">View All</a></div>' +
        '<div class="card-content">';

    if (upcoming.length === 0) {
        upcomingHtml += '<div class="empty-state"><p>No upcoming reservations</p>' +
            '<a href="cmpslots.html">Book a slot now</a></div>';
    } else {
        var showMax = isTechnician ? Math.min(upcoming.length, 5) : upcoming.length;
        for (var i = 0; i < showMax; i++) {
            var r = upcoming[i];
            var dp = parseDateParts(r.date);
            var userLabel = (isTechnician && r.userEmail) ? '<p style="font-size:0.85em;color:#999;">' + r.userEmail + '</p>' : '';
            upcomingHtml +=
                '<div class="reservation-item">' +
                    '<div class="reservation-date"><span class="day">' + dp.day + '</span>' +
                    '<span class="month">' + dp.month + '</span></div>' +
                    '<div class="reservation-details">' +
                        '<h4>' + r.lab + ' - Seat ' + r.seat + '</h4>' +
                        '<p>' + r.building + '</p>' + userLabel +
                        '<span class="time">' + r.timeSlot + '</span>' +
                    '</div>' +
                    '<div class="reservation-status upcoming"><span>Upcoming</span></div>' +
                '</div>';
        }
    }
    upcomingHtml += '</div></div>';
    $grid.append(upcomingHtml);

    // Quick Actions Card
    var walkinAction = isTechnician
        ? '<a href="walkin.html" class="action-item"><div class="action-icon manage"></div><span>Walk-In</span></a>'
        : '';
    $grid.append(
        '<div class="dashboard-card quick-actions">' +
            '<div class="card-header"><h3>Quick Actions</h3></div>' +
            '<div class="card-content"><div class="action-grid">' +
                '<a href="cmpslots.html" class="action-item"><div class="action-icon reserve"></div><span>Reserve a Seat</span></a>' +
                '<a href="reservations.html" class="action-item"><div class="action-icon manage"></div><span>Manage Bookings</span></a>' +
                walkinAction +
                '<a href="profile.html" class="action-item"><div class="action-icon profile"></div><span>Edit Profile</span></a>' +
                '<a href="users.html" class="action-item"><div class="action-icon search"></div><span>Find Users</span></a>' +
            '</div></div>' +
        '</div>'
    );

    // Recent Activity Card
    var actHtml = '<div class="dashboard-card recent-activity">' +
        '<div class="card-header"><h3>Recent Activity</h3></div>' +
        '<div class="card-content"><div class="activity-list">';
    for (var j = 0; j < ACTIVITIES.length; j++) {
        var a = ACTIVITIES[j];
        actHtml +=
            '<div class="activity-item">' +
                '<div class="activity-indicator ' + a.type + '"></div>' +
                '<div class="activity-details">' +
                    '<p>' + a.text + '</p>' +
                    '<span class="activity-time">' + a.time + '</span>' +
                '</div>' +
            '</div>';
    }
    actHtml += '</div></div></div>';
    $grid.append(actHtml);

    // Favorite Labs Card
    var favHtml = '<div class="dashboard-card favorite-labs">' +
        '<div class="card-header"><h3>Frequently Used Labs</h3></div>' +
        '<div class="card-content"><div class="lab-list">';
    for (var k = 0; k < FAVORITE_LABS.length; k++) {
        var fl = FAVORITE_LABS[k];
        favHtml +=
            '<a href="reserve.html?lab=' + fl.code + '" class="lab-item">' +
                '<div class="lab-info"><h4>' + fl.code + '</h4><p>' + fl.building + '</p></div>' +
                '<div class="lab-usage"><span class="usage-count">' + fl.visits + ' visits</span></div>' +
            '</a>';
    }
    favHtml += '</div></div></div>';
    $grid.append(favHtml);

    $container.append($grid);

    // Sign-out handler
    $('#signoutBtn').on('click', function(e) {
        e.preventDefault();
        logout();
    });
}


// =============================================================================
// AVAILABLE SLOTS PAGE (pages/cmpslots.html)
// =============================================================================

function buildCmpSlots() {
    var $container = $('.slots-container');

    // Page Header
    $container.append(
        '<div class="page-header">' +
            '<h1>Computer Lab Availability</h1>' +
            '<p>Select a lab to view available slots and make a reservation</p>' +
        '</div>'
    );

    // Filter Section
    var filterHtml =
        '<div class="filter-section"><div class="filter-card"><div class="filter-row">' +
            '<div class="filter-group"><label for="dateFilter">Date</label>' +
            '<input type="date" id="dateFilter" name="dateFilter"></div>' +
            '<div class="filter-group"><label for="timeFilter">Time Slot</label>' +
            '<select id="timeFilter" name="timeFilter"><option value="">All Time Slots</option>' +
            buildTimeSlotOptions("") + '</select></div>' +
            '<div class="filter-group"><label for="buildingFilter">Building</label>' +
            '<select id="buildingFilter" name="buildingFilter">' +
                '<option value="">All Buildings</option>' +
                '<option value="andrew">Andrew Building</option>' +
                '<option value="lasalle">La Salle Hall</option>' +
                '<option value="gokongwei">Gokongwei Building</option>' +
            '</select></div>' +
            '<button class="filter-btn">Apply Filters</button>' +
        '</div></div></div>';
    $container.append(filterHtml);

    // Lab Cards Grid
    var $grid = $('<div class="labs-grid"></div>');
    for (var i = 0; i < LABS.length; i++) {
        var lab = LABS[i];
        var available = lab.totalSeats - lab.occupied.length - lab.reserved.length;
        var occupied = lab.occupied.length + lab.reserved.length;

        $grid.append(
            '<article class="lab-card" data-lab="' + lab.code + '">' +
                '<div class="lab-header"><h3>' + lab.code + '</h3>' +
                '<span class="building-tag">' + lab.building + '</span></div>' +
                '<div class="lab-stats">' +
                    '<div class="stat"><span class="stat-number available">' + available + '</span>' +
                    '<span class="stat-label">Available</span></div>' +
                    '<div class="stat"><span class="stat-number occupied">' + occupied + '</span>' +
                    '<span class="stat-label">Occupied</span></div>' +
                    '<div class="stat"><span class="stat-number total">' + lab.totalSeats + '</span>' +
                    '<span class="stat-label">Total</span></div>' +
                '</div>' +
                '<div class="lab-info"><p><strong>Hours:</strong> ' + lab.hours + '</p></div>' +
                '<a href="reserve.html?lab=' + lab.code + '" class="reserve-btn">View Seats & Reserve</a>' +
            '</article>'
        );
    }
    $container.append($grid);

    // Legend
    $container.append(
        '<div class="legend-section"><div class="legend-card">' +
            '<h4>Legend</h4><div class="legend-items">' +
            '<div class="legend-item"><span class="legend-color available"></span><span>Available - Open for reservation</span></div>' +
            '<div class="legend-item"><span class="legend-color occupied"></span><span>Occupied - Currently in use</span></div>' +
            '<div class="legend-item"><span class="legend-color reserved"></span><span>Reserved - Booked for later</span></div>' +
        '</div></div></div>'
    );

    // Filter logic
    initLabFilters();
}

function initLabFilters() {
    var buildingMap = {
        andrew: "andrew building",
        lasalle: "la salle hall",
        gokongwei: "gokongwei building"
    };

    $('.filter-btn').on('click', function() {
        var selected = $('#buildingFilter').val();
        $('.lab-card').each(function() {
            var cardBuilding = $(this).find('.building-tag').text().trim().toLowerCase();
            if (!selected) { $(this).show(); return; }
            var target = buildingMap[selected];
            $(this).toggle(cardBuilding === target);
        });
    });
}


// =============================================================================
// RESERVE PAGE (pages/reserve.html)
// =============================================================================

function buildReservePage() {
    var urlParams = new URLSearchParams(window.location.search);
    var labCode = urlParams.get('lab') || "GK101A";
    var lab = getLabByCode(labCode);
    if (!lab) lab = LABS[2]; // fallback GK101A

    var user = getCurrentUser();
    var available = lab.totalSeats - lab.occupied.length - lab.reserved.length;

    var $container = $('.reserve-container');

    // Page Header
    $container.append(
        '<div class="page-header"><h1>Reserve a Seat</h1>' +
        '<p>Select your preferred seat and time slot</p></div>'
    );

    var $layout = $('<div class="reserve-layout"></div>');

    // === Left Column: Seat Selection ===
    var leftHtml =
        '<div class="seat-selection-panel"><div class="panel-card">' +
            '<div class="panel-header"><h3>' + lab.code + ' - ' + lab.building + '</h3>' +
            '<span class="availability-badge">' + available + ' seats available</span></div>';

    // Time Selection
    var today = new Date().toISOString().split('T')[0];
    leftHtml +=
        '<div class="time-selection"><label>Select Date & Time</label>' +
        '<div class="time-row">' +
        '<input type="date" id="reserveDate" value="' + today + '">' +
        '<select id="timeSlot">' + buildTimeSlotOptions("09:00") + '</select>' +
        '</div></div>';

    // Seat Map
    leftHtml += '<div class="seat-map-container">' +
        '<div class="instructor-desk"><span>Instructor\'s Desk</span></div>' +
        '<div class="seat-grid">';

    for (var r = 0; r < lab.rows.length; r++) {
        var row = lab.rows[r];
        for (var c = 1; c <= lab.cols; c++) {
            var seatId = row + c;
            var seatClass = "available";
            if (lab.occupied.indexOf(seatId) > -1) seatClass = "occupied";
            else if (lab.reserved.indexOf(seatId) > -1) seatClass = "reserved";

            leftHtml += '<div class="seat ' + seatClass + '" data-seat="' + seatId + '">' + seatId + '</div>';

            // Add gap after column 5 (for labs with 10 cols)
            if (lab.cols === 10 && c === 5) {
                leftHtml += '<div class="seat-gap"></div>';
            }
        }
    }

    leftHtml += '</div>'; // end seat-grid

    // Legend
    leftHtml +=
        '<div class="seat-legend">' +
            '<div class="legend-item"><span class="legend-seat available"></span><span>Available</span></div>' +
            '<div class="legend-item"><span class="legend-seat occupied"></span><span>Occupied</span></div>' +
            '<div class="legend-item"><span class="legend-seat reserved"></span><span>Reserved</span></div>' +
            '<div class="legend-item"><span class="legend-seat selected"></span><span>Selected</span></div>' +
        '</div>';

    leftHtml += '</div></div></div>'; // end seat-map-container, panel-card, seat-selection-panel
    $layout.append(leftHtml);

    // === Right Column: Booking Summary ===
    var timeLabel = "09:00 AM - 09:30 AM";
    var rightHtml =
        '<div class="booking-summary-panel">' +
            '<div class="panel-card summary-card">' +
                '<h3>Booking Summary</h3>' +
                '<div class="summary-details">' +
                    '<div class="summary-item"><span class="label">Lab</span><span class="value">' + lab.code + '</span></div>' +
                    '<div class="summary-item"><span class="label">Building</span><span class="value">' + lab.building + '</span></div>' +
                    '<div class="summary-item"><span class="label">Date</span><span class="value" id="summaryDate">' + formatDateLong(today) + '</span></div>' +
                    '<div class="summary-item"><span class="label">Time Slot</span><span class="value" id="summaryTime">' + timeLabel + '</span></div>' +
                    '<div class="summary-item"><span class="label">Selected Seat</span><span class="value" id="summarySeat">-</span></div>' +
                '</div>' +
                '<div class="divider"></div>' +
                '<div class="rules-section"><h4>Reservation Rules</h4>' +
                    '<ul><li>Each slot is 30 minutes</li>' +
                    '<li>Book up to 7 days in advance</li>' +
                    '<li>Arrive within 10 minutes or forfeit</li>' +
                    '<li>Maximum 2 active reservations</li></ul>' +
                '</div>' +
                '<div class="anon">' +
                    '<input type="checkbox" id="anonymousToggle">' +
                    '<span class="reserve-text">Reserve anonymously</span>' +
                '</div>' +
                '<button class="confirm-btn" id="confirmBtn" disabled>Select a Seat to Continue</button>' +
                '<a href="cmpslots.html" class="back-link">Back to Lab Selection</a>' +
            '</div>';

    // User Info Card
    if (user) {
        var initials = getInitials(user.firstName, user.lastName);
        rightHtml +=
            '<div class="panel-card user-card">' +
                '<h4>Reserving as</h4>' +
                '<div class="user-info">' +
                    '<div class="user-avatar">' + initials + '</div>' +
                    '<div class="user-details">' +
                        '<span class="user-name">' + user.firstName + ' ' + user.lastName + '</span>' +
                        '<span class="user-id">ID: ' + user.studentId + '</span>' +
                        '<span class="user-college">' + (user.college || 'CCS') + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    rightHtml += '</div>'; // end booking-summary-panel
    $layout.append(rightHtml);
    $container.append($layout);

    // === Event Handlers ===
    initSeatSelection(lab);
    initDateTimeSync();
    initAnonymousToggle();
    showSeatReservee(lab);
    pollAvailability();

    $('#confirmBtn').on('click', function() {
        handleConfirmReservation(lab);
    });
}

function initSeatSelection(lab) {
    $('.seat-grid').on('click', '.seat.available', function() {
        $('.seat.selected').removeClass('selected').addClass('available');
        $(this).removeClass('available').addClass('selected');
        var seatId = $(this).attr('data-seat');
        $('#summarySeat').text(seatId);
        $('#confirmBtn').prop('disabled', false).text("Confirm Reservation");
    });
}

function initDateTimeSync() {
    $('#reserveDate').on('change', function() {
        var val = $(this).val();
        if (val) $('#summaryDate').text(formatDateLong(val));
    });
    $('#timeSlot').on('change', function() {
        $('#summaryTime').text($(this).find('option:selected').text());
    });
}

function initAnonymousToggle() {
    $('#anonymousToggle').on('change', function() {
        var isAnon = $(this).is(':checked');
        var $status = $('#summaryAnonStatus');
        if ($status.length === 0) {
            $('.summary-details').append(
                '<div class="summary-item" id="summaryAnonStatus">' +
                '<span class="label">Mode</span><span class="value"></span></div>'
            );
            $status = $('#summaryAnonStatus');
        }
        $status.find('.value').text(isAnon ? "Anonymous" : "Public");
    });
}

function showSeatReservee(lab) {
    var occupants = SEAT_OCCUPANTS[lab.code] || {};
    $('.seat.occupied, .seat.reserved').each(function() {
        var seatId = $(this).attr('data-seat');
        var occupant = occupants[seatId];
        var status = $(this).hasClass('occupied') ? "Occupied" : "Reserved";
        if (occupant && !occupant.anonymous) {
            $(this).attr('title', status + ' by ' + occupant.name);
        } else if (occupant && occupant.anonymous) {
            $(this).attr('title', status + ' (Anonymous)');
        } else {
            $(this).attr('title', status + ' by another student');
        }
    });
}

function pollAvailability() {
    var intervalId = setInterval(function() {
        console.log("Polling for seat updates...");
        var count = Math.floor(Math.random() * 10) + 15;
        $('.availability-badge').text(count + " seats available");
    }, 30000);

    $(window).on('unload', function() { clearInterval(intervalId); });
}

function handleConfirmReservation(lab) {
    if (!isLoggedIn()) {
        alert("You must login first.");
        window.location.href = "login.html";
        return;
    }

    var user = getCurrentUser();
    var seat = $('.seat.selected').attr('data-seat');
    if (!seat) { alert("Please select a seat."); return; }

    var date = $('#reserveDate').val();
    var timeText = $('#timeSlot option:selected').text();
    var isAnon = $('#anonymousToggle').is(':checked');

    // Add to both user and global reservation stores
    var newRes = {
        id: Date.now(),
        lab: lab.code,
        seat: seat,
        building: lab.building,
        date: date,
        displayDate: formatDateLong(date),
        timeSlot: timeText,
        status: "upcoming",
        bookedOn: formatDateLong(new Date().toISOString().split('T')[0]),
        anonymous: isAnon,
        userEmail: user.email,
        isWalkIn: false
    };

    var reservations = getReservations();
    reservations.unshift(newRes);
    saveReservations(reservations);

    var allRes = getAllReservations();
    allRes.unshift(newRes);
    saveAllReservations(allRes);

    alert("Reservation confirmed for Seat " + seat + " at " + lab.code + "!");
    window.location.href = "reservations.html";
}


// =============================================================================
// RESERVATIONS PAGE (pages/reservations.html)
// =============================================================================

function buildReservationsPage() {
    var user = getCurrentUser();
    var isTechnician = user && user.accountType === 'technician';
    var reservations = isTechnician ? getAllReservations() : getReservations();
    var $container = $('.reservations-container');

    // Page Header
    var headerTitle = isTechnician ? 'All Reservations' : 'My Reservations';
    var headerDesc = isTechnician ? 'View and manage all lab reservations' : 'View and manage your lab reservations';
    $container.append(
        '<div class="page-header"><div class="header-content">' +
        '<h1>' + headerTitle + '</h1><p>' + headerDesc + '</p>' +
        '</div></div>'
    );

    // Filter Tabs
    $container.append(
        '<div class="filter-tabs">' +
            '<button class="tab-btn active" data-filter="all">All</button>' +
            '<button class="tab-btn" data-filter="upcoming">Upcoming</button>' +
            '<button class="tab-btn" data-filter="completed">Completed</button>' +
            '<button class="tab-btn" data-filter="cancelled">Cancelled</button>' +
        '</div>'
    );

    // Reservations List
    var $list = $('<div class="reservations-list"></div>');

    for (var i = 0; i < reservations.length; i++) {
        var r = reservations[i];
        var dp = parseDateParts(r.date);

        var actionsHtml = '';
        if (r.status === 'upcoming') {
            actionsHtml = '<button class="action-btn edit">Edit</button>' +
                          '<button class="action-btn cancel">Cancel</button>';
        } else {
            actionsHtml = '<button class="action-btn rebook">Book Again</button>';
        }

        var bookedLabel = (r.status === 'cancelled') ? 'Cancelled on ' + r.bookedOn : 'Booked on ' + r.bookedOn;
        var userLabel = (isTechnician && r.userEmail) ? '<span class="booked-date" style="display:block;margin-top:4px;">User: ' + r.userEmail + '</span>' : '';
        var walkInBadge = r.isWalkIn ? '<span class="status-badge" style="background:#17a2b8;margin-left:4px;">Walk-In</span>' : '';

        $list.append(
            '<div class="reservation-card ' + r.status + '" data-status="' + r.status + '" data-id="' + r.id + '">' +
                '<div class="card-date"><span class="day">' + dp.day + '</span>' +
                '<span class="month">' + dp.month + '</span>' +
                '<span class="year">' + dp.year + '</span></div>' +
                '<div class="card-content"><div class="reservation-main">' +
                    '<h3>' + r.lab + ' - Seat ' + r.seat + '</h3>' +
                    '<p class="location">' + r.building + '</p>' +
                    '<div class="time-slot"><span class="time">' + r.timeSlot + '</span></div>' +
                '</div><div class="reservation-meta">' +
                    '<span class="status-badge ' + r.status + '">' + r.status.charAt(0).toUpperCase() + r.status.slice(1) + '</span>' +
                    walkInBadge +
                    '<span class="booked-date">' + bookedLabel + '</span>' +
                    userLabel +
                '</div></div>' +
                '<div class="card-actions">' + actionsHtml + '</div>' +
            '</div>'
        );
    }
    $container.append($list);

    // Pagination
    $container.append(
        '<div class="pagination">' +
            '<button class="page-btn" disabled>Previous</button>' +
            '<span class="page-info">Page 1 of 1</span>' +
            '<button class="page-btn">Next</button>' +
        '</div>'
    );

    // Event Handlers
    initReservationFilters();
    handleCancelReservation();
    handleRebook();
    handleEditReservation();
}

function initReservationFilters() {
    $('.tab-btn').on('click', function() {
        var filter = $(this).data('filter');
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');

        $('.reservation-card').each(function() {
            var status = $(this).data('status');
            if (filter === 'all' || status === filter) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });

        if (typeof window.refreshPagination === 'function') {
            window.refreshPagination();
        }
    });

    $('.tab-btn.active').trigger('click');
}

function handleCancelReservation() {
    $('.reservations-list').on('click', '.action-btn.cancel', function() {
        var card = $(this).closest('.reservation-card');
        if (confirm('Are you sure you want to cancel this reservation?')) {
            var resId = card.data('id');

            // Update user reservations
            var reservations = getReservations();
            for (var i = 0; i < reservations.length; i++) {
                if (reservations[i].id === resId) {
                    reservations[i].status = 'cancelled';
                    break;
                }
            }
            saveReservations(reservations);

            // Update global reservations
            var allRes = getAllReservations();
            for (var j = 0; j < allRes.length; j++) {
                if (allRes[j].id === resId) {
                    allRes[j].status = 'cancelled';
                    break;
                }
            }
            saveAllReservations(allRes);

            // Update DOM
            card.attr('data-status', 'cancelled').data('status', 'cancelled');
            card.removeClass('upcoming').addClass('cancelled');
            card.find('.status-badge').first().text('Cancelled').removeClass('upcoming completed').addClass('cancelled');
            card.find('.action-btn.edit').remove();
            $(this).replaceWith('<button class="action-btn rebook">Book Again</button>');

            var activeFilter = $('.tab-btn.active').data('filter');
            if (activeFilter !== 'all' && activeFilter !== 'cancelled') {
                card.fadeOut('fast');
            }
        }
    });
}

function handleRebook() {
    $('.reservations-list').on('click', '.action-btn.rebook', function() {
        var card = $(this).closest('.reservation-card');
        var fullTitle = card.find('.reservation-main h3').text();
        var lab = fullTitle.split(' - ')[0];
        if (lab) {
            window.location.href = 'reserve.html?lab=' + encodeURIComponent(lab.trim());
        }
    });
}

function handleEditReservation() {
    $('.reservations-list').on('click', '.action-btn.edit', function() {
        var card = $(this).closest('.reservation-card');
        var lab = card.find('.reservation-main h3').text().split(' - ')[0];
        var resId = card.data('id') || '';
        window.location.href = 'reserve.html?lab=' + encodeURIComponent(lab) + '&edit=' + resId;
    });
}


// =============================================================================
// PROFILE PAGE (pages/profile.html)
// =============================================================================

function buildProfilePage() {
    var user = getCurrentUser();
    if (!user) return;

    var reservations = getReservations();
    var upcoming = reservations.filter(function(r) { return r.status === "upcoming"; });
    var completed = reservations.filter(function(r) { return r.status === "completed"; });
    var cancelled = reservations.filter(function(r) { return r.status === "cancelled"; });
    var totalRes = reservations.length;
    var hoursUsed = (completed.length * 0.5).toFixed(1);
    var noShows = Math.max(0, totalRes - completed.length - cancelled.length - upcoming.length);
    var attendanceRate = totalRes > 0 ? Math.round((completed.length / (totalRes - upcoming.length)) * 100) : 100;

    var initials = getInitials(user.firstName, user.lastName);
    var $container = $('.profile-container');

    // Profile Header
    $container.append(
        '<div class="profile-header">' +
            '<div class="avatar-section"><div class="avatar"><span>' + initials + '</span></div>' +
            '<button class="change-avatar-btn">Change Photo</button></div>' +
            '<div class="header-info">' +
                '<h1>' + user.firstName + ' ' + user.lastName + '</h1>' +
                '<p class="email">' + user.email + '</p>' +
                '<div class="badges">' +
                    '<span class="badge student">' + (user.accountType === 'technician' ? 'Technician' : 'Student') + '</span>' +
                    '<span class="badge college">' + (user.college || 'CCS') + '</span>' +
                    '<span class="badge active">Active</span>' +
                '</div>' +
            '</div>' +
        '</div>'
    );

    // Profile Grid
    var $grid = $('<div class="profile-grid"></div>');

    // Personal Information Card
    $grid.append(
        '<div class="profile-card">' +
            '<div class="card-header"><h3>Personal Information</h3>' +
            '<button class="edit-btn" id="editPersonalBtn">Edit</button></div>' +
            '<form class="profile-form" id="personalForm">' +
                '<div class="form-row">' +
                    '<div class="form-group"><label for="firstName">First Name</label>' +
                    '<input type="text" id="firstName" value="' + (user.firstName || '') + '" disabled></div>' +
                    '<div class="form-group"><label for="lastName">Last Name</label>' +
                    '<input type="text" id="lastName" value="' + (user.lastName || '') + '" disabled></div>' +
                '</div>' +
                '<div class="form-group"><label for="studentId">Student ID</label>' +
                '<input type="text" id="studentId" value="' + (user.studentId || '') + '" disabled></div>' +
                '<div class="form-group"><label for="email">DLSU Email</label>' +
                '<input type="email" id="email" value="' + (user.email || '') + '" disabled></div>' +
                '<div class="form-group"><label for="college">College</label>' +
                '<select id="college" disabled>' + buildCollegeOptions(user.college, false) + '</select></div>' +
                '<div class="form-group"><label for="bio">Description</label>' +
                '<input type="text" id="bio" placeholder="Tell us about yourself..." value="' + (user.bio || '') + '" disabled></div>' +
                '<div class="form-actions hidden" id="personalActions">' +
                    '<button type="button" class="cancel-btn">Cancel</button>' +
                    '<button type="submit" class="save-btn">Save Changes</button>' +
                '</div>' +
            '</form>' +
        '</div>'
    );

    // Account Settings Card
    $grid.append(
        '<div class="profile-card">' +
            '<div class="card-header"><h3>Account Settings</h3></div>' +
            '<div class="settings-list">' +
                '<div class="setting-item"><div class="setting-info">' +
                    '<h4>Change Password</h4><p>Update your account password</p></div>' +
                    '<button class="setting-btn">Change</button></div>' +
                '<div class="setting-item"><div class="setting-info">' +
                    '<h4>Email Notifications</h4><p>Receive reservation reminders</p></div>' +
                    '<label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>' +
            '</div>' +
        '</div>'
    );

    // Statistics Card
    $grid.append(
        '<div class="profile-card stats-card">' +
            '<div class="card-header"><h3>Your Statistics</h3></div>' +
            '<div class="stats-grid">' +
                '<div class="stat-item"><span class="stat-value">' + totalRes + '</span><span class="stat-label">Total Reservations</span></div>' +
                '<div class="stat-item"><span class="stat-value">' + completed.length + '</span><span class="stat-label">Completed</span></div>' +
                '<div class="stat-item"><span class="stat-value">' + cancelled.length + '</span><span class="stat-label">Cancelled</span></div>' +
                '<div class="stat-item"><span class="stat-value">' + noShows + '</span><span class="stat-label">No-shows</span></div>' +
                '<div class="stat-item"><span class="stat-value">' + hoursUsed + '</span><span class="stat-label">Hours Used</span></div>' +
                '<div class="stat-item"><span class="stat-value">' + attendanceRate + '%</span><span class="stat-label">Attendance Rate</span></div>' +
            '</div>' +
            '<div class="member-since"><p>Member since <strong>September 2024</strong></p></div>' +
        '</div>'
    );

    // Current Reservations Card
    var resHtml = '<div class="profile-card">' +
        '<div class="card-header"><h3>Current Reservations</h3>' +
        '<a href="reservations.html" class="view-all">View All</a></div>' +
        '<div class="settings-list">';

    if (upcoming.length === 0) {
        resHtml += '<div class="setting-item"><div class="setting-info"><p>No upcoming reservations</p></div></div>';
    } else {
        for (var i = 0; i < upcoming.length; i++) {
            var r = upcoming[i];
            resHtml += '<div class="setting-item"><div class="setting-info">' +
                '<h4>' + r.lab + ' - Seat ' + r.seat + '</h4>' +
                '<p>' + r.displayDate + ' | ' + r.timeSlot + '</p>' +
                '</div><span class="status-badge upcoming">Upcoming</span></div>';
        }
    }
    resHtml += '</div></div>';
    $grid.append(resHtml);

    // Danger Zone
    $grid.append(
        '<div class="profile-card danger-card">' +
            '<div class="card-header"><h3>Danger Zone</h3></div>' +
            '<div class="danger-content"><div class="danger-item">' +
                '<div class="danger-info"><h4>Delete Account</h4>' +
                '<p>Permanently delete your account and all data. This action cannot be undone.</p></div>' +
                '<button class="danger-btn">Delete Account</button>' +
            '</div></div>' +
        '</div>'
    );

    $container.append($grid);

    // Event Handlers
    initProfileEdit();
    handleDeleteAccount();
    handleChangePassword();
    handleChangeAvatar();
    handleNotificationToggle();
}

function initProfileEdit() {
    var $editBtn = $('#editPersonalBtn');
    var $form = $('#personalForm');
    var $inputs = $form.find('input, select, textarea');
    var $actions = $('#personalActions');
    var $cancelBtn = $actions.find('.cancel-btn');
    var $saveBtn = $actions.find('.save-btn');
    var originalValues = {};

    $editBtn.on('click', function() {
        $inputs.prop('disabled', false);
        $actions.removeClass('hidden');
        $editBtn.hide();
        originalValues = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            studentId: $('#studentId').val(),
            email: $('#email').val(),
            college: $('#college').val(),
            bio: $('#bio').val()
        };
    });

    $cancelBtn.on('click', function() {
        $('#firstName').val(originalValues.firstName);
        $('#lastName').val(originalValues.lastName);
        $('#studentId').val(originalValues.studentId);
        $('#email').val(originalValues.email);
        $('#college').val(originalValues.college);
        $('#bio').val(originalValues.bio);
        $inputs.prop('disabled', true);
        $actions.addClass('hidden');
        $editBtn.show();
    });

    $saveBtn.on('click', function(e) {
        e.preventDefault();
        var firstName = $('#firstName').val().trim();
        var lastName = $('#lastName').val().trim();
        var email = $('#email').val().trim();
        if (!firstName || !lastName || !email) {
            alert('Please fill out all required fields.');
            return;
        }
        var currentUser = getCurrentUser();
        var updatedUser = {
            firstName: firstName,
            lastName: lastName,
            studentId: $('#studentId').val(),
            email: email,
            college: $('#college').val(),
            accountType: currentUser ? currentUser.accountType : 'student',
            bio: $('#bio').val().trim()
        };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

        // Sync to accounts storage
        var accounts = getAccounts();
        for (var idx = 0; idx < accounts.length; idx++) {
            if (accounts[idx].email.toLowerCase() === (currentUser ? currentUser.email.toLowerCase() : email.toLowerCase())) {
                accounts[idx].firstName = firstName;
                accounts[idx].lastName = lastName;
                accounts[idx].college = updatedUser.college;
                accounts[idx].bio = updatedUser.bio;
                break;
            }
        }
        saveAccounts(accounts);

        $('.header-info h1').text(firstName + ' ' + lastName);
        $('.header-info .email').text(email);
        $('.avatar span').text(firstName[0] + lastName[0]);
        $inputs.prop('disabled', true);
        $actions.addClass('hidden');
        $editBtn.show();
        alert('Profile updated!');
    });
}

function handleDeleteAccount() {
    $('.danger-card .danger-btn').on('click', function() {
        if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
            var user = getCurrentUser();
            if (user) {
                // Remove from accounts store
                var accounts = getAccounts();
                var filtered = [];
                for (var i = 0; i < accounts.length; i++) {
                    if (accounts[i].email.toLowerCase() !== user.email.toLowerCase()) {
                        filtered.push(accounts[i]);
                    }
                }
                saveAccounts(filtered);

                // Remove user's reservations from global store
                var allRes = getAllReservations();
                var filteredRes = [];
                for (var j = 0; j < allRes.length; j++) {
                    if (allRes[j].userEmail !== user.email) {
                        filteredRes.push(allRes[j]);
                    }
                }
                saveAllReservations(filteredRes);
            }
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(RESERVATIONS_KEY);
            window.location.href = '../index.html';
        }
    });
}

function handleChangePassword() {
    $('.setting-btn').on('click', function() {
        window.location.href = 'changepassword.html';
    });

    var $form = $('#changePasswordForm');
    if ($form.length) {
        $form.on('submit', function(e) {
            e.preventDefault();
            var user = getCurrentUser();
            if (!user) { window.location.href = 'login.html'; return; }

            var currentPassword = $('#currentPassword').val();
            var newPassword = $('#newPassword').val();
            var confirmPassword = $('#confirmPassword').val();
            var $error = $('#passwordError');
            var $success = $('#passwordSuccess');
            $error.hide().text('');
            $success.hide().text('');

            if (!currentPassword || !newPassword || !confirmPassword) {
                $error.text('All fields are required.').show(); return;
            }
            if (newPassword.length < 8) {
                $error.text('New password must be at least 8 characters long.').show(); return;
            }
            if (newPassword !== confirmPassword) {
                $error.text('New password and confirmation do not match.').show(); return;
            }
            var account = authenticateUser(user.email, currentPassword);
            if (!account) {
                $error.text('Current password is incorrect.').show(); return;
            }
            updateAccountPassword(user.email, newPassword);
            alert('Password changed successfully!');
            window.location.href = 'profile.html';
        });
    }
}

function handleChangeAvatar() {
    var $fileInput = $('<input>', { type: 'file', accept: 'image/png, image/jpeg, image/gif', style: 'display:none' }).appendTo('body');
    $('.change-avatar-btn').on('click', function() { $fileInput.click(); });
    $fileInput.on('change', function() {
        var file = this.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert("File too large! Max 2MB."); return; }
        var reader = new FileReader();
        reader.onload = function(e) {
            var $img = $('<img>').attr({ src: e.target.result, style: 'width:100%;height:100%;border-radius:50%;object-fit:cover;' });
            $('.avatar').empty().append($img);
        };
        reader.readAsDataURL(file);
    });
}

function handleNotificationToggle() {
    $('.setting-item .toggle input[type="checkbox"]').on('change', function() {
        var enabled = $(this).is(':checked');
        alert(enabled ? 'Email notifications enabled' : 'Email notifications disabled');
    });
}


// =============================================================================
// USERS PAGE (pages/users.html)
// =============================================================================

function buildUsersPage() {
    var $container = $('.users-container');

    // Page Header
    $container.append(
        '<div class="page-header"><h1>Find Users</h1>' +
        '<p>Search and connect with other OpenLab users</p></div>'
    );

    // Search Section
    $container.append(
        '<div class="search-section"><div class="search-card"><div class="search-row">' +
            '<div class="search-input-group">' +
            '<input type="text" id="userSearch" placeholder="Search by name or student ID..."></div>' +
            '<div class="filter-group"><select id="collegeFilter">' +
                '<option value="">All Colleges</option>' + buildCollegeOptions("", false) +
            '</select></div>' +
            '<button class="search-btn">Search</button>' +
        '</div></div></div>'
    );

    // Users Grid
    var $grid = $('<div class="users-grid"></div>');
    for (var i = 0; i < SAMPLE_USERS.length; i++) {
        var u = SAMPLE_USERS[i];
        var initials = getInitials(u.firstName, u.lastName);
        var avatarExtra = u.avatarClass ? ' ' + u.avatarClass : '';
        var collegeBadgeClass = u.college.toLowerCase();

        $grid.append(
            '<div class="user-card" data-college="' + u.college + '">' +
                '<div class="user-avatar' + avatarExtra + '"><span>' + initials + '</span></div>' +
                '<div class="user-info">' +
                    '<h3>' + u.firstName + ' ' + u.lastName + '</h3>' +
                    '<p class="user-id">ID: ' + u.id + '</p>' +
                    '<span class="college-badge ' + collegeBadgeClass + '">' + u.college + '</span>' +
                '</div>' +
                '<div class="user-stats"><div class="stat">' +
                    '<span class="value">' + u.totalSessions + '</span>' +
                    '<span class="label">Sessions</span>' +
                '</div></div>' +
                '<a href="public-profile.html?id=' + u.id + '" class="view-profile-btn">View Profile</a>' +
            '</div>'
        );
    }
    $container.append($grid);

    // Pagination
    $container.append(
        '<div class="pagination">' +
            '<button class="page-btn" disabled>Previous</button>' +
            '<div class="page-numbers">' +
                '<button class="page-num active">1</button>' +
            '</div>' +
            '<button class="page-btn">Next</button>' +
        '</div>'
    );

    // Search logic
    initUserSearch();
}

function initUserSearch() {
    var $searchInput = $('#userSearch');
    var $collegeFilter = $('#collegeFilter');
    var $searchBtn = $('.search-btn');

    function filterCards() {
        var searchTerm = $searchInput.val().toLowerCase().trim();
        var selectedCollege = $collegeFilter.val();

        $('.user-card').each(function() {
            var $card = $(this);
            var name = $card.find('h3').text().toLowerCase();
            var studentId = $card.find('.user-id').text().toLowerCase();
            var college = $card.find('.college-badge').text();
            var matchesSearch = name.indexOf(searchTerm) > -1 || studentId.indexOf(searchTerm) > -1;
            var matchesCollege = selectedCollege === '' || college === selectedCollege;
            $card.toggle(matchesSearch && matchesCollege);
        });

        if (typeof window.refreshPagination === 'function') {
            window.refreshPagination();
        }
    }

    $searchBtn.on('click', filterCards);
    $searchInput.on('keyup', filterCards);
    $collegeFilter.on('change', filterCards);
    $searchInput.on('keypress', function(e) { if (e.which === 13) filterCards(); });
    filterCards();
}


// =============================================================================
// PUBLIC PROFILE PAGE (pages/public-profile.html)
// =============================================================================

function buildPublicProfilePage() {
    var urlParams = new URLSearchParams(window.location.search);
    var userId = urlParams.get('id');
    var $container = $('.profile-container');

    if (!userId) {
        $container.html(
            '<div class="page-header" style="text-align:center;color:#fff;">' +
            '<h1>User Not Found</h1><p>No user ID provided.</p>' +
            '<a href="users.html" class="back-link">Back to Find Users</a></div>'
        );
        return;
    }

    var user = getUserById(userId);
    if (!user) {
        $container.html(
            '<div class="page-header" style="text-align:center;color:#fff;">' +
            '<h1>User Not Found</h1><p>No user exists with ID: ' + userId + '</p>' +
            '<a href="users.html" class="back-link">Back to Find Users</a></div>'
        );
        return;
    }

    var initials = getInitials(user.firstName, user.lastName);
    document.title = user.firstName + ' ' + user.lastName + ' - OpenLab';

    // Profile Header
    $container.append(
        '<div class="profile-header">' +
            '<div class="avatar-section"><div class="avatar"><span>' + initials + '</span></div></div>' +
            '<div class="header-info">' +
                '<h1>' + user.firstName + ' ' + user.lastName + '</h1>' +
                '<p class="email">' + user.email + '</p>' +
                '<div class="badges">' +
                    '<span class="badge student">Student</span>' +
                    '<span class="badge college">' + user.college + '</span>' +
                    '<span class="badge active">Active</span>' +
                '</div>' +
                '<p class="bio">' + user.bio + '</p>' +
            '</div>' +
        '</div>'
    );

    // Current Reservations
    var resHtml = '<div class="profile-card">' +
        '<div class="card-header"><h3>Current Reservations</h3></div>' +
        '<div class="settings-list">';

    if (user.reservations.length === 0) {
        resHtml += '<div class="setting-item"><div class="setting-info"><p>No current reservations</p></div></div>';
    } else {
        for (var i = 0; i < user.reservations.length; i++) {
            var r = user.reservations[i];
            resHtml += '<div class="setting-item"><div class="setting-info">' +
                '<h4>' + r.lab + ' - Seat ' + r.seat + '</h4>' +
                '<p>' + r.date + ' | ' + r.time + '</p>' +
                '</div></div>';
        }
    }
    resHtml += '</div></div>';
    $container.append(resHtml);

    // Statistics
    $container.append(
        '<div class="profile-card stats-card">' +
            '<div class="card-header"><h3>Statistics</h3></div>' +
            '<div class="stats-grid">' +
                '<div class="stat-item"><span class="stat-value">' + user.totalSessions + '</span><span class="stat-label">Total Sessions</span></div>' +
                '<div class="stat-item"><span class="stat-value">' + user.completed + '</span><span class="stat-label">Completed</span></div>' +
                '<div class="stat-item"><span class="stat-value">' + user.cancelled + '</span><span class="stat-label">Cancelled</span></div>' +
                '<div class="stat-item"><span class="stat-value">' + user.hoursUsed + '</span><span class="stat-label">Hours Used</span></div>' +
            '</div>' +
            '<div class="member-since"><p>Member since <strong>' + user.memberSince + '</strong></p></div>' +
        '</div>'
    );
}


// =============================================================================
// WALK-IN RESERVATION PAGE (pages/walkin.html)
// =============================================================================

function buildWalkinPage() {
    var $container = $('.reserve-container');
    var user = getCurrentUser();

    // Page Header
    $container.append(
        '<div class="page-header"><h1>Walk-In Reservation</h1>' +
        '<p>Lab technicians: Reserve a seat for a walk-in student</p></div>'
    );

    var $layout = $('<div class="reserve-layout"></div>');

    // Left Column: Walk-In Form
    var labOptions = '';
    for (var i = 0; i < LABS.length; i++) {
        labOptions += '<option value="' + LABS[i].code + '">' + LABS[i].code + ' - ' + LABS[i].building + '</option>';
    }

    var today = new Date().toISOString().split('T')[0];

    $layout.append(
        '<div class="seat-selection-panel"><div class="panel-card">' +
            '<div class="panel-header"><h3>Walk-In Student Details</h3></div>' +
            '<form class="walkin-form">' +
                '<div class="time-selection"><label for="walkinStudentId">Student ID</label>' +
                '<div class="time-row"><input type="text" id="walkinStudentId" placeholder="Enter 8-digit student ID" pattern="[0-9]{8}" required></div></div>' +
                '<div class="time-selection"><label for="walkinLab">Select Lab</label>' +
                '<div class="time-row"><select id="walkinLab" required>' +
                '<option value="" disabled selected>Choose a lab</option>' + labOptions + '</select></div></div>' +
                '<div class="time-selection"><label for="walkinSeat">Seat Number</label>' +
                '<div class="time-row"><input type="text" id="walkinSeat" placeholder="e.g., A1, B5, C10" required></div></div>' +
                '<div class="time-selection"><label>Date & Time Slot</label>' +
                '<div class="time-row"><input type="date" id="walkinDate" value="' + today + '">' +
                '<select id="walkinTime">' + buildTimeSlotOptions("09:00") + '</select></div></div>' +
                '<button type="submit" class="confirm-btn">Reserve for Student</button>' +
            '</form>' +
        '</div></div>'
    );

    // Right Column: Current Walk-In Reservations from global store
    var allRes = getAllReservations();
    var walkinRes = [];
    for (var w = 0; w < allRes.length; w++) {
        if (allRes[w].isWalkIn && allRes[w].status === 'upcoming') {
            walkinRes.push(allRes[w]);
        }
    }

    var rightHtml =
        '<div class="booking-summary-panel"><div class="panel-card summary-card">' +
        '<h3>Current Walk-In Reservations</h3>' +
        '<div class="summary-item"><p>Remove no-show students or manage walk-in reservations</p></div>' +
        '<div class="summary-details">';

    if (walkinRes.length === 0) {
        rightHtml += '<div class="summary-item" style="text-align:center;color:#666;"><p>No current walk-in reservations</p></div>';
    } else {
        for (var j = 0; j < walkinRes.length; j++) {
            var wr = walkinRes[j];
            var studentName = 'Student';
            var accounts = getAccounts();
            for (var a = 0; a < accounts.length; a++) {
                if (accounts[a].studentId === wr.userId) {
                    studentName = accounts[a].firstName + ' ' + accounts[a].lastName;
                    break;
                }
            }
            rightHtml +=
                '<div class="walkin-reservation-item" data-reservation-id="' + wr.id + '">' +
                    '<div class="summary-item">' +
                        '<span class="label">' + wr.lab + ' - Seat ' + wr.seat + '</span>' +
                        '<span class="value">' + wr.timeSlot.split(' - ')[0] + ' - ' + studentName + ' (' + wr.userId + ')</span>' +
                    '</div>' +
                    '<button class="remove-btn">Remove No-Show</button>' +
                '</div>';
            if (j < walkinRes.length - 1) {
                rightHtml += '<div class="divider"></div>';
            }
        }
    }

    rightHtml += '</div><a href="dashboard.html" class="back-link">Back to Dashboard</a></div></div>';
    $layout.append(rightHtml);
    $container.append($layout);

    // Event Handlers
    initWalkInReservation();
    handleRemoveNoShow();
}

function initWalkInReservation() {
    $('.walkin-form').on('submit', function(e) {
        e.preventDefault();
        var user = getCurrentUser();
        var studentId = $('#walkinStudentId').val().trim();
        var lab = $('#walkinLab').val();
        var seat = $('#walkinSeat').val().trim().toUpperCase();
        var date = $('#walkinDate').val();
        var time = $('#walkinTime').val();

        if (!/^[0-9]{8}$/.test(studentId)) {
            alert('Student ID must be exactly 8 digits.'); $('#walkinStudentId').focus(); return;
        }
        if (!lab) { alert('Please select a lab.'); $('#walkinLab').focus(); return; }
        if (!seat) { alert('Please enter a seat number.'); $('#walkinSeat').focus(); return; }
        if (!/^[A-Z][0-9]{1,2}$/i.test(seat)) {
            alert('Seat must be in format like A1, B5, or C10.'); $('#walkinSeat').focus(); return;
        }
        if (!date) { alert('Please select a date.'); $('#walkinDate').focus(); return; }
        var selectedDate = new Date(date);
        var todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
        if (selectedDate < todayDate) { alert('Cannot reserve for a past date.'); $('#walkinDate').focus(); return; }
        if (!time) { alert('Please select a time slot.'); $('#walkinTime').focus(); return; }

        var timeText = $('#walkinTime option:selected').text();
        var labObj = getLabByCode(lab);

        // Find student name from accounts if registered
        var studentName = 'Student';
        var studentEmail = 'walkin_' + studentId + '@temp.dlsu.edu.ph';
        var accounts = getAccounts();
        for (var i = 0; i < accounts.length; i++) {
            if (accounts[i].studentId === studentId) {
                studentName = accounts[i].firstName + ' ' + accounts[i].lastName;
                studentEmail = accounts[i].email;
                break;
            }
        }

        // Create walk-in reservation and persist to global store
        var newRes = {
            id: Date.now(),
            lab: lab,
            seat: seat,
            building: labObj ? labObj.building : '',
            date: date,
            displayDate: formatDateLong(date),
            timeSlot: timeText,
            status: "upcoming",
            bookedOn: formatDateLong(new Date().toISOString().split('T')[0]),
            anonymous: false,
            userEmail: studentEmail,
            userId: studentId,
            isWalkIn: true,
            createdBy: user ? user.email : ''
        };

        var allRes = getAllReservations();
        allRes.unshift(newRes);
        saveAllReservations(allRes);

        alert('Walk-in reservation created!\n\nStudent ID: ' + studentId +
              '\nStudent: ' + studentName +
              '\nLab: ' + lab + '\nSeat: ' + seat + '\nDate: ' + date + '\nTime: ' + timeText);

        // Remove empty state message if present
        var $emptyMsg = $('.summary-details .summary-item p');
        if ($emptyMsg.length && $emptyMsg.text().indexOf('No current') > -1) {
            $emptyMsg.closest('.summary-item').remove();
        }

        // Add to current reservations panel
        var newItemHtml =
            '<div class="divider"></div>' +
            '<div class="walkin-reservation-item" data-reservation-id="' + newRes.id + '">' +
                '<div class="summary-item">' +
                    '<span class="label">' + lab + ' - Seat ' + seat + '</span>' +
                    '<span class="value">' + timeText.split(' - ')[0] + ' - ' + studentName + ' (' + studentId + ')</span>' +
                '</div>' +
                '<button class="remove-btn">Remove No-Show</button>' +
            '</div>';
        $('.summary-details').append(newItemHtml);

        $('.walkin-form')[0].reset();
    });
}

function handleRemoveNoShow() {
    $('.summary-details').on('click', '.remove-btn', function() {
        var $item = $(this).closest('.walkin-reservation-item');
        var resId = $item.data('reservation-id');
        var seatInfo = $item.find('.label').text();
        var studentInfo = $item.find('.value').text();

        if (confirm('Remove this no-show reservation?\n\n' + seatInfo + '\n' + studentInfo +
                     '\n\nThis will cancel the reservation and free the seat.')) {
            // Update status in global store
            var allRes = getAllReservations();
            for (var i = 0; i < allRes.length; i++) {
                if (allRes[i].id === resId) {
                    allRes[i].status = 'cancelled';
                    break;
                }
            }
            saveAllReservations(allRes);

            $item.prev('.divider').remove();
            $item.fadeOut(300, function() {
                $(this).remove();
                if ($('.walkin-reservation-item').length === 0) {
                    $('.summary-details').html(
                        '<div class="summary-item" style="text-align:center;color:#666;"><p>No current walk-in reservations</p></div>'
                    );
                }
            });
            setTimeout(function() { alert('No-show reservation removed successfully.'); }, 350);
        }
    });
}


// =============================================================================
// LOGIN PAGE (pages/login.html)
// =============================================================================

function buildLoginPage() {
    var $banner = $('.banner-content');
    $banner.append(
        '<div class="login-card">' +
            '<h2>Welcome Back</h2>' +
            '<p class="subtitle">Sign in to access your lab reservations</p>' +
            '<form class="login-form">' +
                '<div class="form-group"><label for="email">Email Address</label>' +
                '<input type="email" id="email" name="email" placeholder="Enter your DLSU email" required></div>' +
                '<div class="form-group"><label for="password">Password</label>' +
                '<input type="password" id="password" name="password" placeholder="Enter your password" required></div>' +
                '<div class="form-options">' +
                    '<label class="remember-me"><input type="checkbox" name="remember" id="remember"><span>Remember me</span></label>' +
                    '<a href="#" class="forgot-password">Forgot password?</a>' +
                '</div>' +
                '<button type="submit" class="login-btn">Sign In</button>' +
            '</form>' +
            '<div class="divider"><span>or continue with</span></div>' +
            '<p class="register-link">Don\'t have an account? <a href="register.html">Sign up</a></p>' +
        '</div>'
    );

    initLoginPage();
}

function initLoginPage() {
    $('.login-form').on('submit', function(e) {
        e.preventDefault();
        var email = $('#email').val().trim();
        var password = $('#password').val();

        if (!email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        var account = authenticateUser(email, password);
        if (!account) {
            alert("Invalid email or password.");
            $('#password').val('').focus();
            return;
        }

        // Create session user (without password)
        var sessionUser = {
            firstName: account.firstName,
            lastName: account.lastName,
            email: account.email,
            studentId: account.studentId,
            college: account.college,
            accountType: account.accountType,
            bio: account.bio
        };
        localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));

        // Seed/load user reservations
        seedUserReservations(account.email);

        window.location.href = "dashboard.html";
    });

    $('.forgot-password').on('click', function(e) {
        e.preventDefault();
        var email = prompt("Enter your DLSU email:");
        if (email) {
            var account = findAccountByEmail(email);
            if (account) {
                alert("Password hint: Your password is '" + account.password + "'");
            } else {
                alert("Email not found in our records.");
            }
        }
    });
}


// =============================================================================
// REGISTER PAGE (pages/register.html)
// =============================================================================

function buildRegisterPage() {
    var $banner = $('.banner-content');
    $banner.append(
        '<div class="register-card">' +
            '<h2>Create Account</h2>' +
            '<p class="subtitle">Join OpenLab to start reserving computer slots</p>' +
            '<form class="register-form">' +
                '<div class="name-row">' +
                    '<div class="form-group"><label for="firstName">First Name</label>' +
                    '<input type="text" id="firstName" name="firstName" placeholder="Juan" autocomplete="given-name" required></div>' +
                    '<div class="form-group"><label for="lastName">Last Name</label>' +
                    '<input type="text" id="lastName" name="lastName" placeholder="Dela Cruz" autocomplete="family-name" required></div>' +
                '</div>' +
                '<div class="form-group"><label for="studentId">Student ID</label>' +
                '<input type="text" id="studentId" name="studentId" placeholder="12345678" pattern="[0-9]{8}" title="Please enter your 8-digit student ID" required></div>' +
                '<div class="form-group"><label for="email">DLSU Email</label>' +
                '<input type="email" id="email" name="email" placeholder="juan_delacruz@dlsu.edu.ph" autocomplete="email" required></div>' +
                '<div class="form-group"><label for="college">College</label>' +
                '<select id="college" name="college" required>' + buildCollegeOptions("", true) + '</select></div>' +
                '<div class="form-group"><label for="accountType">Account Type</label>' +
                '<select id="accountType" name="accountType" required>' +
                    '<option value="" disabled selected>Select account type</option>' +
                    '<option value="student">Student</option>' +
                    '<option value="technician">Lab Technician</option>' +
                '</select></div>' +
                '<div class="form-group"><label for="password">Password</label>' +
                '<input type="password" id="password" name="password" placeholder="Create a strong password" minlength="8" autocomplete="new-password" required></div>' +
                '<div class="form-group"><label for="confirmPassword">Confirm Password</label>' +
                '<input type="password" id="confirmPassword" name="confirmPassword" placeholder="Re-enter your password" autocomplete="new-password" required></div>' +
                '<button type="submit" class="register-btn">Create Account</button>' +
            '</form>' +
            '<p class="login-link">Already have an account? <a href="login.html">Sign in</a></p>' +
        '</div>'
    );

    initRegisterPage();
}

function initRegisterPage() {
    $('.register-form').on('submit', function(e) {
        e.preventDefault();
        var pass = $('#password').val();
        var confirmPass = $('#confirmPassword').val();
        var studentId = $('#studentId').val().trim();
        var email = $('#email').val().trim();

        if (pass !== confirmPass) { alert("Passwords do not match."); return; }
        if (pass.length < 8) { alert("Password must be at least 8 characters."); return; }
        if (!/^[0-9]{8}$/.test(studentId)) { alert("Student ID must be exactly 8 digits."); return; }

        var result = registerAccount({
            firstName: $('#firstName').val().trim(),
            lastName: $('#lastName').val().trim(),
            studentId: studentId,
            email: email,
            college: $('#college').val(),
            accountType: $('#accountType').val(),
            password: pass
        });

        if (!result.success) {
            alert("Registration failed: " + result.error);
            return;
        }

        // Auto-login after registration
        var sessionUser = {
            firstName: result.account.firstName,
            lastName: result.account.lastName,
            email: result.account.email,
            studentId: result.account.studentId,
            college: result.account.college,
            accountType: result.account.accountType,
            bio: ''
        };
        localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
        localStorage.setItem(RESERVATIONS_KEY, JSON.stringify([]));

        alert("Registration successful! Welcome to OpenLab.");
        window.location.href = "dashboard.html";
    });
}


// =============================================================================
// CHANGE PASSWORD PAGE (pages/changepassword.html)
// =============================================================================

function buildChangePasswordPage() {
    var $banner = $('.banner-content');
    $banner.append(
        '<div class="pwd-card">' +
            '<h2>Change your Password</h2>' +
            '<p class="subtitle">Update your account password below</p>' +
            '<form id="changePasswordForm">' +
                '<div id="passwordError" class="alert alert-danger" style="display:none;"></div>' +
                '<div id="passwordSuccess" class="alert alert-success" style="display:none;"></div>' +
                '<div class="form-group"><label for="currentPassword">Current Password</label>' +
                '<input type="password" id="currentPassword" name="currentPassword" placeholder="Enter your current password" required></div>' +
                '<div class="form-group"><label for="newPassword">New Password</label>' +
                '<input type="password" id="newPassword" name="newPassword" placeholder="Enter your new password" minlength="8" required></div>' +
                '<div class="form-group"><label for="confirmPassword">Confirm New Password</label>' +
                '<input type="password" id="confirmPassword" name="confirmPassword" placeholder="Re-enter your new password" minlength="8" required></div>' +
                '<button type="submit" class="pwd-btn">Confirm</button>' +
                '<a href="profile.html" class="back-link">Back to Profile</a>' +
            '</form>' +
        '</div>'
    );

    handleChangePassword();
}


// =============================================================================
// ADMIN SIGNUP PAGE (pages/adminsignup.html)
// =============================================================================

function buildAdminSignupPage() {
    var $banner = $('.banner-content');
    $banner.append(
        '<div class="login-card">' +
            '<h2>Welcome Back</h2>' +
            '<p class="subtitle">Technician</p>' +
            '<form class="login-form">' +
                '<div class="form-group"><label for="email">Email Address</label>' +
                '<input type="email" id="email" name="email" placeholder="Enter your DLSU email" required></div>' +
                '<div class="form-group"><label for="password">Password</label>' +
                '<input type="password" id="password" name="password" placeholder="Enter your password" required></div>' +
                '<div class="form-options">' +
                    '<label class="remember-me"><input type="checkbox" name="remember" id="remember"><span>Remember me</span></label>' +
                    '<a href="#" class="forgot-password">Forgot password?</a>' +
                '</div>' +
                '<button type="submit" class="login-btn">Sign In</button>' +
            '</form>' +
            '<div class="divider"><span>or continue with</span></div>' +
            '<p class="register-link">Don\'t have an account? <a href="register.html">Sign up</a></p>' +
        '</div>'
    );

    // Technician login with real authentication
    $('.login-form').on('submit', function(e) {
        e.preventDefault();
        var email = $('#email').val().trim();
        var password = $('#password').val();
        if (!email || !password) { alert("Please fill in all fields."); return; }

        var account = authenticateUser(email, password);
        if (!account || account.accountType !== 'technician') {
            alert("Invalid technician credentials.");
            $('#password').val('').focus();
            return;
        }

        var sessionUser = {
            firstName: account.firstName,
            lastName: account.lastName,
            email: account.email,
            studentId: account.studentId,
            college: account.college,
            accountType: account.accountType,
            bio: account.bio
        };
        localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
        seedUserReservations(account.email);
        window.location.href = 'dashboard.html';
    });
}


// =============================================================================
// PAGINATION (shared across pages)
// =============================================================================

function initPagination() {
    if ($('.pagination').length === 0) return;

    var itemsPerPage = 5;
    var currentPage = 1;

    function showPage(page) {
        currentPage = page;
        var $items = $('.reservation-card:visible, .user-card:visible');
        var totalPages = Math.ceil($items.length / itemsPerPage) || 1;

        var start = (page - 1) * itemsPerPage;
        $items.hide().slice(start, start + itemsPerPage).show();

        $('.page-num').removeClass('active').filter(function() {
            return parseInt($(this).text()) === page;
        }).addClass('active');

        $('.page-btn').first().prop('disabled', page === 1);
        $('.page-btn').last().prop('disabled', page >= totalPages);
        $('.page-info').text('Page ' + page + ' of ' + totalPages);
    }

    $('.page-btn').first().on('click', function() { showPage(currentPage - 1); });
    $('.page-btn').last().on('click', function() { showPage(currentPage + 1); });
    $('.pagination').on('click', '.page-num', function() {
        showPage(parseInt($(this).text()));
    });

    showPage(1);
    window.refreshPagination = function() { showPage(1); };
}


// =============================================================================
// GLOBAL SEARCH (shared across all pages)
// =============================================================================

function initGlobalSearch() {
    var $searchInput = $('.search-bar input');
    var path = window.location.pathname;

    $searchInput.on('keypress', function(e) {
        if (e.which !== 13) return;
        var searchTerm = $(this).val().trim().toLowerCase();
        if (!searchTerm) return;

        if (path.indexOf('cmpslots.html') > -1) {
            $('.lab-card').each(function() {
                var labName = $(this).find('h3').text().toLowerCase();
                var building = $(this).find('.building-tag').text().toLowerCase();
                $(this).toggle(labName.indexOf(searchTerm) > -1 || building.indexOf(searchTerm) > -1);
            });
        } else if (path.indexOf('users.html') > -1) {
            $('#userSearch').val(searchTerm).trigger('keyup');
        } else {
            var inPages = path.indexOf('/pages/') > -1;
            var target = inPages ? 'cmpslots.html' : 'pages/cmpslots.html';
            window.location.href = target + '?search=' + encodeURIComponent(searchTerm);
        }
    });

    var urlSearch = new URLSearchParams(window.location.search).get('search');
    if (urlSearch && path.indexOf('cmpslots.html') > -1) {
        $searchInput.val(urlSearch).trigger($.Event('keypress', { which: 13 }));
    }
}


// =============================================================================
// PAGE ROUTER
// =============================================================================

function init() {
    console.log("Initializing OpenLab...");

    // Initialize accounts from SAMPLE_USERS on first run
    initializeAccounts();

    // Global: Auth guard
    authGuard();

    // Detect current page
    var path = window.location.pathname;
    var activePage = "index";
    if (path.indexOf("login.html") > -1) activePage = "login";
    else if (path.indexOf("register.html") > -1) activePage = "register";
    else if (path.indexOf("dashboard.html") > -1) activePage = "dashboard";
    else if (path.indexOf("cmpslots.html") > -1) activePage = "cmpslots";
    else if (path.indexOf("reserve.html") > -1) activePage = "reserve";
    else if (path.indexOf("reservations.html") > -1) activePage = "reservations";
    else if (path.indexOf("profile.html") > -1 && path.indexOf("public") === -1) activePage = "profile";
    else if (path.indexOf("public-profile.html") > -1) activePage = "public-profile";
    else if (path.indexOf("users.html") > -1) activePage = "users";
    else if (path.indexOf("walkin.html") > -1) activePage = "walkin";
    else if (path.indexOf("changepassword.html") > -1) activePage = "changepassword";
    else if (path.indexOf("adminsignup.html") > -1) activePage = "adminsignup";

    // Build navbar
    buildNavbar(activePage);

    // Page-specific builders
    if (activePage === "index") {
        buildIndexPage();
    } else if (activePage === "login") {
        buildLoginPage();
    } else if (activePage === "register") {
        buildRegisterPage();
    } else if (activePage === "dashboard") {
        buildDashboard();
    } else if (activePage === "cmpslots") {
        buildCmpSlots();
    } else if (activePage === "reserve") {
        buildReservePage();
    } else if (activePage === "reservations") {
        buildReservationsPage();
    } else if (activePage === "profile") {
        buildProfilePage();
    } else if (activePage === "users") {
        buildUsersPage();
    } else if (activePage === "public-profile") {
        buildPublicProfilePage();
    } else if (activePage === "walkin") {
        buildWalkinPage();
    } else if (activePage === "changepassword") {
        buildChangePasswordPage();
    } else if (activePage === "adminsignup") {
        buildAdminSignupPage();
    }

    // Global: search & pagination (after content is built)
    initGlobalSearch();
    if ($('.pagination').length > 0) {
        initPagination();
    }
}

$(document).ready(init);
