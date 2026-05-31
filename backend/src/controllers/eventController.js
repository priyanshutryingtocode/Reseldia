const pool = require('../../db');

const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;
const canManageActivity = (activity, user) => user.role === 'admin' || activity.organizer_id === user.user_id;

const eventSelect = `
    SELECT a.*,
        COALESCE(COUNT(DISTINCT r.user_id), 0)::int AS attendee_count
    FROM activities a
    LEFT JOIN registrations r ON r.activity_id = a.id
`;

const createNotification = async (client, { userId, type, title, message, activityId = null }) => {
    await client.query(
        `INSERT INTO notifications (user_id, type, title, message, activity_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, type, title, message, activityId]
    );
};

const getAllEvents = async (req, res) => {
    const userId = req.user?.user_id || null;

    try {
        const allEvents = await pool.query(
            `${eventSelect}
             WHERE a.status = 'approved'
             GROUP BY a.id
             ORDER BY a.event_date ASC`
        );

        if (!userId) return res.json(allEvents.rows);

        const bookmarks = await pool.query(
            'SELECT activity_id FROM event_bookmarks WHERE user_id = $1',
            [userId]
        );
        const bookmarkedIds = new Set(bookmarks.rows.map(row => row.activity_id));

        res.json(allEvents.rows.map(event => ({
            ...event,
            is_bookmarked: bookmarkedIds.has(event.id)
        })));
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getEventById = async (req, res) => {
    try {
        const result = await pool.query(
            `${eventSelect}
             WHERE a.id = $1 AND (a.status = 'approved' OR a.organizer_id = $2 OR $3 = 'admin')
             GROUP BY a.id`,
            [req.params.id, req.user.user_id, req.user.role]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        const bookmark = await pool.query(
            'SELECT 1 FROM event_bookmarks WHERE user_id = $1 AND activity_id = $2',
            [req.user.user_id, req.params.id]
        );

        res.json({ ...result.rows[0], is_bookmarked: bookmark.rows.length > 0 });
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
            event: { ...newEvent.rows[0], attendee_count: 0, is_bookmarked: false }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const updateEvent = async (req, res) => {
    const { title, description, event_date, venue, capacity, category } = req.body;

    if (!title?.trim() || !event_date || !venue?.trim()) {
        return res.status(400).json({ message: "Title, date, and venue are required." });
    }

    if (!isPositiveInteger(capacity)) {
        return res.status(400).json({ message: "Capacity must be a positive number." });
    }

    try {
        const eventCheck = await pool.query('SELECT * FROM activities WHERE id = $1', [req.params.id]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        const existing = eventCheck.rows[0];
        if (!canManageActivity(existing, req.user)) {
            return res.status(403).json({ message: "You are not authorized to edit this event." });
        }

        const nextStatus = req.user.role === 'admin' ? existing.status : 'pending';
        const result = await pool.query(
            `UPDATE activities
             SET title = $1, description = $2, event_date = $3, venue = $4, capacity = $5, category = $6, status = $7
             WHERE id = $8
             RETURNING *`,
            [
                title.trim(),
                description?.trim() || '',
                event_date,
                venue.trim(),
                Number(capacity),
                category?.trim() || 'General',
                nextStatus,
                req.params.id
            ]
        );

        res.json({
            message: nextStatus === 'pending' ? "Event updated and sent for admin approval." : "Event updated.",
            event: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const eventCheck = await pool.query('SELECT * FROM activities WHERE id = $1', [req.params.id]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (!canManageActivity(eventCheck.rows[0], req.user)) {
            return res.status(403).json({ message: "You are not authorized to delete this event." });
        }

        await pool.query('DELETE FROM activities WHERE id = $1', [req.params.id]);
        res.json({ message: "Event deleted successfully." });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getPendingEvents = async (req, res) => {
    try {
        const pendingEvents = await pool.query(
            `${eventSelect}
             WHERE a.status = 'pending'
             GROUP BY a.id
             ORDER BY a.event_date ASC`
        );
        res.json(pendingEvents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const approveEvent = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await client.query(
            "UPDATE activities SET status = 'approved' WHERE id = $1 RETURNING *",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Event not found" });
        }

        const activity = result.rows[0];
        await createNotification(client, {
            userId: activity.organizer_id,
            type: 'event_approved',
            title: 'Event approved',
            message: `${activity.title} is now live.`,
            activityId: activity.id
        });
        await client.query('COMMIT');

        res.json({ message: "Event approved.", event: activity });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    } finally {
        client.release();
    }
};

const rejectEvent = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await client.query(
            "UPDATE activities SET status = 'rejected' WHERE id = $1 RETURNING *",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Event not found" });
        }

        const activity = result.rows[0];
        await createNotification(client, {
            userId: activity.organizer_id,
            type: 'event_rejected',
            title: 'Event needs changes',
            message: `${activity.title} was rejected by an admin.`,
            activityId: activity.id
        });
        await client.query('COMMIT');

        res.json({ message: "Event rejected.", event: activity });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    } finally {
        client.release();
    }
};

const joinEvent = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const eventRes = await client.query(
            `SELECT a.*,
                (SELECT COUNT(*)::int FROM registrations r WHERE r.activity_id = a.id) AS attendee_count
             FROM activities a
             WHERE a.id = $1 AND a.status = 'approved'
             FOR UPDATE`,
            [req.params.id]
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
            [req.user.user_id, req.params.id]
        );

        if (activity.organizer_id !== req.user.user_id) {
            await createNotification(client, {
                userId: activity.organizer_id,
                type: 'event_joined',
                title: 'New RSVP',
                message: `Someone joined ${activity.title}.`,
                activityId: activity.id
            });
        }

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
        const myEvents = await pool.query(
            `${eventSelect}
             JOIN registrations mine ON mine.activity_id = a.id
             WHERE mine.user_id = $1
             GROUP BY a.id, mine.registered_at
             ORDER BY a.event_date ASC`,
            [req.user.user_id]
        );
        res.json(myEvents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getMyCreatedEvents = async (req, res) => {
    try {
        const result = await pool.query(
            `${eventSelect}
             WHERE a.organizer_id = $1
             GROUP BY a.id
             ORDER BY a.created_at DESC`,
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

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const eventRes = await client.query('SELECT * FROM activities WHERE id = $1', [req.params.id]);
        if (eventRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Event not found" });
        }

        const newComment = await client.query(
            'INSERT INTO comments (activity_id, user_id, text) VALUES ($1, $2, $3) RETURNING *',
            [req.params.id, req.user.user_id, text]
        );

        const formattedComment = await client.query(
             `SELECT c.id, c.text, c.created_at, u.full_name
              FROM comments c
              JOIN users u ON c.user_id = u.id
              WHERE c.id = $1`,
             [newComment.rows[0].id]
        );

        const activity = eventRes.rows[0];
        if (activity.organizer_id !== req.user.user_id) {
            await createNotification(client, {
                userId: activity.organizer_id,
                type: 'event_comment',
                title: 'New comment',
                message: `Someone commented on ${activity.title}.`,
                activityId: activity.id
            });
        }

        await client.query('COMMIT');
        res.status(201).json(formattedComment.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    } finally {
        client.release();
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

const toggleBookmark = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;

    try {
        const existing = await pool.query(
            'SELECT 1 FROM event_bookmarks WHERE user_id = $1 AND activity_id = $2',
            [userId, id]
        );

        if (existing.rows.length > 0) {
            await pool.query('DELETE FROM event_bookmarks WHERE user_id = $1 AND activity_id = $2', [userId, id]);
            return res.json({ bookmarked: false });
        }

        await pool.query('INSERT INTO event_bookmarks (user_id, activity_id) VALUES ($1, $2)', [userId, id]);
        res.status(201).json({ bookmarked: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getBookmarkedEvents = async (req, res) => {
    try {
        const result = await pool.query(
            `${eventSelect}
             JOIN event_bookmarks b ON b.activity_id = a.id
             WHERE b.user_id = $1
             GROUP BY a.id, b.created_at
             ORDER BY b.created_at DESC`,
            [req.user.user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getMyStats = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                (SELECT COUNT(*)::int FROM registrations WHERE user_id = $1) AS joined_count,
                (SELECT COUNT(*)::int FROM activities WHERE organizer_id = $1) AS created_count,
                (SELECT COUNT(*)::int FROM event_bookmarks WHERE user_id = $1) AS saved_count,
                (SELECT COUNT(*)::int FROM activities WHERE organizer_id = $1 AND status = 'approved') AS live_count,
                (SELECT COUNT(*)::int FROM activities WHERE organizer_id = $1 AND status = 'pending') AS pending_count`,
            [req.user.user_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    joinEvent,
    getMyEvents,
    deleteEvent,
    getPendingEvents,
    approveEvent,
    rejectEvent,
    getMyCreatedEvents,
    getEventComments,
    postComment,
    getEventAttendees,
    toggleBookmark,
    getBookmarkedEvents,
    getMyStats
};
