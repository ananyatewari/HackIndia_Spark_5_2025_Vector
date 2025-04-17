import dotenv from "dotenv";
import { transcribeAudio } from "./transcribe/whisper.js";
import {
  generateSummary,
  extractActionItems,
  segregateSpeakers,
  generateMinutesOfMeeting
} from "./summarize/summarize.js";
import { saveToGoogleDocs } from "./integrations/googleDocs.js";

dotenv.config();

const FILE_PATH = "C:\\Users\\Hp\\Downloads\\abc.mp3";

async function run() {
  console.log("⏳ Transcribing audio...");
  const transcript = await transcribeAudio(FILE_PATH);

  if (!transcript) {
    console.log("❌ Transcription failed");
    return;
  }

  console.log("📝 Transcription:\n", transcript);

  console.log("\n🔎 Generating summary...");
  const summary = await generateSummary(transcript);
  console.log("\n📜 Summary:\n", summary);

  console.log("\n🔍 Extracting action items...");
  const actionItems = await extractActionItems(transcript);
  console.log("\n🎯 Action Items:\n", actionItems);

  console.log("\n🗣️ Segregating dialogue by speakers...");
  const speakers = await segregateSpeakers(transcript);
  console.log("\n👥 Speaker-wise Dialogue:\n", speakers);

  console.log("\n📋 Generating Minutes of Meeting...");
  const mom = await generateMinutesOfMeeting(transcript);
  console.log("\n📝 Minutes of Meeting:\n", mom);

  await saveToGoogleDocs({
    title: "Team Sync - April 17, 2025",
    summary,
    actionItems,
    mom,
  });
}

run();
