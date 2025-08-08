// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    company: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    logo: {
        type: String,
        default: null
    },
    location: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    type: {
        type: String,
        required: true,
        enum: ['FULL-TIME', 'PART-TIME', 'CONTRACT', 'INTERNSHIP'],
        uppercase: true
    },
    salary: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 5000
    },
    requirements: {
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        required: true,
        validate: {
            validator: function(arr) {
                return arr.length > 0 && arr.length <= 10;
            },
            message: 'Tags should have 1-10 items'
        }
    },
    remote: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'closed'],
        default: 'active'
    },
    applicants: {
        type: Number,
        default: 0,
        min: 0
    },
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    applicationDeadline: {
        type: Date,
        default: null
    },
    benefits: {
        type: [String],
        default: []
    },
    workMode: {
        type: String,
        enum: ['on-site', 'remote', 'hybrid'],
        default: 'on-site'
    },
    department: {
        type: String,
        trim: true,
        maxlength: 50
    },
    jobLevel: {
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
        default: 'mid'
    },
    companySize: {
        type: String,
        enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
        default: 'medium'
    },
    industry: {
        type: String,
        trim: true,
        maxlength: 50
    },
    contactEmail: {
        type: String,
        required: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email']
    },
    companyWebsite: {
        type: String,
        trim: true
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ featured: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ expiresAt: 1 });
jobSchema.index({ tags: 1 });

// Virtual for formatted posted date
jobSchema.virtual('postedAgo').get(function() {
    const now = new Date();
    const posted = this.createdAt;
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Today';
    } else if (diffDays === 2) {
        return 'Yesterday';
    } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
    } else if (diffDays <= 30) {
        return `${Math.ceil(diffDays / 7)} weeks ago`;
    } else {
        return `${Math.ceil(diffDays / 30)} months ago`;
    }
});

// Virtual for application status
jobSchema.virtual('applicationStatus').get(function() {
    const now = new Date();
    
    if (this.status !== 'active') {
        return this.status;
    }
    
    if (this.applicationDeadline && now > this.applicationDeadline) {
        return 'deadline_passed';
    }
    
    if (this.expiresAt && now > this.expiresAt) {
        return 'expired';
    }
    
    return 'accepting_applications';
});

// Virtual for salary range
jobSchema.virtual('salaryRange').get(function() {
    if (!this.salary) return null;
    
    const match = this.salary.match(/\$?(\d+)k?\s*-?\s*\$?(\d+)k?/i);
    if (match) {
        const min = parseInt(match[1]) * (match[1].includes('k') ? 1000 : 1);
        const max = parseInt(match[2]) * (match[2].includes('k') ? 1000 : 1);
        return { min, max };
    }
    
    return null;
});

// Pre-save middleware
jobSchema.pre('save', function(next) {
    // Auto-set work mode based on location and remote flag
    if (this.remote) {
        this.workMode = 'remote';
    } else if (this.location.toLowerCase().includes('remote') || this.location.toLowerCase().includes('worldwide')) {
        this.workMode = 'remote';
        this.remote = true;
    } else if (this.location.toLowerCase().includes('hybrid')) {
        this.workMode = 'hybrid';
    }
    
    // Ensure tags are lowercase and trimmed
    if (this.tags) {
        this.tags = this.tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
    }
    
    // Auto-expire old jobs
    if (!this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    
    next();
});

// Static methods
jobSchema.statics.findActive = function() {
    return this.find({ 
        status: 'active',
        expiresAt: { $gt: new Date() }
    });
};

jobSchema.statics.findByCompany = function(companyName) {
    return this.find({ 
        company: new RegExp(companyName, 'i'),
        status: 'active'
    });
};

jobSchema.statics.findRemote = function() {
    return this.find({ 
        $or: [
            { remote: true },
            { workMode: 'remote' },
            { location: /remote/i }
        ],
        status: 'active'
    });
};

jobSchema.statics.searchJobs = function(query) {
    return this.find({
        $text: { $search: query },
        status: 'active',
        expiresAt: { $gt: new Date() }
    }, {
        score: { $meta: 'textScore' }
    }).sort({
        score: { $meta: 'textScore' },
        featured: -1,
        createdAt: -1
    });
};

// Instance methods
jobSchema.methods.incrementViews = function() {
    this.views = (this.views || 0) + 1;
    return this.save();
};

jobSchema.methods.incrementApplicants = function() {
    this.applicants = (this.applicants || 0) + 1;
    return this.save();
};

jobSchema.methods.isExpired = function() {
    return this.expiresAt && new Date() > this.expiresAt;
};

jobSchema.methods.canApply = function() {
    return this.status === 'active' && 
           !this.isExpired() && 
           (!this.applicationDeadline || new Date() <= this.applicationDeadline);
};

module.exports = mongoose.model('Job', jobSchema);