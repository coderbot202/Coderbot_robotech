// server.js 
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Starting CoderBot Job Portal Server...');

// Basic middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

// Enhanced mock data
const mockJobs = [
    {
        _id: '507f1f77bcf86cd799439011',
        title: 'Senior React Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        type: 'FULL-TIME',
        salary: '12K-18K',
        experience: '3-5 years',
        description: 'Build amazing React applications with cutting-edge technologies. Work with a talented team on challenging projects that impact millions of users.',
        tags: ['React', 'TypeScript', 'Frontend', 'Remote'],
        remote: true,
        featured: true,
        status: 'active',
        workMode: 'remote',
        jobLevel: 'senior',
        department: 'Engineering',
        views: 45,
        applicants: 12,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439012',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        type: 'FULL-TIME',
        salary: '9K-13K',
        experience: '2-4 years',
        description: 'Join our fast-growing startup and work on exciting projects that will shape the future of our industry.',
        tags: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
        remote: false,
        featured: true,
        status: 'active',
        workMode: 'on-site',
        jobLevel: 'mid',
        department: 'Engineering',
        views: 23,
        applicants: 8,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439013',
        title: 'Python Data Scientist',
        company: 'DataCorp India',
        location: 'Bangalore, India',
        type: 'FULL-TIME',
        salary: '15K-20K',
        experience: '3-6 years',
        description: 'Work on machine learning models and data analysis for business insights. Join our AI team working on cutting-edge projects.',
        tags: ['Python', 'Machine Learning', 'Data Science', 'SQL', 'AI'],
        remote: true,
        featured: true,
        status: 'active',
        workMode: 'hybrid',
        jobLevel: 'senior',
        department: 'Data Science',
        views: 67,
        applicants: 23,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439014',
        title: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        location: 'Mumbai, India',
        type: 'FULL-TIME',
        salary: '5K-8K',
        experience: '2-5 years',
        description: 'Build and maintain scalable cloud infrastructure using modern DevOps practices. Work with containerization and automation.',
        tags: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'Automation'],
        remote: false,
        featured: false,
        status: 'active',
        workMode: 'on-site',
        jobLevel: 'mid',
        department: 'Infrastructure',
        views: 34,
        applicants: 15,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439015',
        title: 'UI/UX Designer',
        company: 'Design Studio Pro',
        location: 'Delhi, India',
        type: 'FULL-TIME',
        salary: '8K-14K',
        experience: '2-4 years',
        description: 'Create beautiful and intuitive user experiences for web and mobile applications. Work with cross-functional teams.',
        tags: ['UI Design', 'UX Design', 'Figma', 'Adobe', 'Prototyping'],
        remote: true,
        featured: false,
        status: 'active',
        workMode: 'remote',
        jobLevel: 'mid',
        department: 'Design',
        views: 28,
        applicants: 9,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439016',
        title: 'Backend Node.js Developer',
        company: 'API Masters',
        location: 'Hyderabad, India',
        type: 'FULL-TIME',
        salary: '10K-16K',
        experience: '3-5 years',
        description: 'Develop robust backend APIs and microservices using Node.js and modern frameworks. Scale systems for high traffic.',
        tags: ['Node.js', 'Backend', 'API', 'Express', 'Microservices'],
        remote: false,
        featured: true,
        status: 'active',
        workMode: 'on-site',
        jobLevel: 'senior',
        department: 'Engineering',
        views: 51,
        applicants: 18,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439017',
        title: 'Mobile App Developer',
        company: 'MobileFirst Inc',
        location: 'Pune, India',
        type: 'FULL-TIME',
        salary: '9K-15K',
        experience: '2-4 years',
        description: 'Build cross-platform mobile applications using React Native or Flutter. Create amazing user experiences.',
        tags: ['Mobile', 'React Native', 'Flutter', 'iOS', 'Android'],
        remote: true,
        featured: false,
        status: 'active',
        workMode: 'hybrid',
        jobLevel: 'mid',
        department: 'Engineering',
        views: 39,
        applicants: 14,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439018',
        title: 'Product Manager',
        company: 'InnovateTech',
        location: 'Chennai, India',
        type: 'FULL-TIME',
        salary: '18K-28K',
        experience: '4-7 years',
        description: 'Lead product development and strategy for our B2B SaaS platform. Drive product vision and roadmap.',
        tags: ['Product Management', 'Strategy', 'Agile', 'SaaS', 'Analytics'],
        remote: false,
        featured: true,
        status: 'active',
        workMode: 'on-site',
        jobLevel: 'senior',
        department: 'Product',
        views: 42,
        applicants: 7,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439019',
        title: 'Frontend React Developer',
        company: 'WebFlow Agency',
        location: 'Remote',
        type: 'CONTRACT',
        salary: '5K-8K',
        experience: '2-3 years',
        description: 'Work on multiple client projects building modern React applications. Perfect for developers who love variety.',
        tags: ['React', 'Frontend', 'JavaScript', 'CSS', 'Contract'],
        remote: true,
        featured: false,
        status: 'active',
        workMode: 'remote',
        jobLevel: 'mid',
        department: 'Engineering',
        views: 31,
        applicants: 11,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439020',
        title: 'Junior Software Developer',
        company: 'TechStartup Labs',
        location: 'Gurgaon, India',
        type: 'FULL-TIME',
        salary: '6K-10K',
        experience: '0-2 years',
        description: 'Perfect entry-level position for recent graduates. Learn from experienced developers and grow your career.',
        tags: ['Junior', 'Entry Level', 'JavaScript', 'Python', 'Java'],
        remote: false,
        featured: false,
        status: 'active',
        workMode: 'on-site',
        jobLevel: 'entry',
        department: 'Engineering',
        views: 78,
        applicants: 35,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439021',
        title: 'Marketing Manager',
        company: 'GrowthCorp',
        location: 'Mumbai, India',
        type: 'FULL-TIME',
        salary: '12K-18K',
        experience: '3-5 years',
        description: 'Drive marketing campaigns and brand strategy for our growing technology company.',
        tags: ['Marketing', 'Brand Strategy', 'Campaigns', 'Growth'],
        remote: false,
        featured: false,
        status: 'active',
        workMode: 'on-site',
        jobLevel: 'senior',
        department: 'Marketing',
        views: 25,
        applicants: 8,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439022',
        title: 'Digital Marketing Specialist',
        company: 'AdTech Pro',
        location: 'Remote',
        type: 'PART-TIME',
        salary: '4K-7K',
        experience: '1-3 years',
        description: 'Manage digital marketing campaigns across multiple channels and platforms.',
        tags: ['Digital Marketing', 'Social Media', 'SEO', 'Content'],
        remote: true,
        featured: false,
        status: 'active',
        workMode: 'remote',
        jobLevel: 'mid',
        department: 'Marketing',
        views: 33,
        applicants: 12,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439023',
        title: 'Software Engineer Intern',
        company: 'TechGiants',
        location: 'Bangalore, India',
        type: 'INTERNSHIP',
        salary: '2K-4K',
        experience: '0-1 years',
        description: 'Learn and grow as a software engineer in our supportive internship program.',
        tags: ['Internship', 'Software Engineering', 'Learning', 'Entry Level'],
        remote: false,
        featured: false,
        status: 'active',
        workMode: 'on-site',
        jobLevel: 'entry',
        department: 'Engineering',
        views: 89,
        applicants: 67,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Database connection state
let dbConnected = false;

// Try to connect to database (optional)
async function tryDatabaseConnection() {
    try {
        const mongoose = require('mongoose');
        
        // Import models
        require('./models/User');
        require('./models/Job');
        
        const connectDB = require('./config/database');
        
        console.log('Attempting database connection...');
        await connectDB();
        
        if (mongoose.connection.readyState === 1) {
            dbConnected = true;
            console.log('Database connected successfully');
        }
    } catch (error) {
        console.log('Database connection failed, using mock data');
        console.log('Error:', error.message);
        dbConnected = false;
    }
}

// Initialize database connection (don't wait for it)
tryDatabaseConnection();

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'using mock data',
        mockDataCount: mockJobs.length,
        nodeVersion: process.version
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'using mock data',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        jobCount: mockJobs.length
    });
});

