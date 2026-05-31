const pool = require('../../db');

const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const canManageActivity = (activity, user) => {
    return user.role === 'admin' || activity.organizer_id === user.user_id;
};

const getAllEvents = async (req, res) => {
    try {
        const allEvents = await pool.query(
            "SELECT * FROM activities WHERE status = 'approved' ORDER BY event_date ASC"
        );
        res.json(allEvents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getEventById = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM activities WHERE id = $1 AND status = 'approved'",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const createEvent = async (req, res) => {
    const { title, description, event_date, venue, capacity, category } = req.body;
    const { user_id, role } = req.user;

    if (!title?.trim() || !event_date || !venue?.trim()) {
        return res.status(400).json({ message: "Title, date, and venue are required." });
    }

    if (!isPositiveInteger(capacity)) {
        return res.status(400).json({ message: "Capacity must be a positive number." });
    }

    try {
        const initialStatus = role === 'admin' ? 'approved' : 'pending';

        const newEvent = await pool.query(
            `INSERT INTO activities
            (title, description, event_date, venue, capacity, organizer_id, status, category)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                title.trim(),
                description?.trim() || '',
                event_date,
                venue.trim(),
                Number(capacity),
                user_id,
                initialStatus,
                category?.trim() || 'General'
            ]
        );

        res.status(201).json({
            message: initialStatus === 'pending'
                ? "Event submitted and waiting for admin approval."
                : "Event created and published.",
            event: newEvent.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const deleteEvent = async (req, res) => {
    const { id } = req.params;

    try {
        const eventCheck = await pool.query('SELECT * FROM activities WHERE id = $1', [id]);

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (!canManageActivity(eventCheck.rows[0], req.user)) {
            return res.status(403).json({ message: "You are not authorized to delete this event." });
        }

        await pool.query('DELETE FROM activities WHERE id = $1', [id]);
        res.json({ message: "Event deleted successfully." });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
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
        res.status(500).json({ error: "Server error" });
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

        res.json({ message: "Event approved.", event: result.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const joinEvent = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const eventRes = await client.query(
            `SELECT a.*,
                (SELECT COUNT(*)::int FROM registrations r WHERE r.activity_id = a.id) AS attendee_count
             FROM activities a
             WHERE a.id = $1 AND a.status = 'approved'
             FOR UPDATE`,
            [id]
        );

        if (eventRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Event not found" });
        }

        const activity = eventRes.rows[0];
        if (activity.attendee_count >= activity.capacity) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: "This event is already full." });
        }

        const newRegistration = await client.query(
            'INSERT INTO registrations (user_id, activity_id) VALUES ($1, $2) RETURNING *',
            [userId, id]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: "Joined successfully.", registration: newRegistration.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') {
            return res.status(400).json({ message: "You have already joined this event." });
        }
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    } finally {
        client.release();
    }
};

const getMyEvents = async (req, res) => {
    try {
        const query = `
            SELECT a.*, r.registered_at
            FROM activities a
            JOIN registrations r ON a.id = r.activity_id
            WHERE r.user_id = $1
            ORDER BY a.event_date ASC
        `;

        const myEvents = await pool.query(query, [req.user.user_id]);
        res.json(myEvents.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getMyCreatedEvents = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM activities WHERE organizer_id = $1 ORDER BY created_at DESC',
            [req.user.user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getEventComments = async (req, res) => {
    try {
        const comments = await pool.query(
            `SELECT c.id, c.text, c.created_at, u.full_name
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.activity_id = $1
             ORDER BY c.created_at ASC`,
            [req.params.id]
        );
        res.json(comments.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const postComment = async (req, res) => {
    const text = req.body.text?.trim();
    if (!text) {
        return res.status(400).json({ message: "Comment text is required." });
    }

    try {
        const newComment = await pool.query(
            'INSERT INTO comments (activity_id, user_id, text) VALUES ($1, $2, $3) RETURNING *',
            [req.params.id, req.user.user_id, text]
        );

        const formattedComment = await pool.query(
             `SELECT c.id, c.text, c.created_at, u.full_name
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = $1`,
             [newComment.rows[0].id]
        );

        res.status(201).json(formattedComment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getEventAttendees = async (req, res) => {
    try {
        const eventCheck = await pool.query('SELECT * FROM activities WHERE id = $1', [req.params.id]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (!canManageActivity(eventCheck.rows[0], req.user)) {
            return res.status(403).json({ message: "You are not authorized to view this guest list." });
        }

        const attendees = await pool.query(
            `SELECT u.full_name, u.email, u.flat_number
             FROM registrations r
             JOIN users u ON r.user_id = u.id
             WHERE r.activity_id = $1`,
            [req.params.id]
        );
        res.json(attendees.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    joinEvent,
    getMyEvents,
    deleteEvent,
    getPendingEvents,
    approveEvent,
    getMyCreatedEvents,
    getEventComments,
    postComment,
    getEventAttendees
};
