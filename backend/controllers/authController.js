const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../middleware/auth');
const { validateEmail, validatePhone, validatePassword } = require('../middleware/validate');

// ============================================
// PATIENT REGISTRATION
// ============================================
const patientRegister = async (req, res) => {
    try {
        const { name, email, phone, password, age, gender } = req.body;

        // Validate
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, phone, and password are required.' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }
        if (!validatePhone(phone)) {
            return res.status(400).json({ success: false, message: 'Invalid phone number.' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        // Check if email already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert patient
        const [result] = await db.query(
            'INSERT INTO users (name, email, phone, password_hash, age, gender) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone, password_hash, age || null, gender || 'Other']
        );

        // Generate token
        const token = generateToken({ id: result.insertId, email, role: 'patient' });

        res.status(201).json({
            success: true,
            message: 'Patient registered successfully.',
            data: { id: result.insertId, name, email, token }
        });
    } catch (error) {
        console.error('Patient register error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

// ============================================
// PATIENT LOGIN
// ============================================
const patientLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        // Find patient
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = users[0];

        // Check if active
        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Generate token
        const token = generateToken({ id: user.id, email: user.email, role: 'patient' });

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                age: user.age,
                gender: user.gender,
                profile_image: user.profile_image,
                role: 'patient',
                token
            }
        });
    } catch (error) {
        console.error('Patient login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

// ============================================
// DOCTOR REGISTRATION
// ============================================
const doctorRegister = async (req, res) => {
    try {
        const { name, email, phone, password, qualification, specialization, experience, license_number, consultation_fee, bio } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !password || !qualification || !specialization || !license_number) {
            return res.status(400).json({ success: false, message: 'Name, email, phone, password, qualification, specialization, and license number are required.' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        // Check if email or license already exists
        const [existingEmail] = await db.query('SELECT id FROM doctors WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }
        const [existingLicense] = await db.query('SELECT id FROM doctors WHERE license_number = ?', [license_number]);
        if (existingLicense.length > 0) {
            return res.status(409).json({ success: false, message: 'License number already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert doctor (is_approved = false by default — requires admin approval)
        const [result] = await db.query(
            `INSERT INTO doctors (name, email, phone, password_hash, qualification, specialization, experience, license_number, consultation_fee, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone, password_hash, qualification, specialization, experience || 0, license_number, consultation_fee || 0, bio || '']
        );

        res.status(201).json({
            success: true,
            message: 'Doctor registered successfully. Awaiting admin approval.',
            data: { id: result.insertId, name, email, status: 'pending_approval' }
        });
    } catch (error) {
        console.error('Doctor register error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

// ============================================
// DOCTOR LOGIN
// ============================================
const doctorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const [doctors] = await db.query('SELECT * FROM doctors WHERE email = ?', [email]);
        if (doctors.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const doctor = doctors[0];

        if (!doctor.is_approved) {
            return res.status(403).json({ success: false, message: 'Account not yet approved by admin.' });
        }
        if (!doctor.is_active) {
            return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
        }

        const isMatch = await bcrypt.compare(password, doctor.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = generateToken({ id: doctor.id, email: doctor.email, role: 'doctor' });

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                id: doctor.id,
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                qualification: doctor.qualification,
                specialization: doctor.specialization,
                experience: doctor.experience,
                consultation_fee: doctor.consultation_fee,
                profile_image: doctor.profile_image,
                role: 'doctor',
                token
            }
        });
    } catch (error) {
        console.error('Doctor login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

// ============================================
// ADMIN LOGIN
// ============================================
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (admins.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const admin = admins[0];

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = generateToken({ id: admin.id, email: admin.email, role: 'admin' });

        res.json({
            success: true,
            message: 'Admin login successful.',
            data: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: 'admin',
                token
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

module.exports = {
    patientRegister,
    patientLogin,
    doctorRegister,
    doctorLogin,
    adminLogin
};
