import config from './config/config.js';
import app from './app.js';
import mongoose from 'mongoose';

// Connect to MongoDB and start the server
const startServer = async () => {
    try {
        if (!config.mongoUri) {
            throw new Error('MONGODB_URI is not configured');
        }

        app.listen(config.port, () => {
            console.log(`Server started on port ${config.port}`);
        });

        await mongoose.connect(config.mongoUri);
        console.log('Connected to Nolana Database!');

    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
};

startServer();