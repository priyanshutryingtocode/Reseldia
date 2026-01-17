const pool = require('../../db');

// --- GET ALL APPROVED EVENTS (Public) ---
const getAllEvents = async (req, res) => {
    try {
        // Only show APPROVED events to the public
        const allEvents = await pool.query(
            "SELECT * FROM activities WHERE status = 'approved' ORDER BY event_date ASC"
        );
        res.json(allEvents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// --- CREATE EVENT (Conditional Logic) ---
const createEvent = async (req, res) => {
    const { title, description, event_date, venue, capacity } = req.body;
    
    // Extracted from the token by your authMiddleware
    const { user_id, role } = req.user; 

    try {
        // 1. Determine Status: Admins get instant approval, Residents get pending
        // If role is undefined, default to 'pending'
        const initialStatus = role === 'admin' ? 'approved' : 'pending';

        const newEvent = await pool.query(
            `INSERT INTO activities 
            (title, description, event_date, venue, capacity, organizer_id, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [title, description, event_date, venue, capacity, user_id, initialStatus]
        );

        const createdActivity = newEvent.rows[0];

        // 2. Send appropriate response
        if (initialStatus === 'pending') {
            res.status(201).json({ 
                message: "Event submitted! ⏳ Waiting for Admin approval.", 
                event: createdActivity 
            });
        } else {
            res.status(201).json({ 
                message: "Event created and live! ✅", 
                event: createdActivity 
            });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// --- DELETE EVENT (Permission Check) ---
const deleteEvent = async (req, res) => {
    const { id } = req.params;
    const { user_id, role } = req.user;

    try {
        // 1. Fetch the event to see who owns it
        const eventCheck = await pool.query('SELECT * FROM activities WHERE id = $1', [id]);

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        const activity = eventCheck.rows[0];

        // 2. Authorization Logic
        const isAdmin = role === 'admin';
        const isOwner = activity.organizer_id === user_id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: "You are not authorized to delete this event." });
        }

        // 3. Delete
        await pool.query('DELETE FROM activities WHERE id = $1', [id]);
        res.json({ message: "Event deleted successfully! 🗑️" });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// --- GET PENDING EVENTS (Admin Dashboard) ---
const getPendingEvents = async (req, res) => {
    try {
        const pendingEvents = await pool.query(
            "SELECT * FROM activities WHERE status = 'pending' ORDER BY event_date ASC"
        );
        res.json(pendingEvents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// --- APPROVE EVENT (Admin Action) ---
const approveEvent = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "UPDATE activities SET status = 'approved' WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json({ message: "Event Approved! 🟢", event: result.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// --- JOIN EVENT (Unchanged) ---
const joinEvent = async (req, res) => {
    const { id } = req.params; 
    const user_id = req.user.user_id; 

    try {
        const newRegistration = await pool.query(
            'INSERT INTO registrations (user_id, activity_id) VALUES ($1, $2) RETURNING *',
            [user_id, id]
        );

        res.json({ message: "Joined successfully! 🎉", registration: newRegistration.rows[0] });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: "You have already joined this event!" });
        }
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// --- GET MY EVENTS (Unchanged) ---
const getMyEvents = async (req, res) => {
    const user_id = req.user.user_id; 

    try {
        const query = `
            SELECT a.*, r.registered_at 
            FROM activities a
            JOIN registrations r ON a.id = r.activity_id
            WHERE r.user_id = $1
            ORDER BY a.event_date ASC
        `;
        
        const myEvents = await pool.query(query, [user_id]);
        res.json(myEvents.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

module.exports = { 
    getAllEvents, 
    createEvent, 
    joinEvent, 
    getMyEvents, 
    deleteEvent,
    getPendingEvents, // NEW
    approveEvent      // NEW
};