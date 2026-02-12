/**
 * =============================================================================
 * MyNaati Backend — SystemValue Model (tblSystemValue)
 * =============================================================================
 * 
 * Database operations for the tblSystemValue table.
 * Stores system-wide configuration key-value pairs used by the Home module
 * (diagnostics, about page content, etc.).
 */

const { query, sql } = require('../config/database');

/**
 * Get all system configuration values.
 * Used on the admin diagnostics page and for application configuration.
 * 
 * @returns {Promise<Object[]>} Array of system value records
 */
async function getAll() {
    const result = await query('SELECT * FROM tblSystemValue ORDER BY SystemValueId');
    return result.recordset;
}

/**
 * Get a specific system value by its key/name.
 * 
 * @param {string} key - The system value name/key to look up
 * @returns {Promise<Object|null>} The system value record or null
 */
async function getByKey(key) {
    const result = await query(
        `SELECT * FROM tblSystemValue WHERE Name = @key`,
        { key: { type: sql.NVarChar, value: key } }
    );
    return result.recordset[0] || null;
}

module.exports = {
    getAll,
    getByKey,
};
