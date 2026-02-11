/**
 * OpenLab Computer Reservation System
 * @file app.js
 * @description Main application logic for the OpenLab reservation system.
 *              Include in all pages: index.html uses "js/app.js", pages/*.html use "../js/app.js"
 */


// =============================================================================
// AUTH & SESSION
// =============================================================================

/**
 * Checks whether a user is currently logged in.
 * Looks for 'openlab_user' key in localStorage.
 *
 * @returns {boolean} true if user session exists, false otherwise
 */
function isLoggedIn() {
    return localStorage.getItem('openlab_user') !== null;
}

/**
 * Retrieves the currently logged-in user's data from localStorage.
 *
 * @returns {Object|null} User object {firstName, lastName, email, studentId, college} or null if not logged in
 */
function getCurrentUser() {
    var userStr = localStorage.getItem('openlab_user');
    if (userStr) {
        return JSON.parse(userStr);
    }
    return null;
}

/**
 * Logs out the current user by clearing session data from localStorage
 * and redirecting to the homepage.
 * - Removes 'openlab_user' from localStorage.
 * - Redirects to index.html (use "../index.html" from /pages/, or "index.html" from root).
 * - Called by the .signout-btn anchor in dashboard.html via onclick="logout()".
 *   The anchor's default href (../index.html) acts as a fallback if JS fails.
 *
 * @returns {void}
 */
function logout() {
    localStorage.removeItem('openlab_user');

    // Check if we are inside the 'pages' folder
    var path = window.location.pathname;
    if (path.indexOf("/pages/") > -1) {
        window.location.href = "../index.html";
    } else {
        window.location.href = "index.html";
    }
}

/**
 * Auth guard that runs on every page load.
 * Checks if the current page is protected (dashboard, profile, reservations, users).
 * If protected and user is NOT logged in, redirects to login.html.
 * If user is on login/register while already logged in, redirects to dashboard.html.
 *
 * @returns {void}
 */
function authGuard() {
    var path = window.location.pathname;
    var loggedIn = isLoggedIn();

    // List of pages that require login
    var isProtected = (path.indexOf("dashboard.html") > -1) ||
        (path.indexOf("reservations.html") > -1) ||
        (path.indexOf("reserve.html") > -1) ||
        (path.indexOf("profile.html") > -1);

    // List of pages you shouldn't see if already logged in
    var isAuthPage = (path.indexOf("login.html") > -1) ||
        (path.indexOf("register.html") > -1);

    if (isProtected && !loggedIn) {
        // If page is protected and user is NOT logged in, send to login
        // Handle path correctly if we are in root or pages folder
        if (path.indexOf("/pages/") > -1) {
            window.location.href = "login.html";
        } else {
            window.location.href = "pages/login.html";
        }
    } else if (isAuthPage && loggedIn) {
        // If user is already logged in, send them to dashboard
        window.location.href = "dashboard.html";
    }
}


// =============================================================================
// NAVBAR
// =============================================================================

/**
 * Dynamically updates the navigation bar based on authentication state.
 * - Logged in: replaces "Login"/"Register" link with "Profile", adds a "Logout" link.
 * - Not logged in: replaces "Profile" link with "Login".
 * Handles href path differences between root and /pages/ directory.
 *
 * @returns {void}
 */
function updateNavbar() {
    var user = getCurrentUser();
    var path = window.location.pathname;
    var inPages = path.indexOf("/pages/") > -1;

    // Determine correct paths for links
    var profilePath = inPages ? "profile.html" : "pages/profile.html";
    var loginPath = inPages ? "login.html" : "pages/login.html";

    if (user) {
        // User IS logged in
        // 1. Remove Login/Register links
        $('.nav-links a[href*="login.html"]').remove();
        $('.nav-links a[href*="register.html"]').remove();

        // 2. Add Profile Link if missing
        if ($('.nav-links a:contains("Profile")').length === 0) {
            $('<a href="' + profilePath + '">Profile</a>').insertBefore('.search-bar');
        }

        // 3. Add Logout Link if missing
        if ($('#nav-logout').length === 0) {
            $('<a href="#" id="nav-logout">Logout</a>').insertBefore('.search-bar');

            $('#nav-logout').click(function(e) {
                e.preventDefault();
                logout();
            });
        }
    } else {
        // User is NOT logged in
        $('.nav-links a:contains("Profile")').remove();
        $('#nav-logout').remove();

        // Ensure login link exists
        if ($('.nav-links a[href*="login.html"]').length === 0) {
            $('<a href="' + loginPath + '">Login</a>').insertBefore('.search-bar');
        }
    }
}


