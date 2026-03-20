/**
 * OpenLab Computer Reservation System
 * @file app.js (rewritten for Express/Handlebars backend)
 * @description Event handlers and fetch API calls only.
 *              All DOM building is now done by Handlebars templates.
 *              No localStorage, no sessionStorage — sessions are server-side.
 */

// =============================================================================
// UTILITY HELPERS
// =============================================================================

/** Format date string "YYYY-MM-DD" to "February 10, 2025" */
function formatDateLong(dateStr) {
  var months = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var d = new Date(dateStr);
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}


// =============================================================================
// LOGIN PAGE
// =============================================================================

function initLoginPage() {
  var $form = $('.login-form');
  if (!$form.length) return;

  $form.on('submit', function(e) {
    e.preventDefault();
    var email = $('#email').val().trim();
    var password = $('#password').val();

    // Front-end validation
    var $error = $('.login-error');
    if (!$error.length) {
      $form.prepend('<div class="login-error" style="color:#e74c3c;margin-bottom:10px;display:none;"></div>');
      $error = $('.login-error');
    }
    $error.hide().text('');

    if (!email) {
      $error.text('Please enter your email address.').show();
      $('#email').focus();
      return;
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      $error.text('Please enter a valid email address.').show();
      $('#email').focus();
      return;
    }
    if (!password) {
      $error.text('Please enter your password.').show();
      $('#password').focus();
      return;
    }

    var rememberMe = $('#remember').is(':checked');

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, rememberMe: rememberMe })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        window.location.href = '/dashboard';
      } else {
        $error.text(data.error || 'Invalid email or password.').show();
        $('#password').val('').focus();
      }
    })
    .catch(function() {
      $error.text('Login failed. Please try again.').show();
    });
  });

  $('.forgot-password').on('click', function(e) {
    e.preventDefault();
    var email = prompt('Enter your DLSU email:');
    if (email) {
      alert('Your password cannot be retrieved. Please contact the lab administrator to reset it.');
    }
  });
}


// =============================================================================
// TECHNICIAN LOGIN PAGE
// =============================================================================

function initTechLoginPage() {
  var $form = $('#techLoginForm');
  if (!$form.length) return;

  $form.on('submit', function(e) {
    e.preventDefault();
    var email = $('#email').val().trim();
    var password = $('#password').val();

    // Front-end validation
    var $error = $('.login-error');
    if (!$error.length) {
      $form.prepend('<div class="login-error" style="color:#e74c3c;margin-bottom:10px;display:none;"></div>');
      $error = $('.login-error');
    }
    $error.hide().text('');

    if (!email) {
      $error.text('Please enter your email address.').show();
      $('#email').focus();
      return;
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      $error.text('Please enter a valid email address.').show();
      $('#email').focus();
      return;
    }
    if (!password) {
      $error.text('Please enter your password.').show();
      $('#password').focus();
      return;
    }

    var rememberMe = $('#remember').is(':checked');

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, techOnly: true, rememberMe: rememberMe })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        window.location.href = '/dashboard';
      } else {
        $error.text(data.error || 'Invalid technician credentials.').show();
        $('#password').val('').focus();
      }
    })
    .catch(function() {
      $error.text('Login failed. Please try again.').show();
    });
  });
}


// =============================================================================
// REGISTER PAGE
// =============================================================================

