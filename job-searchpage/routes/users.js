// job-searchpage/routes/users.js 
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controller/userController');
const validation = require('../middleware/validation');
const { auth, adminOnly } = require('../middleware/auth');
const helpers = require('../utils/helpers');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = helpers.generateUniqueFilename(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = helpers.getAllowedFileTypes().resume;
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and Word documents allowed.'));
        }
    }
});

// Public routes
router.post('/register', validation.validateRegister, userController.register);
router.post('/login', validation.validateLogin, userController.login);

// Protected routes (require authentication)
router.use(auth); // Apply auth middleware to all routes below

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validation.validateUpdateProfile, userController.updateProfile);
router.put('/change-password', validation.validateChangePassword, userController.changePassword);
router.delete('/account', userController.deleteAccount);

// File upload routes
router.post('/upload/resume', 
    upload.single('resume'), 
    validation.validateFileUpload, 
    userController.uploadDocument
);

router.post('/upload/document', 
    upload.single('document'), 
    validation.validateFileUpload, 
    userController.uploadDocument
);

// User's applications
router.get('/applications', 
    validation.validatePagination, 
    userController.getUserApplications
);

// Admin only routes
router.get('/all', adminOnly, validation.validatePagination, userController.getAllUsers);

// Additional utility routes
router.get('/stats', auth, async (req, res) => {
    try {
        const User = require('../models/User');
        const Application = require('../models/Application');
        
        let userStats = {};
        
        if (req.user.role === 'admin') {
            // Admin gets global stats
            const totalUsers = await User.countDocuments();
            const totalApplications = await Application.countDocuments();
            const recentUsers = await User.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name email createdAt');
                
            userStats = {
                totalUsers,
                totalApplications,
                recentUsers
            };
        } else {
            // Regular users get their own stats
            const userApplications = await Application.countDocuments({ 
                applicant: req.user.userId 
            });
            
            const applicationsByStatus = await Application.aggregate([
                { $match: { applicant: req.user.userId } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);
            
            userStats = {
                totalApplications: userApplications,
                applicationsByStatus
            };
        }
        
        res.json({
            success: true,
            data: userStats
        });
        
    } catch (error) {
        helpers.handleError(error, req);
        res.status(500).json({
            success: false,
            message: 'Error fetching user statistics'
        });
    }
});

// Verify email route (placeholder for future implementation)
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        
        // TODO: Implement email verification logic
        // For now, just return success
        
        res.json({
            success: true,
            message: 'Email verification feature coming soon'
        });
        
    } catch (error) {
        helpers.handleError(error, req);
        res.status(500).json({
            success: false,
            message: 'Error during email verification'
        });
    }
});

// Reset password route (placeholder for future implementation)
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // TODO: Implement password reset logic
        // For now, just return success
        
        res.json({
            success: true,
            message: 'Password reset feature coming soon'
        });
        
    } catch (error) {
        helpers.handleError(error, req);
        res.status(500).json({
            success: false,
            message: 'Error during password reset'
        });
    }
});

module.exports = router;