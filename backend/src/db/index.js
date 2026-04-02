import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        });
        logger.info("MongoDB connected", { host: connectionInstance.connection.host });

        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            logger.info("MongoDB connection closed on app termination");
            process.exit(0);
        });

    } catch (error) {
        logger.error("MongoDB connection failed", error);
        process.exit(1);
    }
};

export default connectDB;