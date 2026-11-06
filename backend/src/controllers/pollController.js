const pool = require('../../db');

const getActivePoll = async (req, res) => {
    try {
        const pollRes = await pool.query("SELECT * FROM polls WHERE is_active = true ORDER BY created_at DESC LIMIT 1");

        if (pollRes.rows.length === 0) return res.json(null);

        const poll = pollRes.rows[0];

        const optionsRes = await pool.query("SELECT * FROM poll_options WHERE poll_id = $1 ORDER BY id ASC", [poll.id]);

        const voteRes = await pool.query("SELECT option_id FROM poll_votes WHERE poll_id = $1 AND user_id = $2", [poll.id, req.user.user_id]);

        res.json({
            ...poll,
            options: optionsRes.rows,
            userVotedOptionId: voteRes.rows.length > 0 ? voteRes.rows[0].option_id : null
        });
    } catch (err) {
        console.error('Failed to load active poll:', err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const votePoll = async (req, res) => {
    const { pollId, optionId } = req.body || {};
    const userId = req.user.user_id;

    if (!Number.isInteger(Number(pollId)) || !Number.isInteger(Number(optionId))) {
        return res.status(400).json({ error: "A valid poll and option are required." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const pollRes = await client.query(
            "SELECT id FROM polls WHERE id = $1 AND is_active = true FOR UPDATE",
            [pollId]
        );
        if (pollRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "This poll is no longer available." });
        }

        const optionRes = await client.query(
            "SELECT id FROM poll_options WHERE id = $1 AND poll_id = $2",
            [optionId, pollId]
        );
        if (optionRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "That option does not belong to this poll." });
        }

        await client.query(
            "INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES ($1, $2, $3)",
            [pollId, optionId, userId]
        );

        await client.query(
            `UPDATE poll_options
             SET vote_count = (SELECT COUNT(*)::int FROM poll_votes WHERE option_id = $1)
             WHERE id = $1`,
            [optionId]
        );

        await client.query('COMMIT');
        res.json({ message: "Vote recorded!" });
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') {
            return res.status(400).json({ error: "You have already voted on this poll." });
        }
        console.error('Failed to record vote:', err.message);
        res.status(500).json({ error: "Server error" });
    } finally {
        client.release();
    }
};

module.exports = { getActivePoll, votePoll };
