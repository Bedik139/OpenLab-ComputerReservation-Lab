/**
 * Walk-In Controller (Ivan)
 *
 * TODO (Ivan):
 * 1. Import models:
 *    const Reservation = require('../models/Reservation');
 *    const User = require('../models/User');
 *    const Lab = require('../models/Lab');
 *
 * 2. getAll(req, res):
 *    - Fetch all upcoming walk-in reservations:
 *      Reservation.find({ isWalkIn: true, status: 'upcoming' })
 *        .populate('user', 'firstName lastName studentId')
 *        .sort({ createdAt: -1 })
 *    - Return res.json(walkinReservations);
 *
 * 3. create(req, res):
 *    - Extract { studentId, lab, seat, date, timeSlot } from req.body
 *    - Look up student by studentId: User.findOne({ studentId })
 *      If not found, return 404 (or create a temp record—your call)
 *    - Look up lab from Lab model to get building name
 *    - Create reservation with isWalkIn: true, createdBy: req.session.user._id
 *    - Return res.json({ success: true, reservation });
 *
 * 4. removeNoShow(req, res):
 *    - Find reservation by ID
 *    - Verify it's a walk-in: if (!reservation.isWalkIn) return 400
 *    - Set status to 'cancelled'
 *    - Save and return res.json({ success: true });
 *
 * 5. Export all functions
 */

// TODO: Implement the above

// 1. Import models
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Lab = require('../models/Lab');

// 2. getAll(req, res)
const getAll = async (req, res) => {
    try {
        // Fetch all upcoming walk-in reservations
        const walkinReservations = await Reservation.find({ 
            isWalkIn: true, 
            status: 'upcoming' 
        })
        .populate('user', 'firstName lastName studentId')
        .sort({ createdAt: -1 });

        return res.json(walkinReservations);
    } catch (error) {
        console.error('Error fetching walk-in reservations:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 3. create(req, res)
const create = async (req, res) => {
    try {
        const { studentId, lab, seat, date, timeSlot } = req.body;

        // Back-end validation
        if (!studentId || !/^[0-9]{8}$/.test(studentId)) {
            return res.status(400).json({ error: 'Student ID must be exactly 8 digits.' });
        }
        if (!lab || !lab.trim()) {
            return res.status(400).json({ error: 'Lab is required.' });
        }
        if (!seat || !/^[A-Z][0-9]{1,2}$/i.test(seat)) {
            return res.status(400).json({ error: 'Seat must be in format like A1, B5, or C10.' });
        }
        if (!date) {
            return res.status(400).json({ error: 'Date is required.' });
        }
        const walkDate = new Date(date);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        if (walkDate < todayDate) {
            return res.status(400).json({ error: 'Cannot reserve for a past date.' });
        }
        if (!timeSlot || !timeSlot.trim()) {
            return res.status(400).json({ error: 'Time slot is required.' });
        }

        // Ensure the technician is logged in
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized: Please log in as a technician' });
        }

        // Look up the student by their Student ID
        const student = await User.findOne({ studentId });
        if (!student) {
            return res.status(404).json({ 
                error: `Student with ID ${studentId} not found in the system. Please have them register first.` 
            });
        }

        // Look up lab info from Lab model to get the building name
        const labInfo = await Lab.findOne({ code: lab });
        if (!labInfo) {
            return res.status(404).json({ error: 'Lab not found' });
        }

        // Prevent double-booking for the exact same seat and time
        const existingReservation = await Reservation.findOne({
            lab,
            seat,
            date,
            timeSlot,
            status: 'upcoming'
        });

        if (existingReservation) {
            return res.status(400).json({ error: 'This seat is already reserved for the selected time slot.' });
        }

        // Create the new walk-in reservation
        const newReservation = new Reservation({
            user: student._id,
            lab: lab,
            building: labInfo.building,
            seat,
            date,
            timeSlot,
            isWalkIn: true,
            createdBy: req.session.user._id, // Tracks which technician made the booking
            status: 'upcoming'
        });

        await newReservation.save();
        return res.status(201).json({ success: true, reservation: newReservation });

    } catch (error) {
        console.error('Error creating walk-in reservation:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 4. removeNoShow(req, res)
const removeNoShow = async (req, res) => {
    try {
        const reservationId = req.params.id;
        
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        // Verify it's actually a walk-in reservation
        if (!reservation.isWalkIn) {
            return res.status(400).json({ error: 'Bad Request: This is a standard student reservation, not a walk-in.' });
        }

        // Enforce 10-minute window: parse reservation time and check
        const reservationDate = new Date(reservation.date);
        const timeStr = reservation.timeSlot.split(' - ')[0]; // e.g. "09:00 AM"
        const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = parseInt(timeParts[2]);
            const ampm = timeParts[3].toUpperCase();
            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            reservationDate.setHours(hours, minutes, 0, 0);

            const now = new Date();
            const diffMs = now - reservationDate;
            const diffMin = diffMs / (1000 * 60);

            // Only allow removal within 10 minutes after the reservation start time
            if (diffMin < 0) {
                return res.status(400).json({ error: 'Cannot remove no-show before the reservation time starts.' });
            }
            if (diffMin > 10) {
                return res.status(400).json({ error: 'The 10-minute no-show window has passed for this reservation.' });
            }
        }

        // Set status to cancelled (indicating a no-show)
        reservation.status = 'cancelled';
        await reservation.save();

        return res.json({ success: true, message: 'Walk-in reservation cancelled (No-show recorded).' });

    } catch (error) {
        console.error(`Error removing no-show for reservation ${req.params.id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 5. Export all functions
module.exports = { 
    getAll, 
    create, 
    removeNoShow 
};