// =============================================================================
// LOGIN PAGE (pages/login.html)
// =============================================================================

/**
 * Initializes the login page.
 * - Attaches a submit handler to .login-form that prevents default submission.
 * - Validates that email and password fields are non-empty.
 * - On success: stores user object in localStorage, redirects to dashboard.html.
 * - On failure: displays an error message.
 *
 * @todo Replace localStorage mock with POST /api/login API call
 * @returns {void}
 */
function initLoginPage() {
    $('.login-form').submit(function(e) {
        e.preventDefault();

        var email = $('#email').val();
        var password = $('#password').val();

        if (email && password) {
            // Mock Login
            var mockUser = {
                firstName: "Benedict",
                lastName: "Santos",
                email: email,
                studentId: "12467676",
                college: "CCS"
            };
            localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
            window.location.href = "dashboard.html";
        } else {
            alert("Please fill in all fields.");
        }
    });
}

/**
 * Handles the "Forgot password?" link (.forgot-password) on the login page.
 * - Attaches a click listener to .forgot-password, prevents default navigation.
 * - Shows a modal or inline form prompting the user to enter their DLSU email.
 * - Validates email format.
 * - On submit: displays a confirmation message that a password reset link has been sent.
 *
 * @todo Replace with POST /api/auth/forgot-password API call
 * @returns {void}
 */
function handleForgotPassword() {
    $('.forgot-password').click(function(e) {
        e.preventDefault();
        var email = prompt("Enter your DLSU email:");
        if (email) {
            alert("Reset link sent to " + email);
        }
    });
}


// =============================================================================
// REGISTER PAGE (pages/register.html)
// =============================================================================

/**
 * Initializes the registration page.
 * - Attaches a submit handler to .register-form that prevents default submission.
 * - Validates all fields:
 *     - password === confirmPassword
 *     - password.length >= 8
 *     - studentId matches /^[0-9]{8}$/
 *     - all required fields are filled
 * - On success: stores user in localStorage, redirects to dashboard.html.
 * - On failure: displays specific validation error.
 *
 * @todo Replace localStorage mock with POST /api/register API call
 * @todo Fix register.html line 117 — unclosed div for password form-group
 * @returns {void}
 */
function initRegisterPage() {
    $('.register-form').submit(function(e) {
        e.preventDefault();

        var pass = $('#password').val();
        var confirmPass = $('#confirmPassword').val();
        var studentId = $('#studentId').val();

        // 1. Validate Password Match
        if (pass !== confirmPass) {
            alert("Passwords do not match.");
            return;
        }

        // 2. Validate Password Length
        if (pass.length < 8) {
            alert("Password must be at least 8 characters.");
            return;
        }

        // 3. Validate ID (Simple regex check)
        var idRegex = /^[0-9]{8}$/;
        if (!idRegex.test(studentId)) {
            alert("Student ID must be exactly 8 digits.");
            return;
        }

        // Save User
        var newUser = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            studentId: studentId,
            email: $('#email').val(),
            college: $('#college').val()
        };

        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        alert("Registration successful!");
        window.location.href = "dashboard.html";
    });
}


// =============================================================================
// RESERVE PAGE (pages/reserve.html)
// =============================================================================

/**
 * Reads the lab query parameter from the URL (e.g. ?lab=GK101A)
 * and updates the page header and booking summary with the correct
 * lab name and building name.
 *
 * Lab mapping:
 *   AG1010  -> Andrew Building
 *   LS313   -> La Salle Hall
 *   GK101A  -> Gokongwei Building
 *   GK101B  -> Gokongwei Building
 *   GK304   -> Gokongwei Building
 *
 * @todo Currently hardcoded to GK101A — this function fixes that
 * @returns {void}
 */
