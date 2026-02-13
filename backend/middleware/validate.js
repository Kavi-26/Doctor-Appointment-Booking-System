// Input validation helpers

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePhone = (phone) => {
    const re = /^[+]?[\d\s-]{10,15}$/;
    return re.test(phone);
};

const validatePassword = (password) => {
    // Minimum 6 characters
    return password && password.length >= 6;
};

const validateRequired = (fields, body) => {
    const missing = [];
    for (const field of fields) {
        if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
            missing.push(field);
        }
    }
    return missing;
};

// Middleware factory for validating required fields
const requireFields = (...fields) => {
    return (req, res, next) => {
        const missing = validateRequired(fields, req.body);
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.join(', ')}`
            });
        }
        next();
    };
};

// Sanitize string input (basic XSS prevention)
const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[<>]/g, '').trim();
};

// Sanitize all string fields in request body
const sanitizeBody = (req, res, next) => {
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
    requireFields,
    sanitize,
    sanitizeBody
};