function initRegisterPage() {
  var $form = $('.register-form');
  if (!$form.length) return;

  $form.on('submit', function(e) {
    e.preventDefault();
    // Front-end validation
    var $error = $('.register-error');
    if (!$error.length) {
      $form.prepend('<div class="register-error" style="color:#e74c3c;margin-bottom:10px;display:none;"></div>');
      $error = $('.register-error');
    }
    $error.hide().text('');

    var firstName = $('#firstName').val().trim();
    var lastName = $('#lastName').val().trim();
    var studentId = $('#studentId').val().trim();
    var email = $('#email').val().trim();
    var college = $('#college').val();
    var accountType = $('#accountType').val();
    var pass = $('#password').val();
    var confirmPass = $('#confirmPassword').val();

    if (!firstName) { $error.text('First name is required.').show(); $('#firstName').focus(); return; }
    if (!lastName) { $error.text('Last name is required.').show(); $('#lastName').focus(); return; }
    if (!/^[0-9]{8}$/.test(studentId)) { $error.text('Student ID must be exactly 8 digits.').show(); $('#studentId').focus(); return; }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) { $error.text('Please enter a valid email address.').show(); $('#email').focus(); return; }
    if (!college) { $error.text('Please select your college.').show(); $('#college').focus(); return; }
    if (!accountType) { $error.text('Please select an account type.').show(); $('#accountType').focus(); return; }
    if (pass.length < 8) { $error.text('Password must be at least 8 characters.').show(); $('#password').focus(); return; }
    if (pass !== confirmPass) { $error.text('Passwords do not match.').show(); $('#confirmPassword').focus(); return; }

    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        studentId: studentId,
        email: email,
        college: college,
        accountType: accountType,
        password: pass
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        alert('Registration successful! Welcome to OpenLab.');
        window.location.href = '/dashboard';
      } else {
        $error.text(data.error || 'Registration failed.').show();
      }
    })
    .catch(function() {
      $error.text('Registration failed. Please try again.').show();
    });
  });
}


// =============================================================================
// SIGN OUT
// =============================================================================

function initSignout() {
  $('#signoutBtn').on('click', function(e) {
    e.preventDefault();
    fetch('/api/logout', { method: 'POST' })
    .then(function() {
      window.location.href = '/';
    })
    .catch(function() {
      window.location.href = '/';
    });
  });
}


// =============================================================================
// RESERVE PAGE — SEAT SELECTION & BOOKING
// =============================================================================

function initSeatSelection() {
  var $grid = $('.seat-grid');
  if (!$grid.length) return;

  // Seat click handler
  $grid.on('click', '.seat.available', function() {
    $('.seat.selected').removeClass('selected').addClass('available');
    $(this).removeClass('available').addClass('selected');
    var seatId = $(this).attr('data-seat');
    $('#summarySeat').text(seatId);
    $('#confirmBtn').prop('disabled', false).text('Confirm Reservation');
  });

  // Date/time sync
  $('#reserveDate').on('change', function() {
    var val = $(this).val();
    if (val) $('#summaryDate').text(formatDateLong(val));
  });
  $('#timeSlot').on('change', function() {
    $('#summaryTime').text($(this).find('option:selected').text());
  });

  // Anonymous toggle
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
    $status.find('.value').text(isAnon ? 'Anonymous' : 'Public');
  });

  // Pre-select seat if editing
  var $confirmBtn = $('#confirmBtn');
  var editId = $confirmBtn.data('edit-id');
  if (editId) {
    var editSeat = $('#summarySeat').text().trim();
    if (editSeat && editSeat !== '-') {
      var $editSeat = $('.seat[data-seat="' + editSeat + '"]');
      if ($editSeat.length && !$editSeat.hasClass('occupied')) {
        $editSeat.removeClass('available reserved').addClass('selected');
        $confirmBtn.prop('disabled', false).text('Update Reservation');
      }
    }
  }

  // Confirm/Update reservation
  $confirmBtn.on('click', function() {
    var labCode = $(this).data('lab');
    var seat = $('.seat.selected').attr('data-seat');
    if (!seat) { alert('Please select a seat.'); return; }

    var date = $('#reserveDate').val();
    var timeSlot = $('#timeSlot option:selected').text();
    var anonymous = $('#anonymousToggle').is(':checked');

    if (!date) { alert('Please select a date.'); return; }
    var today = new Date().toISOString().split('T')[0];
    if (date < today) { alert('Please select today or a future date.'); return; }
    if (!timeSlot || timeSlot === 'Select a time slot') { alert('Please select a time slot.'); return; }

    var url = editId ? '/api/reservations/' + editId : '/api/reservations';
    var method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lab: labCode,
        seat: seat,
        date: date,
        timeSlot: timeSlot,
        anonymous: anonymous
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        alert((editId ? 'Reservation updated' : 'Reservation confirmed') + ' for Seat ' + seat + ' at ' + labCode + '!');
        window.location.href = '/reservations';
      } else {
        alert(data.error || 'Failed to save reservation.');
      }
    })
    .catch(function() {
      alert('Failed to save reservation. Please try again.');
    });
  });

  // Poll availability from server every 30 seconds
  function refreshAvailability() {
    var labCode = $('#confirmBtn').data('lab');
    var date = $('#reserveDate').val();
    var timeSlot = $('#timeSlot option:selected').text();
    if (!labCode || !date || !timeSlot) return;

    fetch('/api/labs/' + encodeURIComponent(labCode) + '/seats?date=' + date + '&timeSlot=' + encodeURIComponent(timeSlot))
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.seats) {
        var availableCount = 0;
        data.seats.forEach(function(seat) {
          var $seatEl = $('.seat[data-seat="' + seat.id + '"]');
          if (!$seatEl.hasClass('selected')) {
            $seatEl.removeClass('available occupied reserved').addClass(seat.status);
          }
          if (seat.status === 'available') availableCount++;
        });
        $('.availability-badge').text(availableCount + ' seats available');
      }
    })
    .catch(function() { /* silently fail on poll */ });
  }
  setInterval(refreshAvailability, 30000);
}


