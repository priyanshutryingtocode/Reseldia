module.exports = function (req, res, next) {
    // Check if the role attached to req.user is 'admin'
    // Note: We use 403 Forbidden for "Authorized but not allowed"
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Access denied. Admins only." });
    }
    next();
};