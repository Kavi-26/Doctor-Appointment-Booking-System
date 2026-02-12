/**
 * Input Validation Helpers
 */

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePhone = (phone) => {
    const re = /^[\d\s\-\+\(\)]{7,15}$/;
    return re.test(phone);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

/**
 * Middleware: Validate required fields
 * Usage: validateRequired(['name', 'email', 'password'])
 */
const validateRequired = (fields) => {
    return (req, res, next) => {
        const missing = [];
        for (const field of fields) {
            if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Middleware: Validate patient registration
 */
const validatePatientRegistration = (req, res, next) => {
    const { name, email, phone, password, age, gender } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
    if (!validateEmail(email)) errors.push('Invalid email address');
    if (!validatePhone(phone)) errors.push('Invalid phone number');
    if (!validatePassword(password)) errors.push('Password must be at least 6 characters');
    if (!age || age < 1 || age > 150) errors.push('Invalid age');
    if (!gender || !['male', 'female', 'other'].includes(gender.toLowerCase())) {
        errors.push('Gender must be male, female, or other');
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors.join('; ') });
    }

    next();
};

/**
 * Middleware: Validate doctor registration
 */
const validateDoctorRegistration = (req, res, next) => {
    const { name, email, phone, password, qualification, specialization, experience, license_number } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
    if (!validateEmail(email)) errors.push('Invalid email address');
    if (!validatePhone(phone)) errors.push('Invalid phone number');
    if (!validatePassword(password)) errors.push('Password must be at least 6 characters');
    if (!qualification || qualification.trim().length < 2) errors.push('Qualification is required');
    if (!specialization || specialization.trim().length < 2) errors.push('Specialization is required');
    if (experience === undefined || experience < 0) errors.push('Valid experience is required');
    if (!license_number || license_number.trim().length < 2) errors.push('License number is required');

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors.join('; ') });
    }

    next();
};

/**
 * Middleware: Sanitize inputs (basic XSS protection)
 */
const sanitizeInputs = (req, res, next) => {
    const sanitize = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[<>]/g, '').trim();
    };

    if (req.body) {
        for (const key of Object.keys(req.body)) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitize(req.body[key]);
            }
        }
    }

    next();
};

module.exports = {
    validateEmail,
    validatePhone,
    validatePassword,
    validateRequired,
    validatePatientRegistration,
    validateDoctorRegistration,
    sanitizeInputs
};
