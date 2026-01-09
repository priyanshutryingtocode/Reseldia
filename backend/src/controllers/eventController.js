const pool = require('../../db');


const getAllEvents = async (req, res) => {
    try {
        const allEvents = await pool.query('SELECT * FROM activities ORDER BY event_date ASC');
        res.json(allEvents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};


const createEvent = async (req, res) => {
    const { title, description, event_date, venue, capacity } = req.body;
    
    const organizer_id = req.user.user_id; 

    try {
        const newEvent = await pool.query(
            'INSERT INTO activities (title, description, event_date, venue, capacity, organizer_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, event_date, venue, capacity, organizer_id]
        );

        res.json(newEvent.rows[0]);
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


const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        // Ideally, check if req.user.user_id === organizer_id before deleting
        // For now, we will allow it to keep it simple.
        await pool.query('DELETE FROM activities WHERE id = $1', [id]);
        res.json({ message: "Event deleted!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

module.exports = { getAllEvents, createEvent, joinEvent, getMyEvents, deleteEvent };






