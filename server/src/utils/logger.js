/**
 * =============================================================================
 * MyNaati Backend — Winston Logger
 * =============================================================================
 * 
 * Centralized logging utility using Winston.
 * Outputs to console in development, and can be extended with file/cloud
 * transports for production.
 */

const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.colorize(),
        format.printf(({ timestamp, level, message, stack }) => {
            return stack
                ? `${timestamp} [${level}]: ${message}\n${stack}`
                : `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
    ],
});

module.exports = logger;
