// middleware/auth.js 
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = {
            userId: user._id,
            email: user.email,
            role: user.role
        };
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error in authentication.'
        });
    }
};

const employerOrAdmin = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role === 'employer' || req.user.role === 'admin') {
                next();
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Employer or admin role required.'
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error in authorization.'
        });
    }
};

const adminOnly = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role === 'admin') {
                next();
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin role required.'
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error in authorization.'
        });
    }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user) {
                req.user = {
                    userId: user._id,
                    email: user.email,
                    role: user.role
                };
            }
        }
        
        next();
    } catch (error) {
        // Continue without auth if token is invalid
        next();
    }
};

module.exports = {
    auth,
    employerOrAdmin,
    adminOnly,
    optionalAuth
};