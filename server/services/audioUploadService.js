import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Audio from "../models/Audio.js";
import { transcribeAudio } from "../transcribe/transcribe/whisper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUDIO_DIR = path.join(__dirname, "../uploads/audio");
const SCAN_INTERVAL = 60 * 1000; 

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  console.log(`Created audio upload directory at ${AUDIO_DIR}`);
}

async function processAudioFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return;
    }

    const filename = path.basename(filePath);
    const existingAudio = await Audio.findOne({ filename });

    if (existingAudio && existingAudio.processed) {
      console.log(`⏭️ Already processed: ${filename}, skipping...`);
      return;
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      console.error(`❌ File is empty: ${filePath}`);
      return;
    }

    console.log(`📥 Processing file: ${filePath}`);
    console.log(`📦 File size: ${stats.size} bytes`);

    const extension = path.extname(filePath).toLowerCase();
    const contentType =
      {
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".m4a": "audio/m4a",
        ".ogg": "audio/ogg",
        ".webm": "audio/webm",
      }[extension] || "audio/mpeg";

    console.log(`🔊 Starting transcription for: ${filePath}`);
    try {
      const transcription = await transcribeAudio(filePath);

      if (!transcription || typeof transcription !== "string") {
        throw new Error("❗ Transcription returned invalid result");
      }

      console.log(`✅ Transcription completed for: ${filePath}`);
      console.log(`📝 Preview: ${transcription.substring(0, 100)}...`);

      const audioData = {
        filename,
        size: stats.size,
        contentType,
        transcription,
        processed: true,
      };

      if (existingAudio) {
        await Audio.updateOne({ _id: existingAudio._id }, audioData);
        console.log(`🔁 Updated existing record in database: ${filePath}`);
      } else {
        const audio = new Audio(audioData);
        await audio.save();
        console.log(`💾 Saved new file to database: ${filePath}`);
      }

      console.log(`📁 Retained processed file: ${filePath}`);
    } catch (transcriptionError) {
      console.error(
        `❌ Transcription error: ${
          transcriptionError.stack || transcriptionError
        }`
      );

      const audioData = {
        filename,
        size: stats.size,
        contentType,
        transcription: "TRANSCRIPTION_FAILED",
        processed: false,
      };

      if (existingAudio) {
        await Audio.updateOne({ _id: existingAudio._id }, audioData);
        console.log(
          `⚠️ Updated existing record with failed transcription: ${filePath}`
        );
      } else {
        const audio = new Audio(audioData);
        await audio.save();
        console.log(
          `⚠️ Saved audio without transcription (to retry later): ${filePath}`
        );
      }
    }
  } catch (error) {
    console.error(
      `❌ Error processing file ${filePath}:`,
      error.stack || error
    );
  }
}


async function scanAndProcessFiles() {
  try {
    console.log(`🔍 Scanning directory: ${AUDIO_DIR}`);
    const files = fs.readdirSync(AUDIO_DIR);

    const audioFiles = files.filter((file) => {
      const filePath = path.join(AUDIO_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        const isAudioFile = file.match(/\.(mp3|wav|m4a|ogg|webm)$/i);
        return stats.isFile() && isAudioFile;
      } catch (error) {
        console.error(`❌ Error checking file ${file}:`, error.stack || error);
        return false;
      }
    });

    console.log(`🎧 Found ${audioFiles.length} audio file(s) to process`);

    for (const file of audioFiles) {
      const filePath = path.join(AUDIO_DIR, file);
      console.log(`➡️ Starting processing for: ${file}`);
      await processAudioFile(filePath);
    }

    if (audioFiles.length > 0) {
      console.log(`✅ Finished batch processing ${audioFiles.length} file(s)`);
    }
  } catch (error) {
    console.error("❌ Error scanning directory:", error.stack || error);
  }
}

export function startAudioUploadService() {
  console.log("🚀 Starting audio upload service...");
  console.log(`⏱️ Will scan every ${SCAN_INTERVAL / 1000} seconds`);
  console.log(`📂 Monitoring directory: ${AUDIO_DIR}`);

  scanAndProcessFiles();
  setInterval(scanAndProcessFiles, SCAN_INTERVAL);
}
