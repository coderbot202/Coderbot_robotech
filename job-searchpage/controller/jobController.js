// job-searchpage/controllers/jobController.js
const Job = require('../models/Job.js');
const Application = require('../models/Application.js');

const jobController = {
    // Get all jobs with search and filters
    getAllJobs: async (req, res) => {
        try {
            const { 
                search, 
                location, 
                category, 
                workType, 
                employmentType, 
                experience,
                salaryMin,
                salaryMax,
                page = 1, 
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;
            
            // Build search query
            const filters = {};
            if (location) filters.location = location;
            if (category) filters.category = category;
            if (workType) filters.workType = workType;
            if (employmentType) filters.employmentType = employmentType;
            if (experience) filters.experience = experience;
            if (salaryMin || salaryMax) {
                filters.salaryMin = salaryMin;
                filters.salaryMax = salaryMax;
            }
            
            const jobs = await Job.searchJobs(search, filters)
                .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);
                
            const total = await Job.countDocuments({ 
                status: 'active',
                ...(search ? { $text: { $search: search } } : {})
            });
            
            res.json({
                success: true,
                data: jobs,
                pagination: {
                    current: parseInt(page),
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
    
    // Get single job by ID
    getJobById: async (req, res) => {
        try {
            const { jobId } = req.params;
            
            const job = await Job.findById(jobId).populate('postedBy', 'name email company');
            
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }
            
            // Increment view count
            await job.incrementViews();
            
            res.json({
                success: true,
                data: job
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },
    
    // Create new job (for employers)
    createJob: async (req, res) => {
        try {
            const jobData = {
                ...req.body,
                postedBy: req.user.id
            };
            
            const job = new Job(jobData);
            await job.save();
            
            res.status(201).json({
                success: true,
                message: 'Job created successfully',
                data: job
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },
    
    // Update job
    updateJob: async (req, res) => {
        try {
            const { jobId } = req.params;
            
            const job = await Job.findOneAndUpdate(
                { _id: jobId, postedBy: req.user.id },
                req.body,
                { new: true, runValidators: true }
            );
            
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found or unauthorized'
                });
            }
            
            res.json({
                success: true,
                message: 'Job updated successfully',
                data: job
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },
    
    // Delete job
    deleteJob: async (req, res) => {
        try {
            const { jobId } = req.params;
            
            const job = await Job.findOneAndDelete({
                _id: jobId,
                postedBy: req.user.id
            });
            
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found or unauthorized'
                });
            }
            
            res.json({
                success: true,
                message: 'Job deleted successfully'
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },
    
    // Get jobs posted by current user (employer)
    getMyJobs: async (req, res) => {
        try {
            const { page = 1, limit = 10, status } = req.query;
            
            const query = { postedBy: req.user.id };
            if (status) query.status = status;
            
            const jobs = await Job.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);
                
            const total = await Job.countDocuments(query);
            
            res.json({
                success: true,
                data: jobs,
                pagination: {
                    current: parseInt(page),
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
    
    // Get job statistics
    getJobStats: async (req, res) => {
        try {
            const { jobId } = req.params;
            
            // Verify job belongs to current user
            const job = await Job.findOne({ _id: jobId, postedBy: req.user.id });
            
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found or unauthorized'
                });
            }
            
            const stats = await Application.getApplicationStats(jobId);
            
            res.json({
                success: true,
                data: {
                    job: {
                        title: job.title,
                        views: job.views,
                        applicationCount: job.applicationCount
                    },
                    applicationStats: stats[0] || { stats: [], total: 0 }
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
    
    // Get featured/recommended jobs
    getFeaturedJobs: async (req, res) => {
        try {
            const jobs = await Job.find({ 
                status: 'active',
                urgency: 'high'
            })
            .populate('postedBy', 'name company')
            .sort({ views: -1, createdAt: -1 })
            .limit(6);
            
            res.json({
                success: true,
                data: jobs
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },
    
    // Get job categories with counts
    getJobCategories: async (req, res) => {
        try {
            const categories = await Job.aggregate([
                { $match: { status: 'active' } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            
            res.json({
                success: true,
                data: categories
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

module.exports = jobController;