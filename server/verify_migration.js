require('dotenv').config();
const { connectDatabase, sql } = require('./src/config/database');
const AuthService = require('./src/services/auth.service');
const UserModel = require('./src/models/User');

async function main() {
    try {
        console.log('Connecting to database...');
        await connectDatabase();
        console.log('Connected to database.');
        console.log('--- Starting Auth Migration Verification ---');

        const testEmail = `test.migra.${Date.now()}@example.com`;
        const testPassword = 'Password123!';

        // 1. Test Registration (ASP.NET Flow)
        console.log(`\n1. Registering new user: ${testEmail}`);
        const regResult = await AuthService.register({
            givenName: 'Migra',
            surname: 'Tester',
            email: testEmail,
            password: testPassword,
            dateOfBirth: '2000-01-01',
            genderId: 'M' // Assuming 'M' is valid for NChar(1)
        });

        console.log('✅ Registration result:', regResult);

        if (!regResult.user.NaatiNumber) {
            console.error('❌ Error: NaatiNumber is missing in registration result!');
        } else {
            console.log(`✅ Generated NaatiNumber: ${regResult.user.NaatiNumber}`);
        }

        // 2. Test Login (ASP.NET Flow)
        console.log(`\n2. Logging in with new user...`);
        const loginResult = await AuthService.login(testEmail, testPassword);

        console.log('✅ Login result:', {
            method: loginResult.method,
            userId: loginResult.user.UserId,
            naatiNumber: loginResult.user.NaatiNumber,
            role: loginResult.user.Role
        });

        if (loginResult.method !== 'ASP.NET') {
            console.error('❌ Error: Login method should be ASP.NET!');
        }

        if (loginResult.user.NaatiNumber !== regResult.user.NaatiNumber) {
            console.error('❌ Error: Login NaatiNumber matches Registration NaatiNumber!');
        }

        process.exit(0);

    } catch (e) {
        console.error('❌ Verification Failed:', e);
        process.exit(1);
    }
}

main();
