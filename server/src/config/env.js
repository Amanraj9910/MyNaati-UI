/**
 * =============================================================================
 * MyNaati Backend — Environment Configuration Loader
 * =============================================================================
 * 
 * Centralizes access to all environment variables with defaults.
 * Validates that required variables are present at startup.
 */

const config = {
    // Server settings
    port: parseInt(process.env.PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: (process.env.NODE_ENV || 'development') === 'development',

    // Database settings
    db: {
        server: process.env.DB_SERVER,
        port: parseInt(process.env.DB_PORT, 10) || 1433,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },

    // JWT settings
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    },

    // MFA settings
    mfa: {
        appName: process.env.MFA_APP_NAME || 'MyNaati',
    },
};

/**
 * Validate that all required environment variables are set.
 * Throws an error listing any missing variables.
 */
function validateEnv() {
    const required = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}. ` +
            'Please check your .env file.'
        );
    }
}

// Validate on module load
validateEnv();

module.exports = config;
