// setup.js - Project setup script
const fs = require('fs');
const path = require('path');

console.log('Setting up CodeBot Job Portal...\n');

// Create directory structure
const directories = [
    'backend',
    'backend/models',
    'backend/routes',
    'backend/middleware',
    'backend/config',
    'backend/utils',
    'backend/uploads',
    'job-searchpage',
    'job-searchpage/assets',
    'job-searchpage/assets/css',
    'job-searchpage/assets/js',
    'job-searchpage/assets/images'
];

console.log('Creating directory structure...');
directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created: ${dir}`);
    } else {
        console.log(`Already exists: ${dir}`);
    }
});

// Create .env file
const envContent = `# Environment Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://manankhandelwal2020:ZnIEPKoRE3X034Z0@cluster1.mbd3gqb.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster1

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=5MB
UPLOAD_PATH=./uploads

# Redis (for session storage and caching)
REDIS_URL=redis://localhost:6379

# API Keys (if needed)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
LINKEDIN_API_KEY=your-linkedin-api-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=10
SESSION_SECRET=your-session-secret-change-this`