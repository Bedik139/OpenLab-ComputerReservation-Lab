# OpenLab - Computer Lab Reservation System

A web application for reserving computer lab slots at DLSU, built for CCAPDEV (Web Application Development) Term 1, AY 2023-2024.

## Project Overview

OpenLab allows students to view real-time computer lab availability and reserve seats across multiple DLSU buildings (Gokongwei, Andrew, and Velasco labs). Lab technicians can manage walk-in reservations and handle no-show cases.

## Features

### For All Users (Visitors)
- **View Slot Availability** - Browse available seats across all computer labs
- **Search** - Find available slots by date, time, and lab location
- **View User Profiles** - See public profiles of other users (non-anonymous reservations)

### For Students
- **Register** - Create an account using DLSU email
- **Login/Logout** - Secure authentication with "Remember Me" option (3-week extension)
- **Reserve Slots** - Book 30-minute time slots up to 7 days in advance
- **Anonymous Reservations** - Option to hide identity from other users
- **Multiple Slot Booking** - Reserve multiple consecutive slots in one reservation
- **Edit Reservations** - Modify existing bookings
- **View Reservations** - Check reservation details (seat number, lab, date/time)
- **Edit Profile** - Update profile picture and description
- **Delete Account** - Remove account and cancel all pending reservations

### For Lab Technicians
- **Reserve for Walk-ins** - Create reservations on behalf of walk-in students
- **Remove No-shows** - Cancel reservations for students who don't arrive within 10 minutes
- **Edit Any Reservation** - Modify any student's reservation

## User Types

| Role | Description |
|------|-------------|
| **Visitor** | Can view availability but cannot reserve |
| **Student** | Can reserve slots, manage own reservations and profile |
| **Lab Technician** | Can manage all reservations and handle walk-ins |

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styling with responsive design
- **JavaScript** - Client-side interactivity
- **Bootstrap 4.4.1** - UI component framework
- **jQuery 3.4.1** - DOM manipulation

## Project Structure

```
OpenLab-ComputerReservation-Lab/
├── index.html                    # Landing page / Homepage
├── pages/
│   ├── login.html                # User login
│   ├── register.html             # User registration
│   ├── dashboard.html            # User dashboard with stats & quick actions
│   ├── cmpslots.html             # Browse available lab slots
│   ├── reserve.html              # Seat selection & reservation
│   ├── reservations.html         # View/manage reservations
│   ├── profile.html              # User profile & settings
│   ├── public-profile.html       # Public view of other users
│   ├── users.html                # Search & browse users
│   ├── walkin.html               # Walk-in reservations (technicians)
│   └── changepassword.html       # Change password
├── assets/
│   ├── css/
│   │   └── style.css             # Custom stylesheets (glassmorphism, dark theme)
│   └── bg.png                    # Background image
├── js/
│   └── app.js                    # Auth guards, session management
├── AI_Prompts_Documentation.txt  # AI prompts used during development
└── README.md
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Open `index.html` in a web browser to view the application.

3. Navigate through the pages using the navigation bar.

## Labs Included

- Gokongwei Hall Computer Labs
- Andrew Building Computer Labs
- Velasco Hall Computer Labs

## Reservation Rules

- Slots are available in **30-minute intervals**
- Students can reserve up to **7 days in advance**
- Reservations are **automatically cancelled** if the student doesn't show up within **10 minutes**
- Students can make **anonymous reservations** to hide their identity

## Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Front-End Development (HTML, CSS, JS) | In Progress |
| Phase 2 | Back-End Integration | Pending |
| Phase 3 | Full Application | Pending |

## Sample Data Requirements (Phase 1)

- At least 5 sample users
- At least 3 computer labs
- At least 5 sample reservations
- Life-like data (no lorem ipsum)

## AI Prompts Documentation

The [`AI_Prompts_Documentation.txt`](AI_Prompts_Documentation.txt) file contains all the AI prompts used as design direction guides throughout development. These cover Bootstrap setup, navigation structure, glassmorphism card styling, page layouts, and responsive design. The prompts are written as suggestions — not direct solution requests.

## Contributors

CCAPDEV Group Project - De La Salle University
