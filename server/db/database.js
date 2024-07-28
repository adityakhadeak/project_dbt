import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
const connectToDB = async () => {

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export default connectToDB;