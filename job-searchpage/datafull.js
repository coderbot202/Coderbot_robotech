// populate-database.js - Run this to populate your database with sample data
require('dotenv').config();
const mongoose = require('mongoose');

// Import models
require('./models/User');
require('./models/Job');
const Job = require('./models/Job');

// Sample jobs data
const sampleJobs = [
  {
    title: 'Senior React Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'FULL-TIME',
    salary: '12K-18K',
    experience: '3-5 years',
    description: 'Build amazing React applications with cutting-edge technologies. Work with a talented team on challenging projects that impact millions of users.',
    requirements: ['3+ years React experience', 'TypeScript knowledge', 'Redux/Context API', 'REST API integration', 'Git proficiency'],
    tags: ['react', 'typescript', 'frontend', 'javascript', 'redux'],
    remote: true,
    featured: true,
    status: 'active',
    workMode: 'remote',
    jobLevel: 'senior',
    department: 'Engineering',
    industry: 'Technology',
    contactEmail: 'careers@techcorp.com',
    benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours', 'Remote Work']
  },
  {
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    type: 'FULL-TIME',
    salary: '9K-13K',
    experience: '2-4 years',
    description: 'Join our fast-growing startup and work on exciting projects that will shape the future of our industry.',
    requirements: ['JavaScript proficiency', 'Node.js experience', 'React knowledge', 'MongoDB familiarity', 'API development'],
    tags: ['javascript', 'nodejs', 'react', 'mongodb', 'fullstack'],
    remote: false,
    featured: true,
    status: 'active',
    workMode: 'on-site',
    jobLevel: 'mid',
    department: 'Engineering',
    industry: 'Technology',
    contactEmail: 'hiring@startupxyz.com',
    benefits: ['Equity', 'Learning Budget', 'Team Lunch', 'Growth Opportunities']
  },
  {
    title: 'Python Data Scientist',
    company: 'DataCorp India',
    location: 'Bangalore, India',
    type: 'FULL-TIME',
    salary: '15K-20K',
    experience: '3-6 years',
    description: 'Work on machine learning models and data analysis for business insights. Join our AI team working on cutting-edge projects.',
    requirements: ['Python expertise', 'Machine Learning', 'Pandas/NumPy', 'SQL knowledge', 'Statistical analysis'],
    tags: ['python', 'machine-learning', 'data-science', 'sql', 'ai'],
    remote: true,
    featured: true,
    status: 'active',
    workMode: 'hybrid',
    jobLevel: 'senior',
    department: 'Data Science',
    industry: 'Technology',
    contactEmail: 'careers@datacorp.in',
    benefits: ['Health Insurance', 'Flexible Hours', 'Conference Budget', 'Research Time']
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    location: 'Mumbai, India',
    type: 'FULL-TIME',
    salary: '5K-8K',
    experience: '2-5 years',
    description: 'Build and maintain scalable cloud infrastructure using modern DevOps practices. Work with containerization and automation.',
    requirements: ['AWS/Azure experience', 'Docker & Kubernetes', 'CI/CD pipelines', 'Infrastructure as Code', 'Linux administration'],
    tags: ['devops', 'aws', 'docker', 'kubernetes', 'automation'],
    remote: false,
    featured: false,
    status: 'active',
    workMode: 'on-site',
    jobLevel: 'mid',
    department: 'Infrastructure',
    industry: 'Technology',
    contactEmail: 'jobs@cloudtech.com',
    benefits: ['Health Insurance', 'Certification Budget', 'Team Outings']
  },
  {
    title: 'UI/UX Designer',
    company: 'Design Studio Pro',
    location: 'Delhi, India',
    type: 'FULL-TIME',
    salary: '8K-14K',
    experience: '2-4 years',
    description: 'Create beautiful and intuitive user experiences for web and mobile applications. Work with cross-functional teams.',
    requirements: ['Figma proficiency', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems'],
    tags: ['ui-design', 'ux-design', 'figma', 'adobe', 'prototyping'],
    remote: true,
    featured: false,
    status: 'active',
    workMode: 'remote',
    jobLevel: 'mid',
    department: 'Design',
    industry: 'Design',
    contactEmail: 'design@designstudio.com',
    benefits: ['Creative Freedom', 'Design Tools', 'Flexible Hours', 'Portfolio Time']
  },
  {
    title: 'Backend Node.js Developer',
    company: 'API Masters',
    location: 'Hyderabad, India',
    type: 'FULL-TIME',
    salary: '10K-16K',
    experience: '3-5 years',
    description: 'Develop robust backend APIs and microservices using Node.js and modern frameworks. Scale systems for high traffic.',
    requirements: ['Node.js expertise', 'Express.js', 'MongoDB/PostgreSQL', 'API design', 'Microservices'],
    tags: ['nodejs', 'backend', 'api', 'express', 'microservices'],
    remote: false,
    featured: true,
    status: 'active',
    workMode: 'on-site',
    jobLevel: 'senior',
    department: 'Engineering',
    industry: 'Technology',
    contactEmail: 'backend@apimasters.com',
    benefits: ['Health Insurance', 'Performance Bonus', 'Learning Budget']
  },
  {
    title: 'Mobile App Developer',
    company: 'MobileFirst Inc',
    location: 'Pune, India',
    type: 'FULL-TIME',
    salary: '9K-15K',
    experience: '2-4 years',
    description: 'Build cross-platform mobile applications using React Native or Flutter. Create amazing user experiences.',
    requirements: ['React Native/Flutter', 'Mobile UI/UX', 'API integration', 'App Store deployment', 'Performance optimization'],
    tags: ['mobile', 'react-native', 'flutter', 'ios-android', 'cross-platform'],
    remote: true,
    featured: false,
    status: 'active',
    workMode: 'hybrid',
    jobLevel: 'mid',
    department: 'Engineering',
    industry: 'Technology',
    contactEmail: 'mobile@mobilefirst.com',
    benefits: ['Device Allowance', 'Flexible Hours', 'Health Insurance']
  },
  {
    title: 'Product Manager',
    company: 'InnovateTech',
    location: 'Chennai, India',
    type: 'FULL-TIME',
    salary: '18K-28K',
    experience: '4-7 years',
    description: 'Lead product development and strategy for our B2B SaaS platform. Drive product vision and roadmap.',
    requirements: ['Product strategy', 'Agile methodologies', 'User research', 'Analytics', 'Stakeholder management'],
    tags: ['product-management', 'strategy', 'agile', 'saas', 'analytics'],
    remote: false,
    featured: true,
    status: 'active',
    workMode: 'on-site',
    jobLevel: 'senior',
    department: 'Product',
    industry: 'Technology',
    contactEmail: 'product@innovatetech.com',
    benefits: ['Stock Options', 'Health Insurance', 'Conference Budget', 'Team Building']
  },
  {
    title: 'Frontend React Developer',
    company: 'WebFlow Agency',
    location: 'Remote',
    type: 'CONTRACT',
    salary: '5K-8K',
    experience: '2-3 years',
    description: 'Work on multiple client projects building modern React applications. Perfect for developers who love variety.',
    requirements: ['React expertise', 'JavaScript ES6+', 'CSS/SCSS', 'Responsive design', 'Git workflow'],
    tags: ['react', 'frontend', 'javascript', 'css', 'contract'],
    remote: true,
    featured: false,
    status: 'active',
    workMode: 'remote',
    jobLevel: 'mid',
    department: 'Engineering',
    industry: 'Agency',
    contactEmail: 'contractors@webflow.com',
    benefits: ['Flexible Schedule', 'Project Variety', 'Remote Work']
  },
  {
    title: 'Junior Software Developer',
    company: 'TechStartup Labs',
    location: 'Gurgaon, India',
    type: 'FULL-TIME',
    salary: '6K-10K',
    experience: '0-2 years',
    description: 'Perfect entry-level position for recent graduates. Learn from experienced developers and grow your career.',
    requirements: ['Basic programming skills', 'Any language (Java/Python/JavaScript)', 'Problem-solving attitude', 'Willingness to learn'],
    tags: ['junior', 'entry-level', 'javascript', 'python', 'java'],
    remote: false,
    featured: false,
    status: 'active',
    workMode: 'on-site',
    jobLevel: 'entry',
    department: 'Engineering',
    industry: 'Technology',
    contactEmail: 'careers@techstartup.labs',
    benefits: ['Mentorship Program', 'Learning Budget', 'Health Insurance', 'Career Growth']
  }
];

// Database connection and population function
async function populateDatabase() {
  try {
    console.log('Starting database population...');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb+srv://manankhandelwal2020:nvdwKzOSWYJJhY3e@cluster1.mbd3gqb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1',
      {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      }
    );
    console.log('Connected to MongoDB (jobportal database)');
    
    // Clear existing jobs (THIS WILL DELETE ALL JOBS!)
    console.log('Clearing existing jobs...');
    const deleteResult = await Job.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing jobs`);
    
    // Insert sample jobs
    console.log('Inserting sample jobs...');
    const insertedJobs = await Job.insertMany(sampleJobs);
    
    console.log(`Successfully inserted ${insertedJobs.length} jobs!`);
    
    // Display inserted jobs
    console.log('\nInserted Jobs:');
    insertedJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company} (${job.location}) - ${job.salary}`);
    });
    
    // Get database statistics
    const totalJobs = await Job.countDocuments();
    const featuredJobs = await Job.countDocuments({ featured: true });
    const remoteJobs = await Job.countDocuments({ remote: true });
    const activeJobs = await Job.countDocuments({ status: 'active' });
    
    console.log('\nDatabase Statistics:');
    console.log(`Total Jobs: ${totalJobs}`);
    console.log(`Active Jobs: ${activeJobs}`);
    console.log(`Featured Jobs: ${featuredJobs}`);
    console.log(`Remote Jobs: ${remoteJobs}`);
    
    console.log('\nDatabase population completed successfully!');
    console.log('You can now visit http://localhost:5000/api/jobs to see your data');
    console.log('Your server will now use this fresh data from MongoDB');
    
  } catch (error) {
    console.error('Error populating database:', error);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the population
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase, sampleJobs };




//cd D:\Coderbot_robotech-main\job-searchpage