function loadLabFromURL() {
    var urlParams = new URLSearchParams(window.location.search);
    var labCode = urlParams.get('lab');
    if (!labCode) labCode = "GK101A"; // Default

    // Dictionary for building names
    var buildings = {
        'AG1010': 'Andrew Building',
        'LS313': 'La Salle Hall',
        'GK101A': 'Gokongwei Building',
        'GK101B': 'Gokongwei Building',
        'GK304': 'Gokongwei Building'
    };
    var bldg = buildings[labCode] || "Gokongwei Building";

    // Update Text
    $('.panel-header h3').text(labCode + " - " + bldg);

    // Update Summary Lab/Building
    $('.summary-item').each(function() {
        var label = $(this).find('.label').text();
        if (label === 'Lab') $(this).find('.value').text(labCode);
        if (label === 'Building') $(this).find('.value').text(bldg);
    });
}

/**
 * Handles seat selection on the seat map grid.
 * - Adds click listeners to .seat.available elements only (not .occupied or .reserved).
 * - On click: toggles the seat to 'selected', reverts previously selected seat to 'available'.
 * - Updates #summarySeat in the Booking Summary panel with the data-seat value.
 * - Enables #confirmBtn and changes its text to "Confirm Reservation".
 *
 * @returns {void}
 */
function initSeatSelection() {
    $('.seat-grid').on('click', '.seat.available', function() {
        // Remove 'selected' from others
        $('.seat.selected').removeClass('selected').addClass('available');

        // Add 'selected' to clicked
        $(this).removeClass('available').addClass('selected');

        // Update Summary
        var seatId = $(this).attr('data-seat');
        $('#summarySeat').text(seatId);

        // Enable Button
        $('#confirmBtn').prop('disabled', false).text("Confirm Reservation");
    });
}

/**
 * Attaches change listeners to #reserveDate and #timeSlot inputs.
 * - When date changes: formats the date and updates #summaryDate text.
 * - When time changes: updates #summaryTime with the selected option text.
 *
 * @returns {void}
 */
function initDateTimeSync() {
    $('#reserveDate').change(function() {
        $('#summaryDate').text($(this).val());
    });

    $('#timeSlot').change(function() {
        var text = $(this).find('option:selected').text();
        $('#summaryTime').text(text);
    });
}

/**
 * Handles the confirm reservation button (#confirmBtn) click.
 * - Checks isLoggedIn(); if not, redirects to login.html.
 * - Validates a seat has been selected.
 * - On success: redirects to reservations.html.
 *
 * @todo Replace with POST /api/reservations API call (send lab, seat, date, time, userId)
 * @returns {void}
 */
function handleConfirmReservation() {
    if (!isLoggedIn()) {
        alert("You must login first.");
        window.location.href = "login.html";
        return;
    }

    var seat = $('.seat.selected').attr('data-seat');
    if (!seat) {
        alert("Please select a seat.");
        return;
    }

    alert("Reservation confirmed for " + seat);
    window.location.href = "reservations.html";
}

/**
 * Populates the "Reserving as" user info card with data from getCurrentUser().
 * Updates .user-name, .user-id, .user-college, and .user-avatar elements.
 *
 * @returns {void}
 */
function populateUserCard() {
    var user = getCurrentUser();
    if (user) {
        $('.user-name').text(user.firstName + " " + user.lastName);
        $('.user-id').text("ID: " + user.studentId);
        $('.user-college').text(user.college);

        var initials = user.firstName.charAt(0) + user.lastName.charAt(0);
        $('.user-avatar').text(initials);
    }
}

