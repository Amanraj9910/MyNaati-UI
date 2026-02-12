/**
 * =============================================================================
 * MyNaati Backend — Server Entry Point
 * =============================================================================
 * 
 * Loads environment variables and starts the Express server.
 * This is the main entry point for the Node.js backend application.
 */

require('dotenv').config();
const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

/**
 * Start the server after establishing database connection
 */
async function startServer() {
    try {
        // Verify database connection on startup
        await connectDatabase();
        logger.info('✅ Azure SQL Database connected successfully');

        app.listen(PORT, () => {
            logger.info(`🚀 MyNaati API server running on port ${PORT}`);
            logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        logger.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
