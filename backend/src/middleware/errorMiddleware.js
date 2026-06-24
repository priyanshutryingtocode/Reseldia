const notFound = (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const status = err.statusCode || err.status || 500;
    const message = status >= 500 ? "Server error" : err.message;

    console.error(`${req.method} ${req.originalUrl}`, err.message);
    res.status(status).json({ error: message });
};

module.exports = { notFound, errorHandler };