/**
 * Initializes the anonymous reservation toggle on the reserve page.
 * - Attaches a change listener to #anonymousToggle checkbox.
 * - When checked: the reservation will hide the user's identity from other users
 *   viewing the seat map; reserved seats display "Anonymous" instead of the user's name.
 * - When unchecked: the reservation displays the user's name publicly on the seat.
 * - Updates the booking summary to reflect the current anonymous status.
 *
 * @todo Persist anonymous flag when sending POST /api/reservations
 * @returns {void}
 */
function initAnonymousToggle() {
    $('#anonymousToggle').change(function() {
        var isAnon = $(this).is(':checked');

        // Find or create a status element in the booking summary
        var $summaryStatus = $('#summaryAnonStatus');

        if ($summaryStatus.length === 0) {
            // Create it if it doesn't exist (append to summary details)
            $('.summary-details').append(
                '<div class="summary-item" id="summaryAnonStatus">' +
                '<span class="label">Mode</span>' +
                '<span class="value"></span></div>'
            );
            $summaryStatus = $('#summaryAnonStatus');
        }

        // Update the text
        if (isAnon) {
            $summaryStatus.find('.value').text("Anonymous");
        } else {
            $summaryStatus.find('.value').text("Public");
        }
    });
}

/**
 * Displays reservee information on occupied and reserved seats in the seat map.
 * - Adds hover/click listeners to .seat.occupied and .seat.reserved elements.
 * - On hover: shows a tooltip or popover with the reservee's name and student ID.
 * - If the reservation was made anonymously, displays "Anonymous" instead.
 * - Clicking the reservee's name navigates to public-profile.html?id=STUDENTID.
 *
 * @todo Requires GET /api/reservations/seat/:seatId to fetch reservee data
 * @returns {void}
 */
function showSeatReservee() {
    $('.seat.occupied, .seat.reserved').hover(function() {
        var status = $(this).hasClass('occupied') ? "Occupied" : "Reserved";
        $(this).attr('title', status + " by another student");
    });
}

/**
 * Periodically polls for updated seat availability data on the reserve page.
 * - Uses setInterval to fetch the latest seat statuses every 30 seconds.
 * - Updates each .seat element's class (available, occupied, reserved) based on the response.
 * - Updates the availability count displayed in .availability-badge.
 * - Clears the interval when the user navigates away from the page.
 *
 * @todo Requires GET /api/labs/:labId/availability endpoint
 * @returns {void}
 */
function pollAvailability() {
    var intervalId = setInterval(function() {
        console.log("Polling for seat updates...");

        // Mock updating the badge count
        var count = Math.floor(Math.random() * 10) + 15;
        $('.availability-badge').text(count + " seats available");

    }, 30000);

    // Clears the interval when the user navigates away (cleanup)
    $(window).on('unload', function() {
        clearInterval(intervalId);
    });
}


// =============================================================================
// RESERVATIONS PAGE (pages/reservations.html)
// =============================================================================

/**
 * Initializes filter tab buttons on the reservations page.
 * - Adds click listeners to .tab-btn elements.
 * - Reads data-filter attribute (all | upcoming | completed | cancelled).
 * - Shows/hides .reservation-card elements by matching their data-status attribute.
 * - Toggles .active class on the clicked tab.
 *
 * @returns {void}
 */
