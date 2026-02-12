/**
 * =============================================================================
 * MyNaati Backend — SecurityRole Model (tblSecurityRole + tblUserRole)
 * =============================================================================
 * 
 * Database operations for user roles and permissions.
 * tblSecurityRole stores role definitions.
 * tblUserRole links users to their assigned roles.
 * 
 * Used by the RBAC middleware to enforce role-based access control.
 */

const { query, sql } = require('../config/database');

/**
 * Get all roles assigned to a specific user.
 * Joins tblUserRole with tblSecurityRole to get role names.
 * 
 * @param {number} userId - The UserId from tblUser
 * @returns {Promise<string[]>} Array of role names (e.g., ['Admin', 'Examiner'])
 */
async function getUserRoles(userId) {
    const result = await query(
        `SELECT sr.Name
     FROM tblUserRole ur
     INNER JOIN tblSecurityRole sr ON ur.SecurityRoleId = sr.SecurityRoleId
     WHERE ur.UserId = @userId`,
        { userId: { type: sql.Int, value: userId } }
    );
    return result.recordset.map((row) => row.Name);
}

/**
 * Assign a role to a user.
 * 
 * @param {number} userId - The UserId
 * @param {number} roleId - The SecurityRoleId to assign
 */
async function assignRole(userId, roleId) {
    await query(
        `IF NOT EXISTS (
       SELECT 1 FROM tblUserRole WHERE UserId = @userId AND SecurityRoleId = @roleId
     )
     INSERT INTO tblUserRole (UserId, SecurityRoleId) VALUES (@userId, @roleId)`,
        {
            userId: { type: sql.Int, value: userId },
            roleId: { type: sql.Int, value: roleId },
        }
    );
}

/**
 * Get all available security roles.
 * Used on admin pages for role assignment UI.
 * 
 * @returns {Promise<Object[]>} Array of role records { SecurityRoleId, Name }
 */
async function getAllRoles() {
    const result = await query('SELECT SecurityRoleId, Name FROM tblSecurityRole ORDER BY Name');
    return result.recordset;
}

/**
 * Remove a role from a user.
 * 
 * @param {number} userId - The UserId
 * @param {number} roleId - The SecurityRoleId to remove
 */
async function removeRole(userId, roleId) {
    await query(
        'DELETE FROM tblUserRole WHERE UserId = @userId AND SecurityRoleId = @roleId',
        {
            userId: { type: sql.Int, value: userId },
            roleId: { type: sql.Int, value: roleId },
        }
    );
}

module.exports = {
    getUserRoles,
    assignRole,
    getAllRoles,
    removeRole,
};
