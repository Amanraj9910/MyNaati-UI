const { query, sql } = require('../config/database');

/**
 * Calls the 'GetSingleKey' stored procedure to generate a new unique key.
 * Used for generating 'NaatiNumber'.
 * 
 * @param {string} tableName - The key name in tblTableData (e.g. 'PersonNaatiNumber')
 * @returns {Promise<number>} The next available key
 */
async function getNextNaatiNumber() {
    try {
        const pool = await sql.connect();

        // Execute Stored Procedure
        const result = await pool.request()
            .input('TableName', sql.VarChar(50), 'PersonNaatiNumber')
            .output('NextKey', sql.Int)
            .execute('GetSingleKey');

        return result.output.NextKey;
    } catch (error) {
        console.error('Error generating NaatiNumber:', error);
        throw error;
    }
}

module.exports = {
    getNextNaatiNumber
};
