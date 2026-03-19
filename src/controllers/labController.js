/**
 * Lab Controller (Ivan)
 *
 * TODO (Ivan):
 * 1. Import models:
 *    const Lab = require('../models/Lab');
 *    const Reservation = require('../models/Reservation');
 *
 * 2. getAll(req, res):
 *    - Fetch all labs from Lab model
 *    - For each lab, count upcoming reservations to determine occupied/reserved seats
 *    - Return labs with availability: { ...lab, available, occupied, reserved }
 *    - Return res.json(labs);
 *
 * 3. getByCode(req, res):
 *    - Find lab by code: Lab.findOne({ code: req.params.code })
 *    - Return res.json(lab);
 *
 * 4. getSeats(req, res):
 *    - Get lab by code
 *    - Get date and timeSlot from query params (optional filters)
 *    - Fetch all upcoming reservations for that lab (+ date + timeSlot if provided)
 *    - Build seat map: for each row+col, determine status (available/occupied/reserved)
 *      and include occupant info (name or "Anonymous") for tooltips
 *    - Return res.json({ lab, seats: [ { id: "A1", status: "available", occupant: null }, ... ] });
 *
 * 5. Export all functions
 */

// TODO: Implement the above

// 1. Import models
const Lab = require('../models/Lab');
const Reservation = require('../models/Reservation');

// 2. getAll(req, res)
const getAll = async (req, res) => {
    try {
        // Fetch all labs (using .lean() for faster, pure JS objects)
        const labs = await Lab.find().lean();

        // Calculate availability for each lab
        const labsWithAvailability = await Promise.all(labs.map(async (lab) => {
            // Count upcoming reservations for this specific lab
            const upcomingCount = await Reservation.countDocuments({ 
                lab: lab.code, 
                status: 'upcoming' 
            });

            return {
                ...lab,
                available: lab.totalSeats - upcomingCount,
                occupied: upcomingCount, // Assuming 'occupied' and 'reserved' refer to the same upcoming pool for now
                reserved: upcomingCount
            };
        }));

        return res.json({ success: true, data: labsWithAvailability });
    } catch (error) {
        console.error("Error fetching all labs:", error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// 3. getByCode(req, res)
const getByCode = async (req, res) => {
    try {
        const labCode = req.params.code;
        const lab = await Lab.findOne({ code: labCode });

        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab not found' });
        }

        return res.json({ success: true, data: lab });
    } catch (error) {
        console.error(`Error fetching lab ${req.params.code}:`, error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// 4. getSeats(req, res)
const getSeats = async (req, res) => {
    try {
        const labCode = req.params.code;
        const { date, timeSlot } = req.query;

        // Find the specific lab to get its row/col layout
        const lab = await Lab.findOne({ code: labCode }).lean();
        if (!lab) {
            return res.status(404).json({ success: false, error: 'Lab not found' });
        }

        // Build the query to find reservations
        let reservationQuery = { lab: labCode, status: 'upcoming' };
        
        // Optional filters from query params
        if (date) {
            // Depending on how your teammate Chrisander set up the Date schema, 
            // you might need to adjust this to match string vs Date object formats.
            reservationQuery.date = date; 
        }
        if (timeSlot) {
            reservationQuery.timeSlot = timeSlot;
        }

        // Fetch reservations and populate the user details for the tooltip
        const reservations = await Reservation.find(reservationQuery).populate('user', 'firstName lastName');

        // Map reservations by seat ID for O(1) quick lookups
        const reservedSeatsMap = {};
        reservations.forEach(res => {
            reservedSeatsMap[res.seat] = res;
        });

        // Build the seat map based on the lab's grid (e.g., rows: ['A', 'B', 'C'], cols: 10)
        const seats = [];
        for (let r = 0; r < lab.rows.length; r++) {
            const rowLetter = lab.rows[r];
            for (let c = 1; c <= lab.cols; c++) {
                const seatId = `${rowLetter}${c}`; // e.g., "A1", "C5"
                const reservation = reservedSeatsMap[seatId];

                let status = 'available';
                let occupant = null;

                if (reservation) {
                    status = 'reserved';
                    // Handle Anonymous logic
                    if (reservation.isAnonymous) {
                        occupant = 'Anonymous';
                    } else {
                        occupant = reservation.user ? `${reservation.user.firstName} ${reservation.user.lastName}` : 'Unknown User';
                    }
                }

                seats.push({
                    id: seatId,
                    status,
                    occupant
                });
            }
        }

        return res.json({ 
            success: true, 
            data: { 
                lab, 
                seats 
            } 
        });

    } catch (error) {
        console.error(`Error fetching seats for lab ${req.params.code}:`, error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// 5. Export all functions
module.exports = { getAll, getByCode, getSeats };