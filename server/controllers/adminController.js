const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [doctors] = await db.execute('SELECT COUNT(*) as count FROM doctors');
        const [appointments] = await db.execute('SELECT COUNT(*) as count FROM appointments');

        res.json({
            users: users[0].count,
            doctors: doctors[0].count,
            appointments: appointments[0].count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, role, phone FROM users');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
