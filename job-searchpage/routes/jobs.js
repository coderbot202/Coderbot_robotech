// routes/jobs.js - Clean version compatible with Node.js v23 and latest path-to-regexp
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { body, validationResult } = require('express-validator');

console.log('Loading job routes...');

// ROUTE ORDER IS CRITICAL - Most specific routes FIRST, parameterized routes LAST

// GET /api/jobs/featured/list - Featured jobs
router.get('/featured/list', async (req, res) => {
    try {
        console.log('Fetching featured jobs...');

        const featuredJobs = await Job.find({ 
            featured: true,
            status: 'active'
        })
            .populate('postedBy', 'name profile.firstName profile.lastName')
            .sort({ createdAt: -1 })
            .limit(6)
            .select('-__v');

        res.json({
            success: true,
            data: featuredJobs,
            count: featuredJobs.length
        });

    } catch (error) {
        console.error('Error fetching featured jobs:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch featured jobs',
            message: error.message
        });
    }
});

// GET /api/jobs/stats/overview - Job statistics
router.get('/stats/overview', async (req, res) => {
    try {
        console.log('Fetching job statistics...');
        
        const [totalJobs, activeJobs, featuredJobs, remoteJobs] = await Promise.all([
            Job.countDocuments(),
            Job.countDocuments({ status: 'active' }),
            Job.countDocuments({ featured: true }),
            Job.countDocuments({ remote: true })
        ]);

        const jobsByType = await Job.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const jobsByLocation = await Job.aggregate([
            { $group: { _id: '$location', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                totalJobs,
                activeJobs,
                featuredJobs,
                remoteJobs,
                jobsByType,
                jobsByLocation
            }
        });

    } catch (error) {
        console.error('Error fetching job statistics:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch job statistics',
            message: error.message
        });
    }
});

// POST /api/jobs - Create new job (before GET / to avoid conflicts)
router.post('/', [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('company').notEmpty().trim().withMessage('Company is required'),
    body('location').notEmpty().trim().withMessage('Location is required'),
    body('type').isIn(['FULL-TIME', 'PART-TIME', 'CONTRACT', 'INTERNSHIP']).withMessage('Invalid job type'),
    body('salary').notEmpty().trim().withMessage('Salary is required'),
    body('experience').notEmpty().trim().withMessage('Experience is required'),
    body('description').notEmpty().trim().withMessage('Description is required'),
    body('tags').isArray({ min: 1 }).withMessage('Tags must be a non-empty array')
], async (req, res) => {
    try {
        console.log('Creating new job...');
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const jobData = {
            ...req.body,
            postedBy: req.user?.userId || null,
            status: 'active',
            views: 0,
            applicants: 0
        };

        const job = new Job(jobData);
        const savedJob = await job.save();

        console.log('Job created:', savedJob._id);

        res.status(201).json({
            success: true,
            data: savedJob,
            message: 'Job created successfully'
        });

    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create job',
            message: error.message
        });
    }
});

// GET /api/jobs - Get all jobs with filtering
router.get('/', async (req, res) => {
    try {
        console.log('Fetching jobs with query:', req.query);
        
        const {
            page = 1,
            limit = 10,
            search,
            location,
            jobType,
            experience,
            salary,
            remote,
            featured,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = { status: 'active' };
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }
        
        if (jobType) {
            filter.type = jobType.toUpperCase();
        }
        
        if (experience) {
            filter.experience = { $regex: experience, $options: 'i' };
        }
        
        if (remote !== undefined) {
            filter.remote = remote === 'true';
        }
        
        if (featured !== undefined) {
            filter.featured = featured === 'true';
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const jobs = await Job.find(filter)
            .populate('postedBy', 'name profile.firstName profile.lastName')
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .select('-__v');

        const totalJobs = await Job.countDocuments(filter);

        console.log(`Found ${jobs.length} jobs (${totalJobs} total)`);

        res.json({
            success: true,
            data: jobs,
            jobs, // For backward compatibility
            totalJobs,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalJobs / limit),
            hasNextPage: page * limit < totalJobs,
            hasPrevPage: page > 1,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(totalJobs / limit),
                total: totalJobs
            }
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch jobs',
            message: error.message
        });
    }
});

// POST /api/jobs/:id/apply - Apply to specific job (specific action route)
router.post('/:id/apply', [
    body('applicantName').notEmpty().trim().withMessage('Name is required'),
    body('applicantEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('resume').optional().isURL().withMessage('Resume must be a valid URL'),
    body('coverLetter').optional().isLength({ max: 1000 }).withMessage('Cover letter too long (max 1000 characters)')
], async (req, res) => {
    try {
        console.log(`Processing application for job: ${req.params.id}`);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ 
                success: false,
                error: 'Job not found' 
            });
        }

        if (!job.canApply()) {
            return res.status(400).json({
                success: false,
                error: 'This job is no longer accepting applications'
            });
        }

        // Increment applicant count
        await job.incrementApplicants();

        console.log('Application submitted successfully');

        res.json({ 
            success: true,
            message: 'Application submitted successfully',
            jobTitle: job.title,
            company: job.company
        });

    } catch (error) {
        console.error('Error submitting application:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid job ID format' 
            });
        }
        res.status(500).json({ 
            success: false,
            error: 'Failed to submit application',
            message: error.message
        });
    }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', [
    body('title').optional().notEmpty().trim().withMessage('Title cannot be empty'),
    body('company').optional().notEmpty().trim().withMessage('Company cannot be empty'),
    body('location').optional().notEmpty().trim().withMessage('Location cannot be empty'),
    body('type').optional().isIn(['FULL-TIME', 'PART-TIME', 'CONTRACT', 'INTERNSHIP']).withMessage('Invalid job type'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
    try {
        console.log(`Updating job: ${req.params.id}`);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, select: '-__v' }
        );

        if (!job) {
            return res.status(404).json({ 
                success: false,
                error: 'Job not found' 
            });
        }

        console.log('Job updated successfully');

        res.json({
            success: true,
            data: job,
            message: 'Job updated successfully'
        });

    } catch (error) {
        console.error('Error updating job:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid job ID format' 
            });
        }
        res.status(500).json({ 
            success: false,
            error: 'Failed to update job',
            message: error.message
        });
    }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', async (req, res) => {
    try {
        console.log(`Deleting job: ${req.params.id}`);
        
        const job = await Job.findByIdAndDelete(req.params.id);
        
        if (!job) {
            return res.status(404).json({ 
                success: false,
                error: 'Job not found' 
            });
        }

        console.log('Job deleted successfully');

        res.json({ 
            success: true,
            message: 'Job deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting job:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid job ID format' 
            });
        }
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete job',
            message: error.message
        });
    }
});

// GET /api/jobs/:id - Get single job (MUST BE LAST among parameterized routes)
router.get('/:id', async (req, res) => {
    try {
        console.log(`Fetching job: ${req.params.id}`);
        
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'name profile email')
            .select('-__v');
        
        if (!job) {
            return res.status(404).json({ 
                success: false,
                error: 'Job not found' 
            });
        }

        // Increment view count
        await job.incrementViews();

        console.log('Job fetched successfully');

        res.json({
            success: true,
            data: job
        });

    } catch (error) {
        console.error('Error fetching job:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid job ID format' 
            });
        }
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch job',
            message: error.message
        });
    }
});

console.log('Job routes loaded successfully');

module.exports = router;