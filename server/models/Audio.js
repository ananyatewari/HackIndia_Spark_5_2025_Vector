import mongoose from "mongoose";

const audioSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  size: {
    type: Number,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  transcription: {
    type: String,
    required: true,
  },
  processed: {
    type: Boolean,
    default: false,
  },
  summary: {
    type: String,
    required: true,
    default: "PENDING",
  },
  actionItems: {
    type: String,
    default: "",
  },
  speakers: {
    type: String,
    default: "",
  },
  mom: {
    type: String,
    default: "",
  },
});

const Audio = mongoose.model("Audio", audioSchema);

export default Audio;
