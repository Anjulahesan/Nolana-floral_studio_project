import express from 'express';

const app = express();

// Middleware
app.use(express.json());

// Base Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Nolana Floral Studio API!'
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ "error": `${err.name}: ${err.message}` });
    } else if (err) {
        console.error(err);
        return res.status(400).json({ "error": `${err.name}: ${err.message}` });
    }
    next();
});

export default app;
