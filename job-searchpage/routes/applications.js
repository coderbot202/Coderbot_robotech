// job-searchpage/routes/applications.js 
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job.js');
const User = require('../models/User.js');
const { auth, employerOrAdmin } = require('../middleware/auth.js');
const validation = require('../middleware/validation.js');
const helpers = require('../utils/helpers');

// POST /api/applications/:jobId - Submit job application
router.post('/:jobId', [
    auth,
    validation.validateCreateApplication
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { jobId } = req.params;
        const applicantId = req.user.userId;
        
        // Check if job exists and is active
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if user already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: applicantId
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this job'
            });
        }

        // Get user profile
        const user = await User.findById(applicantId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create application with reference number
        const application = new Application({
            job: jobId,
            applicant: applicantId,
            applicantName: user.name,
            applicantEmail: user.email,
            coverLetter: req.body.coverLetter,
            expectedSalary: req.body.expectedSalary,
            availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : null,
            resume: user.profile?.resume || req.body.resume,
            portfolio: user.profile?.portfolio || req.body.portfolio,
            skills: req.body.skills || user.skills || [],
            experience: req.body.experience || user.experience || [],
            education: req.body.education || user.education || [],
            answers: req.body.answers || [],
            source: req.body.source || 'website',
            referral: req.body.referral,
            status: 'pending'
        });

        await application.save();

        // Increment job applicant count
        await job.incrementApplications();

        // Send confirmation email
        if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
            const emailTemplate = helpers.emailTemplates.applicationReceived(
                user.name, 
                job.title, 
                job.company
            );
            
            await helpers.sendEmail(
                user.email,
                emailTemplate.subject,
                emailTemplate.html
            );
        }

        // Log the event
        helpers.logEvent('application_submitted', {
            applicationId: application._id,
            jobId,
            applicantId,
            jobTitle: job.title
        });

        // Populate the response
        await application.populate([
            { path: 'job', select: 'title company location type salary' },
            { path: 'applicant', select: 'name email' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: helpers.formatApplicationForFrontend(application)
        });

    } catch (error) {
        helpers.handleError(error, req);
        res.status(500).json({
            success: false,
            message: 'Server error during application submission'
        });
    }
});

// GET /api/applications - Get user's applications
router.get('/', [
    auth,
    validation.validatePagination
], async (req, res) => {
    try {
        const { page = 1, limit = 10, status, sortBy = 'createdAt' } = req.query;

        const filter = { applicant: req.user.userId };
        if (status) filter.status = status;

        const applications = await Application.find(filter)
            .populate('job', 'title company location type salary status')
            .sort(helpers.buildSortQuery(sortBy, 'desc'))
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const totalApplications = await Application.countDocuments(filter);
        const pagination = helpers.getPagination(page, limit, totalApplications);

        // Format applications for frontend
        const formattedApplications = applications.map(app => 
            helpers.formatApplicationForFrontend(app)
        );

        res.json({
            success: true,
            data: formattedApplications,
            pagination
        });

    } catch (error) {
        helpers.handleError(error, req);
        res.status(500).json({
            success: false,
            message: 'Server error fetching applications'
        });
    }
});

// GET /api/applications/:id - Get application by ID
router.get('/:id', [
    auth,
    validation.validateMongoId('id')
], async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('job')
            .populate('applicant', 'name email profile')
            .populate('reviewedBy', 'name email')
            .populate('feedback.reviewer', 'name email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user owns this application or has permission to view
        const canView = application.applicant._id.toString() === req.user.userId || 
                       req.user.role === 'employer' || 
                       req.user.role === 'admin';

        if (!canView) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: helpers.formatApplicationForFrontend(application)
        });

    } catch (error) {
        helpers.handleError(error, req);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// PUT /api/applications/:id - Update application (applicant only, limited fields)
router.put('/:id', [
    auth,
    validation.validateMongoId('id'),
    body('coverLetter').optional().isLength({ max: 2000 }).withMessage('Cover letter too long'),
    body('expectedSalary').optional().isNumeric().withMessage('Expected salary must be a number'),
    body('availableFrom').optional().isISO8601().withMessage('Available from must be a valid date')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user owns this application
        if (application.applicant.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Only allow updates if application is still pending
        if (application.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update application after review has started'
            });
        }

        const allowedUpdates = ['coverLetter', 'expectedSalary', 'availableFrom'];
        const updates = {};
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedApplication = await Application.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).populate('job', 'title company location type salary');

        helpers.logEvent('application_updated', {
            applicationId: req.params.id,
            updates: Object.keys(updates)
        });

        res.json({
            success: true,
            message: 'Application updated successfully',
            data: helpers.formatApplicationForFrontend(updatedApplication)
        });

    } catch (error) {
        helpers.handleError(error, req);
        res.status(500).json({
            success: false,
            message: 'Server error during application update'
        });
    }
});

