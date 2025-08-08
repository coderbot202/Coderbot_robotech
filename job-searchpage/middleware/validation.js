// job-searchpage/middleware/validation.js
const { body, param, query } = require('express-validator');

const validation = {
    // User validation rules
    validateRegister: [
        body('name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Name can only contain letters and spaces'),
        
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        
        body('password')
            .isLength({ min: 6, max: 128 })
            .withMessage('Password must be between 6 and 128 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        
        body('role')
            .optional()
            .isIn(['user', 'employer', 'admin'])
            .withMessage('Invalid role specified')
    ],

    validateLogin: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],

    validateChangePassword: [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        
        body('newPassword')
            .isLength({ min: 6, max: 128 })
            .withMessage('New password must be between 6 and 128 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
        
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Password confirmation does not match new password');
                }
                return true;
            })
    ],

    validateUpdateProfile: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),
        
        body('profile.phone')
            .optional()
            .isMobilePhone()
            .withMessage('Please provide a valid phone number'),
        
        body('profile.bio')
            .optional()
            .isLength({ max: 500 })
            .withMessage('Bio cannot exceed 500 characters'),
        
        body('profile.linkedin')
            .optional()
            .isURL()
            .withMessage('LinkedIn URL must be valid'),
        
        body('profile.github')
            .optional()
            .isURL()
            .withMessage('GitHub URL must be valid'),
        
        body('profile.website')
            .optional()
            .isURL()
            .withMessage('Website URL must be valid'),
        
        body('skills')
            .optional()
            .isArray()
            .withMessage('Skills must be an array'),
        
        body('skills.*.name')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Skill name must be between 1 and 50 characters'),
        
        body('skills.*.level')
            .optional()
            .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
            .withMessage('Invalid skill level')
    ],

    // Job validation rules
    validateCreateJob: [
        body('title')
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage('Job title must be between 5 and 200 characters'),
        
        body('company')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Company name must be between 2 and 100 characters'),
        
        body('description')
            .trim()
            .isLength({ min: 50, max: 5000 })
            .withMessage('Job description must be between 50 and 5000 characters'),
        
        body('location')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Location must be between 2 and 100 characters'),
        
        body('type')
            .isIn(['FULL-TIME', 'PART-TIME', 'CONTRACT', 'INTERNSHIP'])
            .withMessage('Invalid job type'),
        
        body('salary')
            .trim()
            .notEmpty()
            .withMessage('Salary information is required'),
        
        body('experience')
            .trim()
            .notEmpty()
            .withMessage('Experience requirement is required'),
        
        body('tags')
            .isArray({ min: 1, max: 10 })
            .withMessage('Please provide 1-10 tags'),
        
        body('tags.*')
            .trim()
            .isLength({ min: 1, max: 30 })
            .withMessage('Each tag must be between 1 and 30 characters'),
        
        body('remote')
            .optional()
            .isBoolean()
            .withMessage('Remote field must be boolean'),
        
        body('featured')
            .optional()
            .isBoolean()
            .withMessage('Featured field must be boolean')
    ],

    validateUpdateJob: [
        body('title')
            .optional()
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage('Job title must be between 5 and 200 characters'),
        
        body('company')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Company name must be between 2 and 100 characters'),
        
        body('description')
            .optional()
            .trim()
            .isLength({ min: 50, max: 5000 })
            .withMessage('Job description must be between 50 and 5000 characters'),
        
        body('location')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Location must be between 2 and 100 characters'),
        
        body('type')
            .optional()
            .isIn(['FULL-TIME', 'PART-TIME', 'CONTRACT', 'INTERNSHIP'])
            .withMessage('Invalid job type'),
        
        body('tags')
            .optional()
            .isArray({ min: 1, max: 10 })
            .withMessage('Please provide 1-10 tags')
    ],

    // Application validation rules
    validateCreateApplication: [
        param('jobId')
            .isMongoId()
            .withMessage('Invalid job ID'),
        
        body('coverLetter')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Cover letter cannot exceed 2000 characters'),
        
        body('expectedSalary')
            .optional()
            .isNumeric({ min: 0 })
            .withMessage('Expected salary must be a positive number'),
        
        body('availableFrom')
            .optional()
            .isISO8601()
            .withMessage('Available from date must be valid'),
        
        body('skills')
            .optional()
            .isArray()
            .withMessage('Skills must be an array'),
        
        body('skills.*.name')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Skill name must be between 1 and 50 characters'),
        
        body('experience')
            .optional()
            .isArray()
            .withMessage('Experience must be an array'),
        
        body('education')
            .optional()
            .isArray()
            .withMessage('Education must be an array')
    ],

    validateUpdateApplicationStatus: [
        param('applicationId')
            .isMongoId()
            .withMessage('Invalid application ID'),
        
        body('status')
            .isIn(['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'accepted', 'rejected', 'withdrawn'])
            .withMessage('Invalid application status'),
        
        body('notes')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Notes cannot exceed 1000 characters')
    ],

    validateAddFeedback: [
        param('applicationId')
            .isMongoId()
            .withMessage('Invalid application ID'),
        
        body('stage')
            .isIn(['screening', 'technical', 'cultural', 'final'])
            .withMessage('Invalid feedback stage'),
        
        body('rating')
            .optional()
            .isInt({ min: 1, max: 5 })
            .withMessage('Rating must be between 1 and 5'),
        
        body('comments')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Comments cannot exceed 1000 characters'),
        
        body('recommendation')
            .optional()
            .isIn(['hire', 'no_hire', 'maybe'])
            .withMessage('Invalid recommendation')
    ],

    // General validation rules
    validatePagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
    ],

    validateSearch: [
        query('search')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Search query must be between 1 and 100 characters'),
        
        query('location')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Location must be between 1 and 100 characters'),
        
        query('sortBy')
            .optional()
            .isIn(['createdAt', 'updatedAt', 'title', 'company', 'salary', 'views'])
            .withMessage('Invalid sort field'),
        
        query('sortOrder')
            .optional()
            .isIn(['asc', 'desc'])
            .withMessage('Sort order must be asc or desc')
    ],

    validateMongoId: (fieldName = 'id') => [
        param(fieldName)
            .isMongoId()
            .withMessage(`Invalid ${fieldName}`)
    ],

    // Custom validation for file uploads
    validateFileUpload: (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only PDF and Word documents are allowed.'
            });
        }

        if (req.file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }

        next();
    },

    // Sanitize input to prevent XSS
    sanitizeInput: (req, res, next) => {
        const sanitizeObj = (obj) => {
            if (typeof obj === 'string') {
                return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            }
            if (typeof obj === 'object' && obj !== null) {
                for (let key in obj) {
                    obj[key] = sanitizeObj(obj[key]);
                }
            }
            return obj;
        };

        req.body = sanitizeObj(req.body);
        req.query = sanitizeObj(req.query);
        next();
    }
};

module.exports = validation;