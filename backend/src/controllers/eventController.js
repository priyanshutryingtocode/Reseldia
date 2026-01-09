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

module.exports = { getAllEvents, createEvent, joinEvent };



