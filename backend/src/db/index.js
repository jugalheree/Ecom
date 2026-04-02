import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
            // FIX: Add timeouts to prevent hanging connections
            serverSelectionTimeoutMS: 10000,  // 10s to find a server
            socketTimeoutMS: 45000,           // 45s socket inactivity timeout
            connectTimeoutMS: 10000,          // 10s to establish connection
        });
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);

        // FIX: Graceful shutdown — close DB connection when process exits
        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            console.log("MongoDB connection closed on app termination");
            process.exit(0);
        });

    } catch (error) {
        console.error("MONGODB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;