// DELETE /api/applications/:id - Withdraw application
router.delete('/:id', [
    auth,
    validation.validateMongoId('id')
], async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user owns this application
        if (application.applicant.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!application.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot withdraw this application'
            });
        }

        // Use the withdraw method from the model
        await application.withdraw(req.body.reason);

        helpers.logEvent('application_withdrawn', {
            applicationId: req.params.id,
            reason: req.body.reason
        });

        res.json({
            success: true,
            message: 'Application withdrawn successfully'
        });

    } catch (error) {
        helpers.handleError(error, req);
        res.status(500).json({
            success: false,
            message: 'Server error during application withdrawal'
        });
    }
});

// PUT /api/applications/:id/status - Update application status (employer/admin only)
router.put('/:id/status', [
    employerOrAdmin,
    validation.validateUpdateApplicationStatus
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { status, notes } = req.body;

        const application = await Application.findById(req.params.id)
            .populate('job', 'title company')
            .populate('applicant', 'name email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Update using the model method
        await application.updateStatus(status, notes, req.user.userId);

        // Send status update email
        if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
            const emailTemplate = helpers.emailTemplates.statusUpdate(
                application.applicantName,
                application.job.title,
                status
            );
            
            await helpers.sendEmail(
                application.applicantEmail,
                emailTemplate.subject,
                emailTemplate.html
            );
        }

        helpers.logEvent('application_status_updated', {
            applicationId: req.params.id,
            oldStatus: application.status,
            newStatus: status,
            updatedBy: req.user.userId
        });

        res.json({
            success: true,
            message: 'Application status updated successfully',
            data: helpers.formatApplicationForFrontend(application)
        });

    } catch (error) {
        helpers.handleError(error, req);
        res.status(500).json({
            success: false,
            message: 'Server error during status update'
        });
    }
});

// GET /api/applications/job/:jobId - Get applications for a job (employer/admin only)
router.get('/job/:jobId', [
    employerOrAdmin,
    validation.validateMongoId('jobId'),
    validation.validatePagination
], async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const filter = { job: req.params.jobId };
        if (status) filter.status = status;

        const applications = await Application.find(filter)
            .populate('applicant', 'name email profile')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const totalApplications = await Application.countDocuments(filter);
        const pagination = helpers.getPagination(page, limit, totalApplications);

        // Get application stats
        const stats = await Application.getApplicationStats(req.params.jobId);

        res.json({
            success: true,
            data: applications.map(app => helpers.formatApplicationForFrontend(app)),
            pagination,
            stats: stats[0] || { stats: [], total: 0 }
        });

    } catch (error) {
        helpers.handleError(error, req);
        res.status(500).json({
            success: false,
            message: 'Server error fetching job applications'
        });
    }
});

// POST /api/applications/:id/feedback - Add feedback to application
router.post('/:id/feedback', [
    employerOrAdmin,
    validation.validateAddFeedback
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const feedbackData = {
            ...req.body,
            reviewer: req.user.userId
        };

        await application.addFeedback(feedbackData);

        helpers.logEvent('application_feedback_added', {
            applicationId: req.params.id,
            stage: req.body.stage,
            rating: req.body.rating,
            reviewer: req.user.userId
        });

        res.json({
            success: true,
            message: 'Feedback added successfully',
            data: helpers.formatApplicationForFrontend(application)
        });

    } catch (error) {
        helpers.handleError(error, req);
        res.status(500).json({
            success: false,
            message: 'Server error adding feedback'
        });
    }
});

// GET /api/applications/stats/overview - Get application statistics
router.get('/stats/overview', auth, async (req, res) => {
    try {
        let filter = {};
        
        // If not admin/employer, only show user's applications
        if (req.user.role === 'user') {
            filter.applicant = req.user.userId;
        }

        const stats = await Application.aggregate([
            { $match: filter },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const totalApplications = await Application.countDocuments(filter);

        // Get recent applications
        const recentApplications = await Application.find(filter)
            .populate('job', 'title company')
            .populate('applicant', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalApplications,
                stats,
                recentApplications: recentApplications.map(app => 
                    helpers.formatApplicationForFrontend(app)
                )
            }
        });

    } catch (error) {
        helpers.handleError(error, req);
        res.status(500).json({
            success: false,
            message: 'Server error fetching application statistics'
        });
    }
});

module.exports = router;