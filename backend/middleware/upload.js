const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '..', 'uploads');
const profileDir = path.join(uploadDir, 'profiles');
const prescriptionDir = path.join(uploadDir, 'prescriptions');

[uploadDir, profileDir, prescriptionDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'profile_image') {
            cb(null, profileDir);
        } else if (file.fieldname === 'prescription') {
            cb(null, prescriptionDir);
        } else {
            cb(null, uploadDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) and PDFs are allowed.'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    }
});

module.exports = upload;
