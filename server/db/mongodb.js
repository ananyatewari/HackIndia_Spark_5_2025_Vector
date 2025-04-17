import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://ananya:sona@speakly.heepgwn.mongodb.net/Speakly?retryWrites=true&w=majority&appName=Speakly";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