// =============================================================================
// RESERVATIONS PAGE — FILTERS, CANCEL, EDIT, REBOOK
// =============================================================================

function initReservationsPage() {
  var $list = $('.reservations-list');
  if (!$list.length) return;

  // Filter tabs
  $('.tab-btn').on('click', function() {
    var filter = $(this).data('filter');
    $('.tab-btn').removeClass('active');
    $(this).addClass('active');

    $('.reservation-card').each(function() {
      var status = $(this).data('status');
      $(this).toggle(filter === 'all' || status === filter);
    });

    if (typeof window.refreshPagination === 'function') {
      window.refreshPagination();
    }
  });

  // Cancel reservation
  $list.on('click', '.action-btn.cancel', function() {
    var card = $(this).closest('.reservation-card');
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    var resId = card.data('id');
    fetch('/api/reservations/' + resId + '/cancel', { method: 'PUT' })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        card.attr('data-status', 'cancelled').data('status', 'cancelled');
        card.removeClass('upcoming').addClass('cancelled');
        card.find('.status-badge').first().text('Cancelled').removeClass('upcoming completed').addClass('cancelled');
        card.find('.action-btn.edit').remove();
        card.find('.action-btn.cancel').replaceWith('<button class="action-btn rebook">Book Again</button>');

        var activeFilter = $('.tab-btn.active').data('filter');
        if (activeFilter !== 'all' && activeFilter !== 'cancelled') {
          card.fadeOut('fast');
        }
      } else {
        alert(data.error || 'Failed to cancel reservation.');
      }
    })
    .catch(function() { alert('Failed to cancel reservation.'); });
  });

  // Rebook
  $list.on('click', '.action-btn.rebook', function() {
    var card = $(this).closest('.reservation-card');
    var lab = card.find('.reservation-main h3').text().split(' - ')[0];
    if (lab) {
      window.location.href = '/reserve?lab=' + encodeURIComponent(lab.trim());
    }
  });

  // Edit
  $list.on('click', '.action-btn.edit', function() {
    var card = $(this).closest('.reservation-card');
    var lab = card.find('.reservation-main h3').text().split(' - ')[0];
    var resId = card.data('id') || '';
    window.location.href = '/reserve?lab=' + encodeURIComponent(lab) + '&edit=' + resId;
  });
}


// =============================================================================
// LAB FILTERS (cmpslots page)
// =============================================================================

function initLabFilters() {
  var $filterBtn = $('.filter-btn');
  if (!$filterBtn.length) return;

  var buildingMap = {
    andrew: 'andrew building',
    lasalle: 'la salle hall',
    gokongwei: 'gokongwei building'
  };

  $filterBtn.on('click', function() {
    var selected = $('#buildingFilter').val();
    $('.lab-card').each(function() {
      var cardBuilding = $(this).find('.building-tag').text().trim().toLowerCase();
      if (!selected) { $(this).show(); return; }
      $(this).toggle(cardBuilding === buildingMap[selected]);
    });
  });
}


// =============================================================================
// PROFILE PAGE — EDIT, DELETE, CHANGE PASSWORD, AVATAR
// =============================================================================

