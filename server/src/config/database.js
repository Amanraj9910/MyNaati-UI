/**
 * =============================================================================
 * MyNaati Backend — Azure SQL Database Configuration
 * =============================================================================
 * 
 * Creates and manages a connection pool to the Azure SQL database using the
 * `mssql` package. Provides helper functions for executing queries.
 * 
 * Tables accessed across the application:
 *   - tblEntity, tblPerson, tblPersonName (Entity & Person Management)
 *   - tblUser, tblMyNaatiUser (Security & Access Control)
 *   - tblSecurityRole, tblUserRole (Role Management)
 *   - tblSystemValue (System Configuration)
 */

const sql = require('mssql');
const logger = require('../utils/logger');

/**
 * Azure SQL connection configuration
 * Uses environment variables for all sensitive values.
 * Encryption is required for Azure SQL Managed Instance connections.
 */
const dbConfig = {
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: true,                    // Required for Azure SQL
        trustServerCertificate: true,     // Required for Azure SQL MI
        enableArithAbort: true,           // Recommended for Azure SQL
        connectionTimeout: 30000,         // 30 seconds connection timeout
        requestTimeout: 30000,            // 30 seconds per-request timeout
    },
    pool: {
        min: 2,                           // Minimum pool connections
        max: 10,                          // Maximum pool connections
        idleTimeoutMillis: 30000,         // Close idle connections after 30s
    },
};

/** Singleton connection pool instance */
let pool = null;

/**
 * Connect to the Azure SQL database and return the connection pool.
 * Creates a new pool if one doesn't exist, otherwise returns the existing one.
 * 
 * @returns {Promise<sql.ConnectionPool>} The active connection pool
 * @throws {Error} If connection fails
 */
async function connectDatabase() {
    try {
        if (!pool) {
            pool = await sql.connect(dbConfig);
            logger.info(`Connected to database: ${dbConfig.database} on ${dbConfig.server}:${dbConfig.port}`);
        }
        return pool;
    } catch (error) {
        logger.error('Database connection failed:', error.message);
        throw error;
    }
}

/**
 * Get the active connection pool.
 * Automatically connects if pool is not yet initialized.
 * 
 * @returns {Promise<sql.ConnectionPool>} The active connection pool
 */
async function getPool() {
    if (!pool) {
        await connectDatabase();
    }
    return pool;
}

/**
 * Execute a parameterized SQL query against the database.
 * Uses prepared statements to prevent SQL injection.
 * 
 * @param {string} queryText - The SQL query string with @param placeholders
 * @param {Object} [params={}] - Key-value pairs of parameter names and their values
 *                                 Each value should be { type: sql.Int, value: 123 }
 * @returns {Promise<sql.IResult>} The query result set
 * 
 * @example
 *   const result = await query(
 *     'SELECT * FROM tblUser WHERE UserId = @userId',
 *     { userId: { type: sql.Int, value: 42 } }
 *   );
 */
async function query(queryText, params = {}) {
    const dbPool = await getPool();
    const request = dbPool.request();

    // Bind all parameters to the request
    for (const [key, param] of Object.entries(params)) {
        request.input(key, param.type, param.value);
    }

    return request.query(queryText);
}

/**
 * Close the database connection pool gracefully.
 * Should be called during application shutdown.
 */
async function closeDatabase() {
    if (pool) {
        await pool.close();
        pool = null;
        logger.info('Database connection pool closed');
    }
}

// Export mssql types for use in model parameter definitions
module.exports = {
    connectDatabase,
    getPool,
    query,
    closeDatabase,
    sql,  // Export sql types (sql.Int, sql.NVarChar, etc.)
};
