const pool = require('../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const { full_name, email, password, flat_number } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!full_name?.trim() || !normalizedEmail || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    try {
        const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ error: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'INSERT INTO users (full_name, email, password_hash, flat_number, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role',
            [full_name.trim(), normalizedEmail, hashedPassword, flat_number?.trim() || null, 'resident']
        );

        res.status(201).json({ message: "Registration successful.", user: newUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { user_id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            role: user.rows[0].role,
            user: {
                id: user.rows[0].id,
                full_name: user.rows[0].full_name,
                email: user.rows[0].email
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await pool.query(
            'SELECT id, full_name, email, flat_number, role FROM users WHERE id = $1',
            [req.user.user_id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { registerUser, loginUser, getMe };
