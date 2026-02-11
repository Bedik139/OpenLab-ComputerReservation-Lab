/**
 * OpenLab Computer Reservation System
 * @file app.js
 * @description Main application logic for the OpenLab reservation system.
 *              Include in all pages: index.html uses "js/app.js", pages/*.html use "../js/app.js"
 */

var USER_KEY = 'openlab_user'; 

/**
 * Checks whether a user is currently logged in.
 * Looks for 'openlab_user' key in localStorage.
 *
 * @returns {boolean} true if user session exists, false otherwise
 */



    // =============================================================================
    // AUTH & SESSION
    // =============================================================================

    function isLoggedIn() {
        return localStorage.getItem(USER_KEY) !== null;
    }

    /**
     * Retrieves the currently logged-in user's data from localStorage.
     *
     * @returns {Object|null} User object {firstName, lastName, email, studentId, college} or null if not logged in
     */
    function getCurrentUser() {
        var userStr = localStorage.getItem(USER_KEY);
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
        localStorage.removeItem(USER_KEY);

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
    // When a filter tab (All, Upcoming, Completed, Cancelled) is clicked
    $('.tab-btn').on('click', function () {
        // Get the filter value from the clicked button 
        const filter = $(this).data('filter');

        // Remove the active class from all tabs, then add it only to the one that was clicked
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');

        // Loop through every reservation card
        $('.reservation-card').each(function () {
            // Get the status of the current card 
            const status = $(this).data('status');

            if (filter === 'all' || status === filter) {
                $(this).fadeIn(300);
            } else {
                // Otherwise, hide it with a fade-out effect
                $(this).fadeOut(300);
            }
        });

        // Refresh pagination after filtering
        if (typeof window.refreshPagination === 'function') {
            window.refreshPagination();
        }
    });

    // Trigger the active tab on page load so the correct reservations show
    $('.tab-btn.active').trigger('click');
}


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
    // When the cancel button is clicked
    $('.action-btn.cancel').on('click', function () {
        // Get the reservation card this button belongs to
        const card = $(this).closest('.reservation-card');

        // Ask the user to confirm cancellation
        if (confirm('Are you sure you want to cancel this reservation?')) {
            // Update the card's status data attribute
            card.data('status', 'cancelled');

            // Change the status badge text 
            card.find('.status-badge')
                .text('Cancelled')
                .removeClass('upcoming completed')
                .addClass('cancelled');

            // Hide the cancel button since it's no longer needed
            $(this).fadeOut('fast');

            // If the current filter doesn't include cancelled items, hide the card from view
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
    // When the "Book Again" button is clicked
    $('.action-btn.rebook').on('click', function () {
        // Get the reservation card this button belongs to
        const card = $(this).closest('.reservation-card');

        // Extract the lab name from the card title
        const lab = card.find('.reservation-main h3')
                        .text()
                        .split(' - ')[0];

        // Get the reservation ID 
        const resId = card.data('id') || '';

        // Redirect to the reservation page 
        window.location.href = 
            `reserve.html?lab=${encodeURIComponent(lab)}&edit=${resId}`;
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
    // When the edit button is clicked
    $('.action-btn.edit').on('click', function () {
        // Get the reservation card this button belongs to
        const card = $(this).closest('.reservation-card');

        // Extract the lab name from the title
        const lab = card.find('.reservation-main h3')
                        .text()
                        .split(' - ')[0];

        // Get the reservation ID 
        const resId = card.data('id') || '';

        // Redirect to the reservation page
        window.location.href =
            `reserve.html?lab=${encodeURIComponent(lab)}&edit=${resId}`;
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

    // Map dropdown values to their actual building names
    const buildingMap = {
        andrew: "andrew building",
        lasalle: "la salle hall",
        gokongwei: "gokongwei building",
        velasco: "velasco building"
    };

    // When the "Apply Filters" button is clicked
    $('.filter-btn').on('click', function () {

        // Get the selected building from the dropdown
        const selected = $('#buildingFilter').val();

        // Loop through each lab card
        $('.lab-card').each(function () {

            // Get the building name shown on the card
            const cardBuilding = $(this)
                .find('.building-tag')
                .text()
                .trim()
                .toLowerCase();

            // If no building is selected, show everything
            if (!selected) {
                $(this).show();
                return;
            }

            // Get the matching building name from the map
            const target = buildingMap[selected];

            // Show the card if it matches, otherwise hide it
            if (cardBuilding === target) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
    }


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
    // Get the current user object 
    const user = getCurrentUser();

    // If no user is found, exit early
    if (!user) {
        return;
    }

    // Fill in the personal info form fields
    $('#firstName').val(user.firstName);
    $('#lastName').val(user.lastName);
    $('#studentId').val(user.studentId);
    $('#email').val(user.email);
    $('#college').val(user.college);

    // Set avatar initials using first letters of first and last name
    $('.avatar span').text(user.firstName[0] + user.lastName[0]);
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
    function initProfileEdit() {
    const $editBtn = $('#editPersonalBtn');
    const $form = $('#personalForm');
    const $inputs = $form.find('input, select');
    const $actions = $('#personalActions');
    const $cancelBtn = $actions.find('.cancel-btn');
    const $saveBtn = $actions.find('.save-btn');

    // Keep original values to restore on cancel
    let originalValues = {};

    // Edit button click
    $editBtn.on('click', function() {
        $inputs.prop('disabled', false); // Enable inputs
        $actions.removeClass('hidden');   // Show Save/Cancel buttons
        $editBtn.hide();                  // Hide Edit button

        // Save current values
        originalValues = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            studentId: $('#studentId').val(),
            email: $('#email').val(),
            college: $('#college').val()
        };
    });

    // Cancel button click
    $cancelBtn.on('click', function() {
        // Revert inputs to original values
        $('#firstName').val(originalValues.firstName);
        $('#lastName').val(originalValues.lastName);
        $('#studentId').val(originalValues.studentId);
        $('#email').val(originalValues.email);
        $('#college').val(originalValues.college);

        $inputs.prop('disabled', true);  // Disable inputs
        $actions.addClass('hidden');      // Hide Save/Cancel
        $editBtn.show();                  // Show Edit button
    });

    // Save button click
    $saveBtn.on('click', function(e) {
        e.preventDefault(); // Prevent form submission

        // Get trimmed input values
        const firstName = $('#firstName').val().trim();
        const lastName = $('#lastName').val().trim();
        const email = $('#email').val().trim();

        // Simple validation
        if (!firstName || !lastName || !email) {
            alert('Please fill out all required fields.');
            return;
        }

        // Save updated data 
        const updatedUser = {
            firstName,
            lastName,
            studentId: $('#studentId').val(),
            email,
            college: $('#college').val()
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Update header and avatar
        $('.header-info h1').text(firstName + ' ' + lastName);
        $('.header-info .email').text(email);
        $('.avatar span').text(firstName[0] + lastName[0]);

        // Disable inputs and restore buttons
        $inputs.prop('disabled', true);
        $actions.addClass('hidden');
        $editBtn.show();

        alert('Profile updated!');
    });
}


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
    function handleDeleteAccount() {
        $('.danger-card .danger-btn').on('click', function () {
        if (confirm('Are you sure you want to delete your account?')) {
             // Remove user data
            localStorage.removeItem('currentUser');

            // Redirect home
            window.location.href = '../index.html';
        }
    });
    }


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
    function handleChangePassword() {
    // Profile page: redirect to change password page
    const changePasswordBtn = document.querySelector('.setting-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            window.location.href = 'changepassword.html';
        });
    }

    // Change password page: handle form submission
    const changePasswordForm = $('#changePasswordForm');
    if (changePasswordForm.length) {
        changePasswordForm.on('submit', function(e) {
            e.preventDefault(); // Stop form from reloading

            // Get user inputs
            const currentPassword = $('#currentPassword').val();
            const newPassword = $('#newPassword').val();
            const confirmPassword = $('#confirmPassword').val();
            const errorDiv = $('#passwordError');
            const successDiv = $('#passwordSuccess');

            // Hide previous messages
            errorDiv.hide().text('');
            successDiv.hide().text('');

            // Validation checks
            if (!currentPassword || !newPassword || !confirmPassword) {
                errorDiv.text('All fields are required.').show();
                return;
            }
            if (newPassword.length < 8) {
                errorDiv.text('New password must be at least 8 characters long.').show();
                return;
            }
            if (newPassword !== confirmPassword) {
                errorDiv.text('New password and confirmation do not match.').show();
                return;
            }

            // Check current password
            const storedPassword = localStorage.getItem('userPassword');
            if (storedPassword && storedPassword !== currentPassword) {
                errorDiv.text('Current password is incorrect.').show();
                return;
            }

            // Save new password
            localStorage.setItem('userPassword', newPassword);

            // Show success message and redirect to profile
            successDiv.text('Password changed successfully! Redirecting...').show();
            setTimeout(function() {
                window.location.href = 'profile.html';
            }, 2000);
        });
    }
}


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
   function handleChangeAvatar() {
    // Hidden file input for selecting image
    const $fileInput = $('<input>', {
        type: 'file',
        accept: 'image/png, image/jpeg, image/gif',
        style: 'display:none'
    }).appendTo('body');

    // Open file picker on button click
    $('.change-avatar-btn').on('click', function() {
        $fileInput.click();
    });

    // Handle file selection
    $fileInput.on('change', function() {
        const file = this.files[0]; // Get the selected file
        const maxSize = 2 * 1024 * 1024; // This is 2MB
        if (!file) return;

        // Check file size
        if (file.size > maxSize) {
            alert("File too large! Max 2MB.");
            return;
        }

        // Read file as data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;

            // Update avatar element
            const $newImg = $('<img>').attr({
                src: imageData,
                style: 'width:100%; height:100%; border-radius:50%; object-fit:cover;'
            });
            $('.avatar').empty().append($newImg);

            // Save image data to localStorage (temporary)
            const user = JSON.parse(localStorage.getItem('currentUser')) || {};
            user.profilePic = imageData;
            localStorage.setItem('currentUser', JSON.stringify(user));
        };

        reader.readAsDataURL(file);
    });
}


    /**
     * Handles the Email Notifications toggle in Account Settings.
     * - Attaches a change listener to the .toggle input[type="checkbox"].
     * - On toggle: updates the user's notification preference in localStorage.
     * - Displays a brief confirmation message indicating the new state.
     *
     * @todo Replace with PUT /api/users/:id/settings API call
     * @returns {void}
     */
    function handleNotificationToggle() {
    $('.setting-item .toggle input[type="checkbox"]').on('change', function () {
        const enabled = $(this).is(':checked');

        // Update 
        const user = JSON.parse(localStorage.getItem('currentUser')) || {};
        user.notifications = enabled;
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Show confirmation
        let message = '';
        if (enabled) {
            message = 'Email notifications enabled';
        } else {
            message = 'Email notifications disabled';
        }
        alert(message);
    });
}


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
    function initUserSearch() {
  // The search input field
  const $searchInput = $('#userSearch');

  // The college dropdown filter
  const $collegeFilter = $('#collegeFilter');

  // The button that triggers filtering manually
  const $searchBtn = $('.search-btn');

  // All user cards displayed on the page
  const $userCards = $('.user-card');

  function filterCards() {
    // Get the current search text (lowercase and trimmed)
    const searchTerm = $searchInput.val().toLowerCase().trim();

    // Get the currently selected college from the dropdown
    const selectedCollege = $collegeFilter.val();

    $userCards.each(function () {
      const $card = $(this); // The current user card in the loop
      const name = $card.find('h3').text().toLowerCase(); // User's full name
      const studentId = $card.find('.user-id').text().toLowerCase(); // User's ID text
      const college = $card.find('.college-badge').text(); // User's college badge text

      // Check if the card matches the search term (name or ID)
      const matchesSearch = name.includes(searchTerm) || studentId.includes(searchTerm);

      // Check if the card matches the selected college
      const matchesCollege = selectedCollege === '' || college === selectedCollege;

      // Show or hide the card based on matches
      if (matchesSearch && matchesCollege) {
        $card.show();
      } else {
        $card.hide();
      }

      // Extract numeric ID from the student ID text
      const idMatch = studentId.match(/\d+/); 
      if (idMatch) {
        // Update "View Profile" link 
        $card.find('.view-profile-btn').attr('href', 'public-profile.html?id=' + idMatch[0]);
      }
    });

    // Refresh page
    if (typeof window.refreshPagination === 'function') {
      window.refreshPagination();
    }
  }

  // Event listeners
  $searchBtn.on('click', filterCards); // Manual search click
  $searchInput.on('keyup', filterCards); // Filter as user types
  $collegeFilter.on('change', filterCards); // Filter when college changes
  $searchInput.on('keypress', function (e) {
    if (e.which === 13) filterCards(); // Enter key triggers search
  });

  // Initial filter on page load
  filterCards();
}


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
    function initPublicProfilePage() {
         // Parse the URL query parameters
        const urlParams = new URLSearchParams(window.location.search);

        // Extract the 'id' parameter to identify which user's profile to show
        const userId = urlParams.get('id');

        // If no user ID is provided in the URL, exit 
        if (!userId) {
            console.log('No user ID provided');
            return;
        }

        // Log the ID for debugging purposes
        console.log('Public profile page initialized for user ID:', userId);
    
    // TODO: Fetch user data from API
    // TODO: Populate profile with user data
    }


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
    // When the walk-in form is submitted
    $('.walkin-form').on('submit', function (e) {
        e.preventDefault(); // Stop page from reloading
        
        // Get form values
        const studentId = $('#walkinStudentId').val().trim(); // Student's ID
        const lab = $('#walkinLab').val(); // Selected lab
        const seat = $('#walkinSeat').val().trim().toUpperCase(); // Seat number in uppercase
        const date = $('#walkinDate').val(); // Date of reservation
        const time = $('#walkinTime').val(); // Time slot
        
        // Check if student ID is 8 digits
        if (!/^[0-9]{8}$/.test(studentId)) {
            alert('Student ID must be exactly 8 digits.');
            $('#walkinStudentId').focus();
            return;
        }
        
        // Make sure a lab is selected
        if (!lab) {
            alert('Please select a lab.');
            $('#walkinLab').focus();
            return;
        }
        
        // Make sure seat is entered
        if (!seat) {
            alert('Please enter a seat number.');
            $('#walkinSeat').focus();
            return;
        }
        
        // Check seat format (like A1, B5, C10)
        if (!/^[A-Z][0-9]{1,2}$/i.test(seat)) {
            alert('Seat must be in format like A1, B5, or C10.');
            $('#walkinSeat').focus();
            return;
        }
        
        // Make sure a date is picked
        if (!date) {
            alert('Please select a date.');
            $('#walkinDate').focus();
            return;
        }
        
        // Do not allow past dates
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            alert('Cannot reserve for a past date.');
            $('#walkinDate').focus();
            return;
        }
        
        // Make sure a time is picked
        if (!time) {
            alert('Please select a time slot.');
            $('#walkinTime').focus();
            return;
        }
        
        // Get the text of the time slot for confirmation
        const timeText = $('#walkinTime option:selected').text();
        
        // Show confirmation message
        alert(
            'Walk-in reservation created!\n\n' +
            'Student ID: ' + studentId + '\n' +
            'Lab: ' + lab + '\n' +
            'Seat: ' + seat + '\n' +
            'Date: ' + date + '\n' +
            'Time: ' + timeText
        );
        
        // Clear the form
        $('.walkin-form')[0].reset();
    });
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
   function handleRemoveNoShow() {
    // When a remove button is clicked
    $('.remove-btn').on('click', function() {
        // Stop if the button is disabled
        if ($(this).prop('disabled')) {
            alert('This reservation cannot be removed yet. Wait until within 10 minutes of start time.');
            return;
        }
        
        // Get reservation info
        const $item = $(this).closest('.walkin-reservation-item');
        const reservationId = $item.data('reservation-id'); // ID of reservation
        const seatInfo = $item.find('.label').text(); // Seat info
        const studentInfo = $item.find('.value').text(); // Student info
        
        // Ask for confirmation
        if (confirm(
            'Remove this no-show reservation?\n\n' +
            seatInfo + '\n' +
            studentInfo + '\n\n' +
            'This will cancel the reservation and free the seat.'
        )) {
            // Remove the reservation visually
            $item.fadeOut(300, function() {
                $(this).remove();
                
                // If no reservations left, show message
                if ($('.walkin-reservation-item').length === 0) {
                    $('.summary-details').append(
                        '<div class="summary-item" style="text-align: center; color: #666;">' +
                        '<p>No current reservations</p>' +
                        '</div>'
                    );
                }
            });
            
            // Show success alert
            setTimeout(function() {
                alert('No-show reservation removed successfully.');
            }, 350);
        }
    });
}



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
    function initPagination() {
  // Stop if there is no pagination on this page
  if ($('.pagination').length === 0) return;

  const itemsPerPage = 5;   // Number of items to show per page
  let currentPage = 1;      // Current page

  // Show items for a given page and update pagination UI
  function showPage(page) {
    currentPage = page;

    // Get all visible items (reservation cards and user cards)
    const $items = $('.reservation-card:visible, .user-card:visible');
    const totalPages = Math.ceil($items.length / itemsPerPage);

    // Hide all items, then show only the ones for the current page
    const start = (page - 1) * itemsPerPage;
    $items.hide().slice(start, start + itemsPerPage).show();

    // Highlight the current page number
    $('.page-num').removeClass('active').filter(function() {
      return parseInt($(this).text()) === page;
    }).addClass('active');

    // Disable Previous button on first page, Next button on last page
    $('.page-btn').first().prop('disabled', page === 1);
    $('.page-btn').last().prop('disabled', page >= totalPages);

    // Update page info text
    $('.page-info').text(`Page ${page} of ${totalPages || 1}`);
  }

  // Click handlers for Previous, Next, and numbered buttons
  $('.page-btn').first().on('click', () => showPage(currentPage - 1));
  $('.page-btn').last().on('click', () => showPage(currentPage + 1));
  $('.page-num').on('click', function() {
    showPage(parseInt($(this).text()));
  });

  // Show first page on load
  showPage(1);

  // Allow external code to refresh pagination
  window.refreshPagination = () => showPage(1);
}


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
   function initGlobalSearch() {
    const $searchInput = $('.search-bar input'); // input element in the navbar
    const path = window.location.pathname;       // current page path

    $searchInput.on('keypress', function(e) {
        if (e.which !== 13) return; // run when Enter is pressed

        const searchTerm = $(this).val().trim().toLowerCase();
        if (!searchTerm) return;

        // Filter lab cards if on cmpslots.html
        if (path.indexOf('cmpslots.html') > -1) {
            $('.lab-card').each(function() {
                const labName = $(this).find('h3').text().toLowerCase();
                const building = $(this).find('.building-tag').text().toLowerCase();
                $(this).toggle(labName.includes(searchTerm) || building.includes(searchTerm));
            });
        }
        // Filter user cards if on users.html
        else if (path.indexOf('users.html') > -1) {
            $('#userSearch').val(searchTerm).trigger('keyup');
        }
        // Redirect to cmpslots.html for other pages
        else {
            const inPages = path.indexOf('/pages/') > -1;
            const target = inPages ? 'cmpslots.html' : 'pages/cmpslots.html';
            window.location.href = `${target}?search=${encodeURIComponent(searchTerm)}`;
        }
    });

    // If there is a search term in the URL on cmpslots.html, apply it automatically
    const urlSearch = new URLSearchParams(window.location.search).get('search');
    if (urlSearch && path.indexOf('cmpslots.html') > -1) {
        $searchInput.val(urlSearch).trigger($.Event('keypress', { which: 13 }));
    }
}


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
             initReservationFilters();
             handleCancelReservation();
             handleRebook();
             handleEditReservation();
        }
        else if (path.indexOf("cmpslots.html") > -1) {
            initLabFilters();
        }
        else if (path.indexOf("profile.html") > -1) {
             populateProfile();
             initProfileEdit();
             handleDeleteAccount();
             handleChangePassword();
             handleChangeAvatar();
             handleNotificationToggle();
        }
        else if (path.indexOf("users.html") > -1) {
             initUserSearch();
        }
        else if (path.indexOf("public-profile.html") > -1) {
             initPublicProfilePage();
        }
        else if (path.indexOf("dashboard.html") > -1) {
             initDashboard();
        }
        else if (path.indexOf("walkin.html") > -1) {
             initWalkInReservation();
             handleRemoveNoShow();
        }
    }


$(document).ready(init);


