const mongoose = require('mongoose');

function connectMongoDB(url) {
    mongoose.connect(url);

    mongoose.connection.on('connected', () => {
        console.log('MongoDB is running...');
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
        console.error(`MongoDB connection failed: ${err}`);
    });

    const gracefulExit = async () => {
        try {
            await mongoose.connection.close();
            console.log('Server disconnected from MongoDB');
            process.exit(0);
        } catch (err) {
            console.error(`Error closing MongoDB connection: ${err}`);
            process.exit(1);
        }
    };

    process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);
}

module.exports = connectMongoDB;
