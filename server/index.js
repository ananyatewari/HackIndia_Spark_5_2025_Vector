import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import meetingRoutes from "./routes/meetingRoutes.js";
import analyticsRoutes from "./routes/analytics.js";
import { connectDB } from "./db/mongodb.js";
import { startAudioUploadService } from "./services/audioUploadService.js";
import { startSummaryService } from "./transcribe/summarize/processPendingSummaries.js";

const app = express();

app.use(cors());
app.use(express.json());
connectDB();

startAudioUploadService();
startSummaryService();

app.use("/api/meetings", meetingRoutes);
app.use("/api/analytics", analyticsRoutes);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