// Main jobs endpoint
app.get('/api/jobs', async (req, res) => {
    try {
        console.log(`Fetching jobs with query:`, req.query);
        
        let jobs = [];
        
        // Try database first if connected
        if (dbConnected) {
            try {
                const mongoose = require('mongoose');
                const Job = require('./models/Job');
                
                if (mongoose.connection.readyState === 1) {
                    jobs = await Job.find({ status: 'active' }).limit(50);
                    console.log(`Found ${jobs.length} jobs from database`);
                }
            } catch (dbError) {
                console.log('Database query failed, falling back to mock data:', dbError.message);
                jobs = [...mockJobs];
            }
        } else {
            console.log('Using mock data');
            jobs = [...mockJobs];
        }
        
        // If still no jobs, use mock data
        if (!jobs || jobs.length === 0) {
            jobs = [...mockJobs];
            console.log(`Using ${jobs.length} mock jobs`);
        }
        
        // Apply search filters
        const { search, location, jobType, experience } = req.query;
        
        if (search && search.trim()) {
            const searchTerm = search.toLowerCase();
            jobs = jobs.filter(job => 
                job.title.toLowerCase().includes(searchTerm) ||
                job.company.toLowerCase().includes(searchTerm) ||
                (job.description && job.description.toLowerCase().includes(searchTerm)) ||
                (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        
        if (location && location.trim()) {
            const locationTerm = location.toLowerCase();
            jobs = jobs.filter(job => 
                job.location.toLowerCase().includes(locationTerm)
            );
        }
        
        if (jobType && jobType.trim()) {
            const jobTypeTerm = jobType.toLowerCase();
            jobs = jobs.filter(job => 
                job.type.toLowerCase() === jobTypeTerm ||
                job.type.toLowerCase().includes(jobTypeTerm)
            );
        }
        
        if (experience && experience.trim()) {
            jobs = jobs.filter(job => 
                job.experience && job.experience.toLowerCase().includes(experience.toLowerCase())
            );
        }
        
        console.log(`Returning ${jobs.length} jobs after filtering`);
        
        res.json({
            success: true,
            data: jobs,
            jobs: jobs, // For compatibility
            totalJobs: jobs.length,
            currentPage: 1,
            totalPages: 1,
            mockData: !dbConnected
        });
        
    } catch (error) {
        console.error('Jobs API error:', error);
        
        // Always return mock data as fallback
        res.json({
            success: true,
            data: mockJobs,
            jobs: mockJobs,
            totalJobs: mockJobs.length,
            currentPage: 1,
            totalPages: 1,
            mockData: true,
            warning: 'Using mock data due to API error'
        });
    }
});

// Get single job
app.get('/api/jobs/:id', async (req, res) => {
    try {
        let job = null;
        
        // Try database first
        if (dbConnected) {
            try {
                const mongoose = require('mongoose');
                const Job = require('./models/Job');
                
                if (mongoose.connection.readyState === 1) {
                    job = await Job.findById(req.params.id);
                }
            } catch (dbError) {
                console.log('Database query failed for single job');
            }
        }
        
        // Fallback to mock data
        if (!job) {
            job = mockJobs.find(j => j._id === req.params.id);
        }
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }
        
        res.json({
            success: true,
            data: job
        });
        
    } catch (error) {
        console.error('Job detail error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch job details',
            message: error.message
        });
    }
});

// Create job (only works with database)
app.post('/api/jobs', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({
                success: false,
                error: 'Database not available',
                message: 'Cannot create job without database connection'
            });
        }
        
        const Job = require('./models/Job');
        const job = new Job(req.body);
        const savedJob = await job.save();
        
        res.status(201).json({
            success: true,
            data: savedJob,
            message: 'Job created successfully'
        });
        
    } catch (error) {
        console.error('Job creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Job creation failed',
            message: error.message
        });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'Jobsearch.html'));
    } catch (error) {
        res.send(`
            <h1>CoderBot Job Portal Server</h1>
            <p>Server is running successfully!</p>
            <ul>
                <li><a href="/api/test">Test API</a></li>
                <li><a href="/api/jobs">Jobs API (${mockJobs.length} mock jobs available)</a></li>
                <li><a href="/api/health">Health Check</a></li>
            </ul>
            <p><strong>Status:</strong> ${dbConnected ? 'Database Connected' : 'Using Mock Data'}</p>
        `);
    }
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// API 404 handler
app.use(/^\/api\/.*/, (req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});

// Catch-all handler for frontend routes
app.use((req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'Jobsearch.html'));
    } catch (error) {
        res.status(404).send(`
            <h1>404 - Page Not Found</h1>
            <p><a href="/">Go Home</a></p>
        `);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    if (dbConnected) {
        const mongoose = require('mongoose');
        mongoose.connection.close(() => {
            console.log('MongoDB connection closed.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    if (dbConnected) {
        const mongoose = require('mongoose');
        mongoose.connection.close(() => {
            console.log('MongoDB connection closed.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// Start server
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(80));
    console.log('CoderBot Job Portal Server Started Successfully!');
    console.log('='.repeat(80));
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`API Test: http://localhost:${PORT}/api/test`);
    console.log(`Jobs API: http://localhost:${PORT}/api/jobs`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(80));
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${dbConnected ? 'Connected' : 'Using Mock Data'}`);
    console.log(`Mock Jobs Available: ${mockJobs.length}`);
    console.log(`Node.js: ${process.version}`);
    console.log('='.repeat(80));
    console.log('Server is ready to serve requests!');
});

module.exports = app;

// cd D:\Coderbot_robotech-main\Coderbot_robotech-main\job-searchpage