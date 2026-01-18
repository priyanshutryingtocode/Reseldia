const pool = require('../../db');


const getAllEvents = async (req, res) => {
    try {

        const allEvents = await pool.query(
            "SELECT * FROM activities WHERE status = 'approved' ORDER BY event_date ASC"
        );
        res.json(allEvents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

const createEvent = async (req, res) => {
    const { title, description, event_date, venue, capacity } = req.body;
    
    const { user_id, role } = req.user; 

    try {

        const initialStatus = role === 'admin' ? 'approved' : 'pending';

        const newEvent = await pool.query(
            `INSERT INTO activities 
            (title, description, event_date, venue, capacity, organizer_id, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [title, description, event_date, venue, capacity, user_id, initialStatus]
        );

        const createdActivity = newEvent.rows[0];

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

const deleteEvent = async (req, res) => {
    const { id } = req.params;
    const { user_id, role } = req.user;

    try {

        const eventCheck = await pool.query('SELECT * FROM activities WHERE id = $1', [id]);

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        const activity = eventCheck.rows[0];

        const isAdmin = role === 'admin';
        const isOwner = activity.organizer_id === user_id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: "You are not authorized to delete this event." });
        }

        await pool.query('DELETE FROM activities WHERE id = $1', [id]);
        res.json({ message: "Event deleted successfully! 🗑️" });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

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

const getMyCreatedEvents = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        
        const result = await pool.query(
            'SELECT * FROM activities WHERE organizer_id = $1 ORDER BY created_at DESC',
            [user_id]
        );

        res.json(result.rows);
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
    getPendingEvents, 
    approveEvent,
    getMyCreatedEvents 
};