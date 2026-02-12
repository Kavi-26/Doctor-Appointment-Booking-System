const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { createNotification } = require('../services/notificationService');
require('dotenv').config();

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ─── Patient Registration ─────────────────────────────
exports.patientRegister = async (req, res) => {
    try {
        const { name, email, phone, password, age, gender } = req.body;

        // Check if email exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert
        const [result] = await db.execute(
            'INSERT INTO users (name, email, phone, password_hash, age, gender) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone, password_hash, age, gender.toLowerCase()]
        );

        // Generate token
        const token = generateToken({ id: result.insertId, email, role: 'patient' });

        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            token,
            user: { id: result.insertId, name, email, phone, age, gender, role: 'patient' }
        });
    } catch (error) {
        console.error('Patient Registration Error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

// ─── Patient Login ────────────────────────────────────
exports.patientLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken({ id: user.id, email: user.email, role: 'patient' });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id, name: user.name, email: user.email,
                phone: user.phone, age: user.age, gender: user.gender,
                profile_image: user.profile_image, role: 'patient'
            }
        });
    } catch (error) {
        console.error('Patient Login Error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

// ─── Doctor Registration ──────────────────────────────
exports.doctorRegister = async (req, res) => {
    try {
        const { name, email, phone, password, qualification, specialization, experience, license_number, consultation_fee, bio } = req.body;

        // Check if email exists
        const [existing] = await db.execute('SELECT id FROM doctors WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        // Check license number
        const [existingLicense] = await db.execute('SELECT id FROM doctors WHERE license_number = ?', [license_number]);
        if (existingLicense.length > 0) {
            return res.status(409).json({ success: false, message: 'License number already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const [result] = await db.execute(
            `INSERT INTO doctors (name, email, phone, password_hash, qualification, specialization, experience, license_number, consultation_fee, bio) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone, password_hash, qualification, specialization, experience || 0, license_number, consultation_fee || 0, bio || '']
        );

        // Notify admins about new registration
        const [admins] = await db.execute('SELECT id FROM admins');
        for (const admin of admins) {
            await createNotification(admin.id, 'admin', 'New Doctor Registration',
                `Dr. ${name} (${specialization}) has registered and awaits approval.`, 'approval');
        }

        res.status(201).json({
            success: true,
            message: 'Registration submitted! Your account will be active after admin approval.',
            doctor: { id: result.insertId, name, email, specialization, is_approved: false }
        });
    } catch (error) {
        console.error('Doctor Registration Error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

// ─── Doctor Login ─────────────────────────────────────
exports.doctorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [doctors] = await db.execute('SELECT * FROM doctors WHERE email = ?', [email]);
        if (doctors.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const doctor = doctors[0];

        if (!doctor.is_approved) {
            return res.status(403).json({ success: false, message: 'Account not yet approved by admin. Please wait.' });
        }

        if (!doctor.is_active) {
            return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
        }

        const validPassword = await bcrypt.compare(password, doctor.password_hash);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken({ id: doctor.id, email: doctor.email, role: 'doctor' });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: doctor.id, name: doctor.name, email: doctor.email,
                phone: doctor.phone, qualification: doctor.qualification,
                specialization: doctor.specialization, experience: doctor.experience,
                consultation_fee: doctor.consultation_fee, profile_image: doctor.profile_image,
                role: 'doctor'
            }
        });
    } catch (error) {
        console.error('Doctor Login Error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

// ─── Admin Login ──────────────────────────────────────
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [admins] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
        if (admins.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const admin = admins[0];
        const validPassword = await bcrypt.compare(password, admin.password_hash);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken({ id: admin.id, email: admin.email, role: 'admin' });

        res.json({
            success: true,
            message: 'Admin login successful',
            token,
            user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' }
        });
    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

// ─── Get Current User (verify token) ──────────────────
exports.getCurrentUser = async (req, res) => {
    try {
        const { id, role } = req.user;
        let user;

        if (role === 'patient') {
            const [rows] = await db.execute(
                'SELECT id, name, email, phone, age, gender, profile_image, is_active, created_at FROM users WHERE id = ?', [id]
            );
            user = rows[0];
        } else if (role === 'doctor') {
            const [rows] = await db.execute(
                'SELECT id, name, email, phone, qualification, specialization, experience, consultation_fee, bio, profile_image, is_approved, is_active, rating_avg, total_reviews, created_at FROM doctors WHERE id = ?', [id]
            );
            user = rows[0];
        } else if (role === 'admin') {
            const [rows] = await db.execute(
                'SELECT id, name, email, role, created_at FROM admins WHERE id = ?', [id]
            );
            user = rows[0];
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.role = role;
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get Current User Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get user' });
    }
};
