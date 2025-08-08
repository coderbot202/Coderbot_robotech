// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'employer', 'admin'],
        default: 'user'
    },
    profile: {
        firstName: String,
        lastName: String,
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer-not-to-say']
        },
        profilePicture: String,
        bio: {
            type: String,
            maxlength: 500
        },
        website: String,
        linkedin: String,
        github: String,
        resume: String, // URL to resume file
        portfolio: String
    },
    experience: [{
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
        skills: [String]
    }],
    education: [{
        institution: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        gpa: String,
        description: String
    }],
    skills: [{
        name: String,
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert']
        },
        yearsOfExperience: Number
    }],
    preferences: {
        jobTypes: [{
            type: String,
            enum: ['FULL-TIME', 'PART-TIME', 'CONTRACT', 'INTERNSHIP']
        }],
        locations: [String],
        remoteWork: {
            type: Boolean,
            default: false
        },
        salaryRange: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: 'USD'
            }
        },
        industries: [String],
        companySize: [{
            type: String,
            enum: ['startup', 'small', 'medium', 'large', 'enterprise']
        }],
        jobLevel: [{
            type: String,
            enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive']
        }]
    },
    bookmarkedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    }],
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    notifications: {
        emailJobs: {
            type: Boolean,
            default: true
        },
        emailApplications: {
            type: Boolean,
            default: true
        },
        emailMarketing: {
            type: Boolean,
            default: false
        },
        pushNotifications: {
            type: Boolean,
            default: true
        }
    },
    searchHistory: [{
        query: String,
        filters: mongoose.Schema.Types.Mixed,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    viewedJobs: [{
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    if (this.profile && this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.name;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware
userSchema.pre('save', function(next) {
    // Limit search history to last 50 searches
    if (this.searchHistory && this.searchHistory.length > 50) {
        this.searchHistory = this.searchHistory.slice(-50);
    }
    
    // Limit viewed jobs to last 100 views
    if (this.viewedJobs && this.viewedJobs.length > 100) {
        this.viewedJobs = this.viewedJobs.slice(-100);
    }
    
    next();
});

// Instance methods
userSchema.methods.addToSearchHistory = function(query, filters = {}) {
    this.searchHistory.push({
        query,
        filters,
        timestamp: new Date()
    });
    
    // Keep only last 50 searches
    if (this.searchHistory.length > 50) {
        this.searchHistory = this.searchHistory.slice(-50);
    }
    
    return this.save();
};

userSchema.methods.addViewedJob = function(jobId) {
    // Remove existing view of the same job
    this.viewedJobs = this.viewedJobs.filter(view => !view.job.equals(jobId));
    
    // Add new view at the beginning
    this.viewedJobs.unshift({
        job: jobId,
        viewedAt: new Date()
    });
    
    // Keep only last 100 views
    if (this.viewedJobs.length > 100) {
        this.viewedJobs = this.viewedJobs.slice(0, 100);
    }
    
    return this.save();
};

userSchema.methods.incrementLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: {
                lockUntil: 1
            },
            $set: {
                loginAttempts: 1
            }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
        };
    }
    
    return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: {
            loginAttempts: 1,
            lockUntil: 1
        }
    });
};

userSchema.methods.bookmarkJob = function(jobId) {
    if (!this.bookmarkedJobs.includes(jobId)) {
        this.bookmarkedJobs.push(jobId);
        return this.save();
    }
    return Promise.resolve(this);
};

userSchema.methods.unbookmarkJob = function(jobId) {
    this.bookmarkedJobs = this.bookmarkedJobs.filter(id => !id.equals(jobId));
    return this.save();
};

userSchema.methods.isJobBookmarked = function(jobId) {
    return this.bookmarkedJobs.some(id => id.equals(jobId));
};

// Static methods
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
    return this.find({ status: 'active' });
};

userSchema.statics.findByRole = function(role) {
    return this.find({ role });
};

userSchema.statics.searchUsers = function(query) {
    return this.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { 'profile.firstName': { $regex: query, $options: 'i' } },
            { 'profile.lastName': { $regex: query, $options: 'i' } }
        ],
        status: 'active'
    });
};

module.exports = mongoose.model('User', userSchema);