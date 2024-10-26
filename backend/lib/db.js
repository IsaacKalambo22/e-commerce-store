import mongoose from "mongoose";

// Connect to MongoDB
export const connectDB = async () => {
    
    try {
        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error){
        // Log error
        console.log("Error connecting to MongoDB",error.message);
        process.exit(1);
    }
}