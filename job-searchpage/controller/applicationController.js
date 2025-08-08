// job-searchpage/controllers/applicationController.js
const Application = require('../models/Application');
const Job = require('../models/Job.js');
const User = require('../models/User.js');

const applicationController = {
    // Create new application
    createApplication: async (req, res) => {
        try {
            const { jobId } = req.params;
            const applicantId = req.user.id;
            
            // Check if user already applied for this job
            const existingApplication = await Application.findOne({
                job: jobId,
                applicant: applicantId
            });
            
            if (existingApplication) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already applied for this job'
                });
            }
            
            // Get job and user details
            const job = await Job.findById(jobId);
            const user = await User.findById(applicantId);
            
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }
            
            // Create application
            const application = new Application({
                job: jobId,
                applicant: applicantId,
                applicantName: user.name,
                applicantEmail: user.email,
                ...req.body
            });
            
            await application.save();
            
            // Increment application count in job
            await job.incrementApplications();
            
            res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                data: application
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },
    
    // Get all applications for a job (for employers)
    getJobApplications: async (req, res) => {
        try {
            const { jobId } = req.params;
            const { status, page = 1, limit = 10 } = req.query;
            
            const query = { job: jobId };
            if (status) query.status = status;
            
            const applications = await Application.find(query)
                .populate('applicant', 'name email profile')
                .populate('job', 'title company')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);
                
            const total = await Application.countDocuments(query);
            
            res.json({
                success: true,
                data: applications,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },
    
    // Get user's applications
    getUserApplications: async (req, res) => {
        try {
            const applicantId = req.user.id;
            const { status, page = 1, limit = 10 } = req.query;
            
            const query = { applicant: applicantId };
            if (status) query.status = status;
            
            const applications = await Application.find(query)
                .populate('job', 'title company location salaryRange')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);
                
            const total = await Application.countDocuments(query);
            
            res.json({
                success: true,
                data: applications,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },
    
    // Update application status
    updateApplicationStatus: async (req, res) => {
        try {
            const { applicationId } = req.params;
            const { status, notes } = req.body;
            const updatedBy = req.user.id;
            
            const application = await Application.findById(applicationId);
            
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }
            
            await application.updateStatus(status, notes, updatedBy);
            
            res.json({
                success: true,
                message: 'Application status updated successfully',
                data: application
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },
    
    // Get single application
    getApplication: async (req, res) => {
        try {
            const { applicationId } = req.params;
            
            const application = await Application.findById(applicationId)
                .populate('applicant', 'name email profile skills experience education')
                .populate('job', 'title company description requirements')
                .populate('reviewedBy', 'name email');
                
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }
            
            res.json({
                success: true,
                data: application
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },
    
    // Withdraw application
    withdrawApplication: async (req, res) => {
        try {
            const { applicationId } = req.params;
            const { reason } = req.body;
            
            const application = await Application.findOne({
                _id: applicationId,
                applicant: req.user.id
            });
            
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }
            
            if (!application.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot withdraw this application'
                });
            }
            
            await application.withdraw(reason);
            
            res.json({
                success: true,
                message: 'Application withdrawn successfully'
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },
    
    // Add feedback to application
    addFeedback: async (req, res) => {
        try {
            const { applicationId } = req.params;
            const feedbackData = {
                ...req.body,
                reviewer: req.user.id
            };
            
            const application = await Application.findById(applicationId);
            
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }
            
            await application.addFeedback(feedbackData);
            
            res.json({
                success: true,
                message: 'Feedback added successfully',
                data: application
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
};

module.exports = applicationController;