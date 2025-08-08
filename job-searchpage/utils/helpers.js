// job-searchpage/utils/helpers.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const helpers = {
    // Format response structure
    formatResponse: (success, message, data = null, errors = null) => {
        const response = { success, message };
        if (data) response.data = data;
        if (errors) response.errors = errors;
        return response;
    },

    // Pagination helper
    getPagination: (page = 1, limit = 10, total = 0) => {
        const currentPage = parseInt(page);
        const itemsPerPage = parseInt(limit);
        const totalPages = Math.ceil(total / itemsPerPage);

        return {
            current: currentPage,
            limit: itemsPerPage,
            total: parseInt(total),
            pages: totalPages,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
            next: currentPage < totalPages ? currentPage + 1 : null,
            prev: currentPage > 1 ? currentPage - 1 : null
        };
    },

    // Format salary range
    formatSalary: (min, max, currency = 'USD') => {
        const formatNumber = (num) => {
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
            return num.toString();
        };

        const symbol = currency === 'USD' ? '$' : currency;

        if (min && max) {
            return `${symbol}${formatNumber(min)} - ${symbol}${formatNumber(max)}`;
        } else if (min) {
            return `${symbol}${formatNumber(min)}+`;
        } else if (max) {
            return `Up to ${symbol}${formatNumber(max)}`;
        }

        return 'Competitive';
    },

    // Calculate time difference
    timeAgo: (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    },

    // Generate unique filename
    generateUniqueFilename: (originalName) => {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const extension = originalName.split('.').pop();
        return `${timestamp}-${randomString}.${extension}`;
    },

    // Validate email format
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Generate random password
    generatePassword: (length = 12) => {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    },

    // Slugify string for URLs
    slugify: (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    },

    // Extract keywords from text
    extractKeywords: (text, maxKeywords = 10) => {
        const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !commonWords.includes(word));

        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        return Object.entries(wordCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, maxKeywords)
            .map(([word]) => word);
    },

    // Build search query
    buildSearchQuery: (searchTerm) => {
        if (!searchTerm) return {};

        const searchRegex = new RegExp(searchTerm, 'i');
        return {
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { company: searchRegex },
                { tags: { $in: [searchRegex] } },
                { location: searchRegex }
            ]
        };
    },

    // Filter and sort utilities
    buildFilterQuery: (filters) => {
        const query = {};

        if (filters.location) {
            query.location = new RegExp(filters.location, 'i');
        }

        if (filters.type) {
            query.type = filters.type.toUpperCase();
        }

        if (filters.remote !== undefined) {
            query.remote = filters.remote === 'true';
        }

        if (filters.salaryMin || filters.salaryMax) {
            query.salary = {};
            if (filters.salaryMin) query.salary.$gte = parseInt(filters.salaryMin);
            if (filters.salaryMax) query.salary.$lte = parseInt(filters.salaryMax);
        }

        return query;
    }
};

module.exports = helpers;