function initReservationFilters() {
    // This whole block filters the reservation cards based on the data-filter attribute of the clicked tab button
     $('.tab-btn').on('click', function () {
        const filter = $(this).data('filter');
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');

        $('.reservation-card').each(function () {
            const status = $(this).data('status');
            if (filter === 'all' || status === filter) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // Trigger the active tab on page load
    $('.tab-btn.active').trigger('click');
}

$(document).ready(function() {
    initReservationFilters();
});


/**
 * Handles the cancel button (.action-btn.cancel) on reservation cards.
 * - Shows a confirm() dialog before proceeding.
 * - On confirm: updates card status badge to "Cancelled" and swaps action buttons.
 *
 * @todo Replace with PATCH /api/reservations/:id API call
 * @todo Fix reservations.html — missing closing </div> for .reservations-list before pagination
 * @returns {void}
 */
function handleCancelReservation() {
    $('.action-btn.cancel').on('click', function () {
        const card = $(this).closest('.reservation-card');
        if (confirm('Are you sure you want to cancel this reservation?')) {
            // Update the status
            card.data('status', 'cancelled');

            // Update the status badge text and classes
            card.find('.status-badge')
                .text('Cancelled')
                .removeClass('upcoming completed')
                .addClass('cancelled');

            // Toggle buttons with fade effects
            $(this).fadeOut('fast');
            card.find('.action-btn.rebook').fadeIn('fast');

            // Ensure it shows/hides correctly depending on active filter
            const activeFilter = $('.tab-btn.active').data('filter');
            if (activeFilter !== 'all' && activeFilter !== 'cancelled') {
                card.fadeOut('fast');
            }
        }
    });
}

/**
 * Handles the "Book Again" button (.action-btn.rebook) on completed/cancelled cards.
 * Redirects to reserve.html?lab=LABNAME using the lab name from the card content.
 *
 * @returns {void}
 */
function handleRebook() {
      $('.action-btn.rebook').on('click', function () {
        const card = $(this).closest('.reservation-card');
        const lab = card.find('.reservation-main h3').text().split(' - ')[0]; // Extract lab code before " - Seat"
        const resId = card.data('id') || ''; // Optional reservation ID
        window.location.href = `reserve.html?lab=${encodeURIComponent(lab)}&edit=${resId}`;
    });
}

/**
 * Handles the edit button (.action-btn.edit) on upcoming reservation cards.
 * - Reads the reservation data (lab, seat, date, time) from the clicked card's content.
 * - Redirects to reserve.html?lab=LABNAME&edit=RESERVATION_ID with pre-filled data,
 *   allowing the user to change the seat, date, or time slot.
 * - Lab technicians are able to edit any reservation; students can only edit their own.
 *
 * @todo Replace with PUT /api/reservations/:id API call
 * @returns {void}
 */
function handleEditReservation() {
      $('.action-btn.edit').on('click', function () {
        const card = $(this).closest('.reservation-card');
        const lab = card.find('.reservation-main h3').text().split(' - ')[0]; // Extract lab code
        const resId = card.data('id') || ''; // Optional reservation ID
        window.location.href = `reserve.html?lab=${encodeURIComponent(lab)}&edit=${resId}`;
    });
}



// =============================================================================
// AVAILABLE SLOTS PAGE (pages/cmpslots.html)
// =============================================================================

/**
 * Initializes the building filter on the available slots page.
 * - On .filter-btn click: reads #buildingFilter value.
 * - Maps filter values to building names:
 *     andrew    -> "Andrew Building"
 *     lasalle   -> "La Salle Hall"
 *     gokongwei -> "Gokongwei Building"
 *     velasco   -> "Velasco Building"
 * - Shows/hides .lab-card elements by matching .building-tag text.
 * - If filter is empty, shows all cards.
 *
 * @todo Date/time filters need backend GET /api/labs/availability to work with real data
 * @todo Fix inconsistent HTML tags — first 4 lab cards use <span>, last uses <article>
 * @returns {void}
 */
function initLabFilters() {

    /* This defines the buildingMap object that maps 
     the filter values to the corresponding building names */
    const buildingMap = {
        andrew: "andrew building",
        lasalle: "la salle hall",
        gokongwei: "gokongwei building",
        velasco: "velasco building"
    };

    // When clicked, it will filter the lab cards based on the selected building.
    $('.filter-btn').on('click', function () {

        // Get the selected value from the Building dropdown
        const selected = $('#buildingFilter').val();

        /*
          Loop through every lab card on the page.
          Each card will be checked if it belongs to the
          selected building.
        */
        $('.lab-card').each(function () {

            /*
              Get the building name written inside the card.
              Convert to lowercase and remove extra spaces
              so it exactly matches our buildingMap values.
            */
            const cardBuilding = $(this)
                .find('.building-tag')
                .text()
                .trim() 
                .toLowerCase();

            /*
              If "All Buildings" is selected (empty value),
              simply show all lab cards.
            */
            if (!selected) {
                $(this).show();
                return;
            }

            // Get the correct building name from the map
            const target = buildingMap[selected];

            /*
              Compare the card's building with the target building.
              If they match, show the card.
              Otherwise, hide the card.
            */
            if (cardBuilding === target) {
                $(this).show();
            } else {
                $(this).hide();
            }

        });
    });
}

$(document).ready(function() {
    console.log("Document ready - calling initLabFilters");
    initLabFilters();
});

// =============================================================================
// PROFILE PAGE (pages/profile.html)
// =============================================================================

/**
 * Populates the profile page with data from getCurrentUser().
 * Fills in: header name, email, avatar initials, college badge,
 * and all form fields (firstName, lastName, studentId, email, college).
 *
 * @returns {void}
 */
function populateProfile() {
    const user = getCurrentUser();
    if (!user) {
        return;
    }

    // Fill the values in the profile header and form fields
    $('#firstName').val(user.firstName);
    $('#lastName').val(user.lastName);
    $('#studentId').val(user.studentId);
    $('#email').val(user.email);
    $('#college').val(user.college);
    $('.profile-avatar').text(user.firstName[0] + user.lastName[0]);
}

/**
 * Initializes the edit toggle for the Personal Information form.
 * - Click #editPersonalBtn: enables all form inputs, shows Save/Cancel buttons (#personalActions),
 *   hides the Edit button.
 * - Click Cancel: disables inputs, restores original values from localStorage, shows Edit button.
 * - Click Save: validates input, updates localStorage, disables inputs, shows Edit button.
 *
 * @todo Replace localStorage update with PUT /api/users/:id API call
 * @returns {void}
 */
function initProfileEdit() {}

/**
 * Handles the Delete Account button in the Danger Zone.
 * - Shows a confirm() dialog warning that deletion is permanent.
 * - On confirm: clears localStorage, redirects to index.html.
 *
 * @todo Replace with DELETE /api/users/:id API call
 * @todo Implement Change Password modal/page
 * @todo Implement Email Notifications toggle persistence
 * @returns {void}
 */
function handleDeleteAccount() {}

/**
 * Handles the Change Password button (.setting-btn) in Account Settings.
 * - Shows a modal or inline form with fields: current password, new password, confirm new password.
 * - Validates that new password length >= 8 and new password === confirm new password.
 * - On success: updates the password in localStorage, displays a success message, closes the form.
 * - On cancel: closes the form without changes.
 *
 * @todo Replace with PUT /api/users/:id/password API call
 * @returns {void}
 */
function handleChangePassword() {}

/**
 * Handles the Change Photo button (.change-avatar-btn) on the profile page.
 * - Opens a file input dialog for image selection.
 * - Validates file type (jpg, png, gif) and file size (max 2MB).
 * - On success: reads the file as a data URL, updates the .avatar element to show
 *   the new image, and stores the image data in localStorage.
 *
 * @todo Replace with POST /api/users/:id/avatar multipart upload API call
 * @returns {void}
 */
function handleChangeAvatar() {}

/**
 * Handles the Email Notifications toggle in Account Settings.
 * - Attaches a change listener to the .toggle input[type="checkbox"].
 * - On toggle: updates the user's notification preference in localStorage.
 * - Displays a brief confirmation message indicating the new state.
 *
 * @todo Replace with PUT /api/users/:id/settings API call
 * @returns {void}
 */
function handleNotificationToggle() {}


// =============================================================================
// USERS PAGE (pages/users.html)
// =============================================================================

/**
 * Initializes the user search functionality.
 * - On .search-btn click: reads #userSearch and #collegeFilter values.
 * - Filters .user-card elements by matching name (h3) or student ID (.user-id)
 *   against the search term, and .college-badge against the college filter.
 * - Shows/hides cards based on match.
 *
 * @todo "View Profile" links currently point to "#" — should link to profile.html?id=STUDENTID
 * @todo Fix duplicate user card in users.html (Ana Garcia Lopez appears twice, lines 102-138)
 * @todo Pagination needs backend data
 * @returns {void}
 */
function initUserSearch() {}


// =============================================================================
// PUBLIC PROFILE PAGE (pages/public-profile.html)
// =============================================================================

/**
 * Initializes the public profile page for viewing another user's profile.
 * - Reads the user ID from the URL query parameter (e.g., ?id=12340001).
 * - Fetches and displays the user's public data:
 *     - Profile picture (or initials), full name, student ID, college, and description.
 *     - A list of the user's current non-anonymous reservations.
 * - This page is read-only; visitors cannot edit another user's profile.
 * - If no valid user ID is provided, displays a "User not found" message.
 *
 * @todo Replace hardcoded sample data with GET /api/users/:id/public API call
 * @returns {void}
 */
function initPublicProfilePage() {}


// =============================================================================
// DASHBOARD PAGE (pages/dashboard.html)
// =============================================================================

/**
 * Initializes the dashboard page.
 * - Replaces the hardcoded "Welcome back, Juan!" with getCurrentUser().firstName.
 *
 * @todo All stats, upcoming reservations, recent activity, and favorite labs
 *       are hardcoded sample data — need API calls to populate dynamically
 * @returns {void}
 */
function initDashboard() {
    const user = getCurrentUser();
    if (user) { $('.welcome-msg').text(`Welcome back, ${user.firstName}!`);
}
}


// =============================================================================
// LAB TECHNICIAN FEATURES (pages/walkin.html)
// =============================================================================

/**
 * Initializes the walk-in reservation page for lab technicians.
 * - Attaches a submit handler to .walkin-form that prevents default submission.
 * - Lab technicians enter the walk-in student's ID, select the lab, seat, and time slot.
 * - Validates that the student ID is a valid 8-digit number and the seat is available.
 * - On success: creates a reservation under the walk-in student's account,
 *   marks the seat as reserved, and displays a confirmation message.
 *
 * @todo Requires technician authentication check (role === 'technician')
 * @todo Replace with POST /api/reservations/walkin API call
 * @returns {void}
 */
function initWalkInReservation() {

}

/**
 * Handles the removal of a no-show reservation by a lab technician.
 * - Attaches click listeners to .remove-noshow-btn elements on the walk-in page.
 * - Only enabled when the current time is within 10 minutes after the reservation start time.
 * - Shows a confirm() dialog warning that the entire reservation will be cancelled.
 * - On confirm: cancels the reservation, frees the seat, and updates the UI.
 *
 * @todo Requires technician authentication check (role === 'technician')
 * @todo Replace with DELETE /api/reservations/:id/noshow API call
 * @returns {void}
 */
function handleRemoveNoShow() {}


// =============================================================================
// PAGINATION (shared across pages)
// =============================================================================

/**
 * Initializes pagination controls on pages that have a .pagination element.
 * - Used on reservations.html and users.html.
 * - Attaches click listeners to .page-btn (Previous/Next) and .page-num buttons.
 * - Calculates which content items to show/hide based on current page and items per page.
 * - Updates the .active state on .page-num buttons.
 * - Disables the Previous button on the first page and Next button on the last page.
 * - Updates .page-info text (e.g., "Page 1 of 3").
 *
 * @todo Replace client-side pagination with server-side pagination using query params (?page=1&limit=10)
 * @returns {void}
 */
function initPagination() {}


// =============================================================================
// GLOBAL SEARCH (shared across all pages)
// =============================================================================

/**
 * Initializes the global search bar found in the navbar across all pages.
 * - Attaches a keyup listener to .search-bar input; triggers search on Enter key.
 * - Search behavior depends on the current page context:
 *     cmpslots.html -> filters .lab-card elements by lab name or building name
 *     users.html    -> filters .user-card elements by name or student ID
 *     other pages   -> redirects to cmpslots.html?search=TERM
 *
 * @todo Replace with GET /api/search?q=TERM API call for server-side search
 * @returns {void}
 */
function initGlobalSearch() {}


// =============================================================================
// PAGE ROUTER
// =============================================================================

/**
 * Main entry point. Runs on DOMContentLoaded.
 * - Calls authGuard() to check authentication.
 * - Calls updateNavbar() to set correct nav links.
 * - Calls initGlobalSearch() on all pages.
 * - Calls initPagination() on pages with .pagination elements.
 * - Detects current page from window.location.pathname and calls
 *   the appropriate init function:
 *     login.html          -> initLoginPage(), handleForgotPassword()
 *     register.html       -> initRegisterPage()
 *     reserve.html        -> loadLabFromURL(), initSeatSelection(), initDateTimeSync(),
 *                            handleConfirmReservation(), populateUserCard(),
 *                            initAnonymousToggle(), showSeatReservee(), pollAvailability()
 *     reservations.html   -> initReservationFilters(), handleCancelReservation(),
 *                            handleRebook(), handleEditReservation()
 *     cmpslots.html       -> initLabFilters()
 *     profile.html        -> populateProfile(), initProfileEdit(), handleDeleteAccount(),
 *                            handleChangePassword(), handleChangeAvatar(),
 *                            handleNotificationToggle()
 *     users.html          -> initUserSearch()
 *     public-profile.html -> initPublicProfilePage()
 *     dashboard.html      -> initDashboard()
 *     walkin.html         -> initWalkInReservation(), handleRemoveNoShow()
 *
 * @returns {void}
 */
function init() {
    console.log("Initializing OpenLab...");

    // =========================================================================
    // 1. GLOBAL CALLS (Run on every page)
    // =========================================================================

    // Check if user is allowed to be on this page
    authGuard();

    // Update the top navigation bar (Login vs Profile)
    updateNavbar();

    // Initialize Global Search (if it exists in your partner's code)
    if (typeof initGlobalSearch === 'function') {
        initGlobalSearch();
    }

    // Initialize Pagination (if it exists in your partner's code)
    if ($('.pagination').length > 0 && typeof initPagination === 'function') {
        initPagination();
    }

    // =========================================================================
    // 2. PAGE SPECIFIC CALLS
    // =========================================================================

    var path = window.location.pathname;

    // --- LOGIN PAGE ----------------------------------------------------------
    if (path.indexOf("login.html") > -1) {
        initLoginPage();
        handleForgotPassword();
    }

    // --- REGISTER PAGE -------------------------------------------------------
    else if (path.indexOf("register.html") > -1) {
        initRegisterPage();
    }

    // --- RESERVE PAGE --------------------------------------------------------
    else if (path.indexOf("reserve.html") > -1) {
        // Load lab name from URL
        loadLabFromURL();

        // Enable clicking on seats
        initSeatSelection();

        // Sync date/time inputs with the summary box
        initDateTimeSync();

        // Populate the "Reserving as..." card
        populateUserCard();

        // Listen for the "Anonymous" checkbox
        initAnonymousToggle();

        // Add tooltips to occupied seats
        showSeatReservee();

        // Start checking for seat updates
        pollAvailability();

        // Bind the Confirm button click
        $('#confirmBtn').click(function() {
            handleConfirmReservation();
        });
    }

    // --- Chris's Functions (Placeholders) --------------------------------------

    else if (path.indexOf("reservations.html") > -1) {
        // initReservationFilters();
        // handleCancelReservation();
        // handleRebook();
        // handleEditReservation();
    }
    else if (path.indexOf("cmpslots.html") > -1) {
        // initLabFilters();
    }
    else if (path.indexOf("profile.html") > -1) {
        // populateProfile();
        // initProfileEdit();
        // handleDeleteAccount();
        // handleChangePassword();
        // handleChangeAvatar();
        // handleNotificationToggle();
    }
    else if (path.indexOf("users.html") > -1) {
        // initUserSearch();
    }
    else if (path.indexOf("public-profile.html") > -1) {
        // initPublicProfilePage();
    }
    else if (path.indexOf("dashboard.html") > -1) {
        // initDashboard();
    }
    else if (path.indexOf("walkin.html") > -1) {
        // initWalkInReservation();
        // handleRemoveNoShow();
    }
}
