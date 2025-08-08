// config/database.js - Fixed database configuration
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Attempting MongoDB connection...');
        
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://manankhandelwal2020:gW72mZR8Pgy0yCEp@cluster1.mbd3gqb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
        
        const options = {
            // Connection timeout settings
            serverSelectionTimeoutMS: 5000, // Reduced from 10000ms to 5000ms
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            
            // Buffer settings
            bufferCommands: false,
            maxPoolSize: 10,
            
            // Other options
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        console.log('Connecting to MongoDB...');
        
        // Set mongoose to not buffer operations
        mongoose.set('bufferCommands', false);
        
        const conn = await mongoose.connect(mongoURI, options);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        
        // Test the connection with a simple operation
        await mongoose.connection.db.admin().ping();
        console.log('Database ping successful');
        
        // Connection event handlers
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        
        return conn;
        
    } catch (error) {
        console.error('Database connection failed:', error.message);
        
        // Don't exit the process, let the app continue with mock data
        if (error.name === 'MongoServerSelectionError') {
            console.log('This appears to be a network/server selection issue');
            console.log('The app will continue using mock data');
        }
        
        throw error; // Throw to let the caller handle it
    }
};

// Graceful shutdown
const gracefulShutdown = async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
    } catch (error) {
        console.error('Error during database shutdown:', error);
    }
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // For nodemon restart

module.exports = connectDB;