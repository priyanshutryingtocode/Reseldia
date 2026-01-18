const pool = require('../../db');

const getActivePoll = async (req, res) => {
    try {
        // Get the most recent active poll
        const pollRes = await pool.query("SELECT * FROM polls WHERE is_active = true ORDER BY created_at DESC LIMIT 1");
        
        if (pollRes.rows.length === 0) return res.json(null);
        
        const poll = pollRes.rows[0];
        
        // Get options for this poll
        const optionsRes = await pool.query("SELECT * FROM poll_options WHERE poll_id = $1 ORDER BY id ASC", [poll.id]);
        
        // Check if current user voted
        const voteRes = await pool.query("SELECT option_id FROM poll_votes WHERE poll_id = $1 AND user_id = $2", [poll.id, req.user.user_id]);
        
        res.json({
            ...poll,
            options: optionsRes.rows,
            userVotedOptionId: voteRes.rows.length > 0 ? voteRes.rows[0].option_id : null
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

const votePoll = async (req, res) => {
    const { pollId, optionId } = req.body;
    const userId = req.user.user_id;

    try {
        // Record vote
        await pool.query("INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES ($1, $2, $3)", [pollId, optionId, userId]);
        
        // Increment count
        await pool.query("UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = $1", [optionId]);
        
        res.json({ message: "Vote recorded!" });
    } catch (err) {
        res.status(400).json({ error: "Already voted or invalid poll" });
    }
};

module.exports = { getActivePoll, votePoll };