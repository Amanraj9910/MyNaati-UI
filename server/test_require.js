try {
    console.log('Loading AuthService...');
    const AuthService = require('./src/services/auth.service');
    console.log('AuthService loaded successfully.');

    console.log('Loading UserModel...');
    const UserModel = require('./src/models/User');
    console.log('UserModel loaded successfully.');

    console.log('Loading Database Config...');
    const config = require('./src/config/database').config;
    console.log('Database Config loaded successfully.');

} catch (error) {
    console.error('Error loading modules:', error);
}
