// models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicantName: {
        type: String,
        required: true,
        trim: true
    },
    applicantEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    coverLetter: {
        type: String,
        maxlength: 2000
    },
    resume: {
        type: String, // URL to resume file
        trim: true
    },
    portfolio: {
        type: String, // URL to portfolio
        trim: true
    },
    expectedSalary: {
        type: Number,
        min: 0
    },
    availableFrom: {
        type: Date
    },
    skills: [{
        name: String,
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert']
        }
    }],
    experience: [{
        company: String,
        position: String,
        duration: String,
        description: String
    }],
    education: [{
        institution: String,
        degree: String,
        field: String,
        year: String
    }],
    answers: [{
        question: String,
        answer: String,
        required: Boolean
    }],
    attachments: [{
        name: String,
        url: String,
        type: String, // 'resume', 'cover_letter', 'portfolio', 'certificate', 'other'
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    source: {
        type: String,
        enum: ['website', 'linkedin', 'indeed', 'glassdoor', 'referral', 'other'],
        default: 'website'
    },
    referral: {
        referredBy: String,
        referralSource: String
    },
    reviewNotes: {
        type: String,
        maxlength: 1000
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    interviewScheduled: {
        date: Date,
        time: String,
        location: String,
        type: {
            type: String,
            enum: ['phone', 'video', 'in_person', 'panel']
        },
        interviewer: String,
        notes: String
    },
    feedback: [{
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        stage: {
            type: String,
            enum: ['screening', 'technical', 'cultural', 'final']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comments: String,
        strengths: [String],
        weaknesses: [String],
        recommendation: {
            type: String,
            enum: ['hire', 'no_hire', 'maybe']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    salary: {
        offered: Number,
        negotiated: Number,
        final: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        benefits: [String]
    },
    timeline: [{
        status: String,
        date: {
            type: Date,
            default: Date.now
        },
        notes: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    withdrawnAt: Date,
    withdrawalReason: String,
    rejectionReason: String,
    offerDetails: {
        startDate: Date,
        salary: Number,
        benefits: [String],
        workLocation: String,
        reportingManager: String,
        department: String,
        offerExpiresAt: Date
    },
    tags: [String], // For internal organization
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ job: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ applicantEmail: 1 });

// Virtual for application age
applicationSchema.virtual('appliedDaysAgo').get(function() {
    const now = new Date();
    const diffTime = Math.abs(now - this.createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Virtual for status display
applicationSchema.virtual('statusDisplay').get(function() {
    const statusMap = {
        'pending': 'Under Review',
        'reviewing': 'In Review',
        'shortlisted': 'Shortlisted',
        'interviewed': 'Interviewed',
        'offered': 'Offer Extended',
        'accepted': 'Offer Accepted',
        'rejected': 'Not Selected',
        'withdrawn': 'Withdrawn'
    };
    return statusMap[this.status] || this.status;
});

// Virtual for is active
applicationSchema.virtual('isActive').get(function() {
    return ['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered'].includes(this.status);
});

// Virtual for latest feedback
applicationSchema.virtual('latestFeedback').get(function() {
    if (this.feedback && this.feedback.length > 0) {
        return this.feedback[this.feedback.length - 1];
    }
    return null;
});

// Virtual for average rating
applicationSchema.virtual('averageRating').get(function() {
    if (this.feedback && this.feedback.length > 0) {
        const ratings = this.feedback.filter(f => f.rating).map(f => f.rating);
        if (ratings.length === 0) return null;
        return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1);
    }
    return null;
});

// Pre-save middleware
applicationSchema.pre('save', function(next) {
    // Add to timeline when status changes
    if (this.isModified('status')) {
        this.timeline.push({
            status: this.status,
            date: new Date(),
            notes: this.reviewNotes || `Status changed to ${this.status}`
        });
    }
    
    // Set withdrawal date
    if (this.status === 'withdrawn' && !this.withdrawnAt) {
        this.withdrawnAt = new Date();
    }
    
    next();
});

// Post-save middleware for notifications
applicationSchema.post('save', function(doc) {
    // Emit events for status changes (can be used with event emitters)
    if (this.wasModified && this.wasModified('status')) {
        // You can emit events here for email notifications, etc.
        console.log(`Application ${doc._id} status changed to ${doc.status}`);
    }
});

// Instance methods
applicationSchema.methods.updateStatus = function(status, notes, updatedBy) {
    this.status = status;
    if (notes) this.reviewNotes = notes;
    this.reviewedAt = new Date();
    if (updatedBy) this.reviewedBy = updatedBy;
    
    return this.save();
};

applicationSchema.methods.withdraw = function(reason) {
    this.status = 'withdrawn';
    this.withdrawnAt = new Date();
    if (reason) this.withdrawalReason = reason;
    
    return this.save();
};

applicationSchema.methods.reject = function(reason, rejectedBy) {
    this.status = 'rejected';
    if (reason) this.rejectionReason = reason;
    this.reviewedAt = new Date();
    if (rejectedBy) this.reviewedBy = rejectedBy;
    
    return this.save();
};

applicationSchema.methods.shortlist = function(shortlistedBy) {
    this.status = 'shortlisted';
    this.reviewedAt = new Date();
    if (shortlistedBy) this.reviewedBy = shortlistedBy;
    
    return this.save();
};

applicationSchema.methods.scheduleInterview = function(interviewDetails, scheduledBy) {
    this.status = 'interviewed';
    this.interviewScheduled = {
        ...interviewDetails,
        scheduledAt: new Date()
    };
    this.reviewedAt = new Date();
    if (scheduledBy) this.reviewedBy = scheduledBy;
    
    return this.save();
};

applicationSchema.methods.addFeedback = function(feedbackData) {
    this.feedback.push({
        ...feedbackData,
        createdAt: new Date()
    });
    
    return this.save();
};

applicationSchema.methods.makeOffer = function(offerDetails, offeredBy) {
    this.status = 'offered';
    this.offerDetails = {
        ...offerDetails,
        createdAt: new Date()
    };
    this.reviewedAt = new Date();
    if (offeredBy) this.reviewedBy = offeredBy;
    
    return this.save();
};

applicationSchema.methods.acceptOffer = function() {
    this.status = 'accepted';
    
    return this.save();
};

applicationSchema.methods.archive = function() {
    this.isArchived = true;
    
    return this.save();
};

applicationSchema.methods.unarchive = function() {
    this.isArchived = false;
    
    return this.save();
};

// Static methods
applicationSchema.statics.findByJob = function(jobId) {
    return this.find({ job: jobId }).populate('applicant', 'name email');
};

applicationSchema.statics.findByApplicant = function(applicantId) {
    return this.find({ applicant: applicantId }).populate('job', 'title company');
};

applicationSchema.statics.findByStatus = function(status) {
    return this.find({ status }).populate('job applicant');
};

applicationSchema.statics.getApplicationStats = function(jobId) {
    return this.aggregate([
        { $match: jobId ? { job: mongoose.Types.ObjectId(jobId) } : {} },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                stats: {
                    $push: {
                        status: '$_id',
                        count: '$count'
                    }
                },
                total: { $sum: '$count' }
            }
        }
    ]);
};

applicationSchema.statics.findExpiredOffers = function() {
    return this.find({
        status: 'offered',
        'offerDetails.offerExpiresAt': { $lt: new Date() }
    });
};

applicationSchema.statics.findRecentApplications = function(days = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return this.find({
        createdAt: { $gte: date }
    }).populate('job applicant');
};

// Export the model
module.exports = mongoose.model('Application', applicationSchema);