function initProfilePage() {
  var $editBtn = $('#editPersonalBtn');
  if (!$editBtn.length) return;

  var $form = $('#personalForm');
  var $inputs = $form.find('input, select, textarea');
  var $actions = $('#personalActions');
  var originalValues = {};

  // Edit mode
  $editBtn.on('click', function() {
    $inputs.prop('disabled', false);
    $actions.removeClass('hidden');
    $editBtn.hide();
    originalValues = {
      firstName: $('#firstName').val(),
      lastName: $('#lastName').val(),
      college: $('#college').val(),
      bio: $('#bio').val()
    };
  });

  // Cancel edit
  $actions.find('.cancel-btn').on('click', function() {
    $('#firstName').val(originalValues.firstName);
    $('#lastName').val(originalValues.lastName);
    $('#college').val(originalValues.college);
    $('#bio').val(originalValues.bio);
    $inputs.prop('disabled', true);
    $actions.addClass('hidden');
    $editBtn.show();
  });

  // Save profile
  $actions.find('.save-btn').on('click', function(e) {
    e.preventDefault();
    var firstName = $('#firstName').val().trim();
    var lastName = $('#lastName').val().trim();
    if (!firstName || !lastName) {
      alert('Please fill out all required fields.');
      return;
    }

    fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        college: $('#college').val(),
        bio: $('#bio').val().trim()
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        $('.header-info h1').text(firstName + ' ' + lastName);
        var initials = (firstName[0] || '') + (lastName[0] || '');
        $('.avatar span').text(initials);
        $inputs.prop('disabled', true);
        $actions.addClass('hidden');
        $editBtn.show();
        alert('Profile updated!');
      } else {
        alert(data.error || 'Failed to update profile.');
      }
    })
    .catch(function() { alert('Failed to update profile.'); });
  });

  // Delete account
  $('.danger-btn').on('click', function() {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;

    fetch('/api/profile', { method: 'DELETE' })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        window.location.href = '/';
      } else {
        alert(data.error || 'Failed to delete account.');
      }
    })
    .catch(function() { alert('Failed to delete account.'); });
  });

  // Change password redirect
  $('.setting-btn').on('click', function() {
    window.location.href = '/changepassword';
  });

  // Avatar upload
  var $fileInput = $('<input>', { type: 'file', accept: 'image/png, image/jpeg, image/gif', style: 'display:none' }).appendTo('body');
  $('.change-avatar-btn').on('click', function() { $fileInput.click(); });
  $fileInput.on('change', function() {
    var file = this.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('File too large! Max 2MB.'); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      var dataUrl = e.target.result;
      var $img = $('<img>').attr({ src: dataUrl, style: 'width:100%;height:100%;border-radius:50%;object-fit:cover;' });
      $('.avatar').empty().append($img);
      // TODO (Ivan): POST avatar to /api/profile/avatar when endpoint is ready
    };
    reader.readAsDataURL(file);
  });
}


// =============================================================================
// CHANGE PASSWORD PAGE
// =============================================================================

function initChangePasswordPage() {
  var $form = $('#changePasswordForm');
  if (!$form.length) return;

  $form.on('submit', function(e) {
    e.preventDefault();
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

    fetch('/api/profile/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        alert('Password changed successfully!');
        window.location.href = '/profile';
      } else {
        $error.text(data.error || 'Failed to change password.').show();
      }
    })
    .catch(function() {
      $error.text('Failed to change password.').show();
    });
  });
}


// =============================================================================
// USERS PAGE — SEARCH & FILTER
// =============================================================================

