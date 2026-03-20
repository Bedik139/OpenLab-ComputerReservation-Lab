/**
 * Reservation Controller (Ivan)
 *
 * TODO (Ivan):
 * 1. Import models:
 *    const Reservation = require('../models/Reservation');
 *    const Lab = require('../models/Lab');
 *
 * 2. getAll(req, res):
 *    - If technician: Reservation.find().populate('user', 'firstName lastName email studentId').sort({ date: -1 })
 *    - Else: Reservation.find({ user: req.session.user._id }).sort({ date: -1 })
 *    - Return res.json(reservations);
 *
 * 3. getById(req, res):
 *    - Find by ID, ensure user owns it (or is technician)
 *    - Return res.json(reservation);
 *
 * 4. create(req, res):
 *    - Extract { lab, seat, date, timeSlot, anonymous } from req.body
 *    - Look up lab info from Lab model to get building name
 *    - Check for double-booking: existing upcoming reservation for same lab+seat+date+timeSlot
 *    - Create new Reservation with user: req.session.user._id
 *    - Return res.json({ success: true, reservation });
 *
 * 5. update(req, res):
 *    - Find reservation by ID, ensure user owns it
 *    - Update allowed fields: seat, date, timeSlot, anonymous
 *    - Save and return updated reservation
 *
 * 6. cancel(req, res):
 *    - Find reservation by ID, ensure user owns it (or is technician)
 *    - Set status to 'cancelled'
 *    - Save and return res.json({ success: true });
 *
 * 7. delete(req, res):
 *    - Find and delete reservation (technician only, or user owns it)
 *    - Return res.json({ success: true });
 *
 * 8. Export all functions
 */

// TODO: Implement the above

// 1. Import models
const Reservation = require('../models/Reservation');
const Lab = require('../models/Lab');

// 2. getAll(req, res)
const getAll = async (req, res) => {
    try {
        const user = req.session.user;
        let reservations;

        if (user.accountType === 'technician') {
            // Technician sees everything, populated with user info
            reservations = await Reservation.find()
                .populate('user', 'firstName lastName email studentId')
                .sort({ date: -1 });
        } else {
            // Student only sees their own reservations
            reservations = await Reservation.find({ user: user._id })
                .populate('user', 'firstName lastName email studentId')
                .sort({ date: -1 });
        }

        return res.json(reservations);
    } catch (error) {
        console.error('Error in getAll reservations:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 3. getById(req, res)
const getById = async (req, res) => {
    try {
        const user = req.session.user;
        const reservation = await Reservation.findById(req.params.id)
            .populate('user', 'firstName lastName email studentId');

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        // Security check: ensure user owns it OR is a technician
        const isOwner = reservation.user._id.toString() === user._id.toString();
        const isTechnician = user.accountType === 'technician';

        if (!isOwner && !isTechnician) {
            return res.status(403).json({ error: 'Forbidden: You do not have access to this reservation' });
        }

        return res.json(reservation);
    } catch (error) {
        console.error(`Error fetching reservation ${req.params.id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 4. create(req, res)
const create = async (req, res) => {
    try {
        const { lab, seat, date, timeSlot, anonymous } = req.body;
        const user = req.session.user;

        // Back-end validation
        if (!lab || !lab.trim()) {
            return res.status(400).json({ error: 'Lab is required.' });
        }
        if (!seat || !seat.trim()) {
            return res.status(400).json({ error: 'Seat is required.' });
        }
        if (!/^[A-Z][0-9]{1,2}$/i.test(seat)) {
            return res.status(400).json({ error: 'Seat must be in format like A1, B5, or C10.' });
        }
        if (!date) {
            return res.status(400).json({ error: 'Date is required.' });
        }
        const reserveDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (reserveDate < today) {
            return res.status(400).json({ error: 'Cannot reserve for a past date.' });
        }
        // Check max 7 days in advance
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 7);
        maxDate.setHours(23, 59, 59, 999);
        if (reserveDate > maxDate) {
            return res.status(400).json({ error: 'Cannot reserve more than 7 days in advance.' });
        }
        if (!timeSlot || !timeSlot.trim()) {
            return res.status(400).json({ error: 'Time slot is required.' });
        }

        // Look up lab info to get building name
        const labInfo = await Lab.findOne({ code: lab });
        if (!labInfo) {
            return res.status(404).json({ error: 'Lab not found' });
        }

        // Check for double-booking (same lab, seat, date, and timeSlot that is STILL upcoming)
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

        // Create new Reservation
        const newReservation = new Reservation({
            user: user._id,
            lab: lab,
            building: labInfo.building, // Pulled from the Lab lookup
            seat,
            date,
            timeSlot,
            isAnonymous: anonymous || false,
            status: 'upcoming'
        });

        await newReservation.save();
        return res.status(201).json({ success: true, reservation: newReservation });
    } catch (error) {
        console.error('Error creating reservation:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 5. update(req, res)
const update = async (req, res) => {
    try {
        const { seat, date, timeSlot, anonymous } = req.body;
        const user = req.session.user;

        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        // Security check: owner or technician can update
        const isOwner = reservation.user.toString() === user._id.toString();
        const isTechnician = user.accountType === 'technician';
        if (!isOwner && !isTechnician) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to edit this reservation' });
        }

        // Update allowed fields
        if (seat) reservation.seat = seat;
        if (date) reservation.date = date;
        if (timeSlot) reservation.timeSlot = timeSlot;
        if (anonymous !== undefined) reservation.isAnonymous = anonymous;

        await reservation.save();
        return res.json({ success: true, reservation });
    } catch (error) {
        console.error(`Error updating reservation ${req.params.id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 6. cancel(req, res)
const cancel = async (req, res) => {
    try {
        const user = req.session.user;
        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        // Security check: owner or technician
        const isOwner = reservation.user.toString() === user._id.toString();
        const isTechnician = user.accountType === 'technician';

        if (!isOwner && !isTechnician) {
            return res.status(403).json({ error: 'Forbidden: You cannot cancel this reservation' });
        }

        // Set status to cancelled
        reservation.status = 'cancelled';
        await reservation.save();

        return res.json({ success: true, reservation });
    } catch (error) {
        console.error(`Error cancelling reservation ${req.params.id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 7. delete(req, res)
const deleteRes = async (req, res) => {
    try {
        const user = req.session.user;
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        const isOwner = reservation.user.toString() === user._id.toString();
        const isTechnician = user.accountType === 'technician';

        if (!isOwner && !isTechnician) {
            return res.status(403).json({ error: 'Forbidden: You cannot delete this reservation' });
        }

        await Reservation.findByIdAndDelete(req.params.id);
        return res.json({ success: true });
    } catch (error) {
        console.error(`Error deleting reservation ${req.params.id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 8. Export all functions
module.exports = { 
    getAll, 
    getById, 
    create, 
    update, 
    cancel, 
    delete: deleteRes 
};