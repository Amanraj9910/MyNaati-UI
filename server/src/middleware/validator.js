/**
 * =============================================================================
 * MyNaati Backend — Request Validation Middleware
 * =============================================================================
 * 
 * Provides reusable input validation rules using express-validator.
 * Each validation set corresponds to a specific API endpoint.
 * 
 * The validate() middleware collects all validation errors and returns
 * them as a 400 Bad Request response.
 */

const { body, query, validationResult } = require('express-validator');

/**
 * Middleware that checks for validation errors from previous validation chains.
 * If errors are found, returns a 400 response with field-level error details.
 * 
 * Usage: Place AFTER validation rules in the middleware chain.
 *   router.post('/login', loginValidation, validate, loginHandler);
 */
function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
}

/**
 * Validation rules for POST /api/auth/login
 * Requires username and password fields.
 */
const loginValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ max: 50 }).withMessage('Username must be 50 characters or less'),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for POST /api/auth/register
 * Requires all registration fields with appropriate constraints.
 */
const registerValidation = [
    body('givenName')
        .trim()
        .notEmpty().withMessage('Given name is required')
        .isLength({ max: 100 }).withMessage('Given name must be 100 characters or less'),
    body('surname')
        .trim()
        .notEmpty().withMessage('Surname is required')
        .isLength({ max: 100 }).withMessage('Surname must be 100 characters or less'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
        .isLength({ max: 200 }).withMessage('Email must be 200 characters or less'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    body('confirmPassword')
        .notEmpty().withMessage('Password confirmation is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    body('dateOfBirth')
        .optional()
        .isISO8601().withMessage('Invalid date format (use YYYY-MM-DD)'),
    body('genderId')
        .optional()
        .custom((value) => {
            if (['M', 'F', 'O'].includes(value)) return true;
            throw new Error('Invalid gender selection');
        }),
];

/**
 * Validation rules for POST /api/auth/change-password
 * Requires current password and new password with confirmation.
 */
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    body('confirmNewPassword')
        .notEmpty().withMessage('Password confirmation is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
];

/**
 * Validation rules for POST /api/auth/forgot-password
 */
const forgotPasswordValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address'),
];

/**
 * Validation rules for POST /api/auth/reset-password
 */
const resetPasswordValidation = [
    body('token')
        .notEmpty().withMessage('Reset token is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    body('confirmNewPassword')
        .notEmpty().withMessage('Password confirmation is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
];

/**
 * Validation rules for admin user search
 */
const userSearchValidation = [
    query('q')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Search query too long'),
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

module.exports = {
    validate,
    loginValidation,
    registerValidation,
    changePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    userSearchValidation,
};
