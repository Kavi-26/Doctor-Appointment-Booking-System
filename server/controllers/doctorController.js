const db = require('../config/db');

exports.getAllDoctors = async (req, res) => {
    try {
        const query = `
            SELECT d.id, d.specialization, d.experience, d.consultation_fee, d.bio,
                   u.name, u.email, u.phone, u.gender
            FROM doctors d
            JOIN users u ON d.user_id = u.id
        `;
        const [doctors] = await db.execute(query);
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getDoctorById = async (req, res) => {
    try {
        const query = `
            SELECT d.id, d.specialization, d.experience, d.consultation_fee, d.bio,
                   u.name, u.email, u.phone, u.gender
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        `;
        const [doctors] = await db.execute(query, [req.params.id]);

        if (doctors.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json(doctors[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createDoctorProfile = async (req, res) => {
    try {
        // Assume req.user.id is the user ID from auth middleware
        const { specialization, experience, consultation_fee, bio } = req.body;
        const userId = req.user.id;

        // Check if profile already exists
        const [existing] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Doctor profile already exists' });
        }

        await db.execute(
            'INSERT INTO doctors (user_id, specialization, experience, consultation_fee, bio) VALUES (?, ?, ?, ?, ?)',
            [userId, specialization, experience, consultation_fee, bio]
        );

        res.status(201).json({ message: 'Doctor profile created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
