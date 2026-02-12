const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        const email = 'admin@example.com';
        const password = 'adminpassword';
        const name = 'System Admin';

        // Check if exists
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'admin']
        );

        console.log('Admin created successfully');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

createAdmin();
