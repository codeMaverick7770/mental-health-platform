import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri || typeof uri !== 'string' || !uri.trim()) {
            throw new Error('Missing MONGO_URI in environment. Set it in server/.env');
        }
        let connect = await mongoose.connect(uri);
        console.log('MongoDB Connected!' , connect.connection.host);
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        // One quick retry after 2s for transient DNS/network issues
        try {
            await new Promise(r => setTimeout(r, 2000));
            const uri = process.env.MONGO_URI;
            if (!uri) throw new Error('Missing MONGO_URI in environment. Set it in server/.env');
            let connect = await mongoose.connect(uri);
            console.log('MongoDB Connected on retry!' , connect.connection.host);
        } catch (err2) {
            console.error('MongoDB retry failed:', err2.message);
            process.exit(1);
        }
    }
};
