import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import meetingRoutes from "./routes/meetingRoutes.js"
import { connectDB } from './db/mongodb.js';

const app = express();

app.use(cors());
app.use(express.json());
connectDB();

app.use('/api/meetings', meetingRoutes);

mongoose.connect('mongodb://localhost:27017/speakly', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