function initUserSearch() {
  var $searchInput = $('#userSearch');
  if (!$searchInput.length) return;

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
// WALK-IN PAGE — CREATE & REMOVE
// =============================================================================

function initWalkInPage() {
  var $form = $('.walkin-form');
  if (!$form.length) return;

  $form.on('submit', function(e) {
    e.preventDefault();
    var studentId = $('#walkinStudentId').val().trim();
    var lab = $('#walkinLab').val();
    var seat = $('#walkinSeat').val().trim().toUpperCase();
    var date = $('#walkinDate').val();
    var timeSlot = $('#walkinTime option:selected').text();

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

    fetch('/api/walkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: studentId,
        lab: lab,
        seat: seat,
        date: date,
        timeSlot: timeSlot
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        var r = data.reservation;
        alert('Walk-in reservation created!\n\nStudent ID: ' + studentId +
              '\nLab: ' + lab + '\nSeat: ' + seat + '\nDate: ' + date + '\nTime: ' + timeSlot);

        // Remove empty state message if present
        var $emptyMsg = $('.summary-details .summary-item p');
        if ($emptyMsg.length && $emptyMsg.text().indexOf('No current') > -1) {
          $emptyMsg.closest('.summary-item').remove();
        }

        // Add to DOM
        var newItemHtml =
          '<div class="divider"></div>' +
          '<div class="walkin-reservation-item" data-reservation-id="' + r._id + '">' +
            '<div class="summary-item">' +
              '<span class="label">' + lab + ' - Seat ' + seat + '</span>' +
              '<span class="value">' + timeSlot.split(' - ')[0] + ' - ' + (r.studentName || 'Student') + ' (' + studentId + ')</span>' +
            '</div>' +
            '<button class="remove-btn">Remove No-Show</button>' +
          '</div>';
        $('.summary-details').append(newItemHtml);
        $form[0].reset();
      } else {
        alert(data.error || 'Failed to create walk-in reservation.');
      }
    })
    .catch(function() {
      alert('Failed to create walk-in reservation.');
    });
  });

  // Remove no-show
  $('.summary-details').on('click', '.remove-btn', function() {
    var $item = $(this).closest('.walkin-reservation-item');
    var resId = $item.data('reservation-id');
    var seatInfo = $item.find('.label').text();
    var studentInfo = $item.find('.value').text();

    if (!confirm('Remove this no-show reservation?\n\n' + seatInfo + '\n' + studentInfo +
                 '\n\nThis will cancel the reservation and free the seat.')) return;

    fetch('/api/walkin/' + resId + '/remove', { method: 'PUT' })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
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
      } else {
        alert(data.error || 'Failed to remove reservation.');
      }
    })
    .catch(function() { alert('Failed to remove reservation.'); });
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

    if (path.indexOf('/cmpslots') > -1) {
      $('.lab-card').each(function() {
        var labName = $(this).find('h3').text().toLowerCase();
        var building = $(this).find('.building-tag').text().toLowerCase();
        $(this).toggle(labName.indexOf(searchTerm) > -1 || building.indexOf(searchTerm) > -1);
      });
    } else if (path.indexOf('/users') > -1) {
      $('#userSearch').val(searchTerm).trigger('keyup');
    } else {
      window.location.href = '/cmpslots?search=' + encodeURIComponent(searchTerm);
    }
  });

  var urlSearch = new URLSearchParams(window.location.search).get('search');
  if (urlSearch && path.indexOf('/cmpslots') > -1) {
    $searchInput.val(urlSearch).trigger($.Event('keypress', { which: 13 }));
  }
}


// =============================================================================
// INIT — Detect page and bind handlers
// =============================================================================

$(document).ready(function() {
  var path = window.location.pathname;

  // Signout is available on all authenticated pages
  if ($('#signoutBtn').length) {
    initSignout();
  }

  // Page-specific handlers
  if (path === '/login' || path === '/login/') {
    initLoginPage();
  } else if (path === '/adminsignup' || path === '/adminsignup/') {
    initTechLoginPage();
  } else if (path === '/register' || path === '/register/') {
    initRegisterPage();
  } else if (path.indexOf('/reserve') > -1) {
    initSeatSelection();
  } else if (path === '/reservations' || path === '/reservations/') {
    initReservationsPage();
  } else if (path === '/profile' || path === '/profile/') {
    initProfilePage();
  } else if (path === '/users' || path === '/users/') {
    initUserSearch();
  } else if (path === '/walkin' || path === '/walkin/') {
    initWalkInPage();
  } else if (path === '/changepassword' || path === '/changepassword/') {
    initChangePasswordPage();
  }

  // Global handlers
  initGlobalSearch();
  if ($('.pagination').length > 0) {
    initPagination();
  }
});
