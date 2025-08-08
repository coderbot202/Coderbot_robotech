// job-searchpage/controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
    return jwt.sign(
        { userId, timestamp: Date.now() },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '7d' }
    );
};

const userController = {
    // Register new user
    register: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { name, email, password, role = 'user' } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const user = new User({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role,
                profile: {},
                applications: []
            });

            await user.save();

            // Generate token
            const token = generateToken(user._id);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profile: user.profile
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during registration'
            });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate token
            const token = generateToken(user._id);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profile: user.profile,
                    lastLogin: user.lastLogin
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
    },

    // Get current user profile
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.userId)
                .populate('applications', 'job status createdAt')
                .select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                user
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // Update user profile
    updateProfile: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const userId = req.user.userId;
            const allowedUpdates = [
                'name', 'profile.phone', 'profile.location', 'profile.bio',
                'profile.linkedin', 'profile.github', 'profile.website',
                'skills', 'experience', 'education', 'preferences'
            ];

            const updates = {};
            Object.keys(req.body).forEach(key => {
                if (allowedUpdates.some(allowed => key.startsWith(allowed.split('.')[0]))) {
                    updates[key] = req.body[key];
                }
            });

            const user = await User.findByIdAndUpdate(
                userId,
                { $set: updates },
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user
            });

        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during profile update'
            });
        }
    },

    // Change password
    changePassword: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;

            // Get user with password
            const user = await User.findById(userId).select('+password');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password
            user.password = hashedPassword;
            await user.save();

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during password change'
            });
        }
    },

    // Upload resume/documents
    uploadDocument: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const { documentType = 'resume' } = req.body;
            const userId = req.user.userId;

            // In real app, you'd upload to cloud storage (AWS S3, etc.)
            const fileUrl = `/uploads/${req.file.filename}`;

            // Update user profile with document URL
            const updateField = `profile.${documentType}`;
            const user = await User.findByIdAndUpdate(
                userId,
                { [updateField]: fileUrl },
                { new: true }
            ).select('-password');

            res.json({
                success: true,
                message: `${documentType} uploaded successfully`,
                fileUrl,
                user
            });

        } catch (error) {
            console.error('Upload document error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during file upload'
            });
        }
    },

    // Get user's job applications
    getUserApplications: async (req, res) => {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const userId = req.user.userId;

            const Application = require('../models/Application');

            const filter = { applicant: userId };
            if (status) filter.status = status;

            const applications = await Application.find(filter)
                .populate('job', 'title company location type salary status')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const totalApplications = await Application.countDocuments(filter);

            res.json({
                success: true,
                applications,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(totalApplications / limit),
                    total: totalApplications
                }
            });

        } catch (error) {
            console.error('Get user applications error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // Delete user account
    deleteAccount: async (req, res) => {
        try {
            const userId = req.user.userId;
            await User.findByIdAndDelete(userId);

            res.json({
                success: true,
                message: 'Account deleted successfully'
            });

        } catch (error) {
            console.error('Delete account error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during account deletion'
            });
        }
    },

    // Admin: Get all users
    getAllUsers: async (req, res) => {
        try {
            const { page = 1, limit = 20, role, search } = req.query;

            const filter = {};
            if (role) filter.role = role;
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            const users = await User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const totalUsers = await User.countDocuments(filter);

            res.json({
                success: true,
                users,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(totalUsers / limit),
                    total: totalUsers
                }
            });

        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
};

module.exports = userController;