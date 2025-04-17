import dotenv from "dotenv";
dotenv.config();

import Audio from "../../models/Audio.js";
import {
  generateSummary,
  extractActionItems,
  segregateSpeakers,
  generateMinutesOfMeeting,
} from "./summarize.js";

const SUMMARY_INTERVAL = 60 * 1000; // 30 seconds

export async function processPendingSummaries() {
  try {
    console.log("🔎 Checking for audios with PENDING summaries...");

    const pendingAudios = await Audio.find({ summary: "PENDING" });

    if (pendingAudios.length === 0) {
      console.log("✅ No pending summaries found.");
      return;
    }

    console.log(`📝 Found ${pendingAudios.length} audio(s) to summarize.`);

    for (const audio of pendingAudios) {
      try {
        await Audio.updateOne({ _id: audio._id }, { summary: "SUMMARIZING" });
        console.log(`⏳ Summarizing: ${audio.filename}`);

        const [summaryText, actionItems, speakerDialogues, mom] =
          await Promise.all([
            generateSummary(audio.transcription),
            extractActionItems(audio.transcription),
            segregateSpeakers(audio.transcription),
            generateMinutesOfMeeting(audio.transcription),
          ]);

        await Audio.updateOne(
          { _id: audio._id },
          {
            summary: summaryText,
            actionItems,
            speakers: speakerDialogues,
            mom,
          }
        );

        console.log(`✅ Processed and updated: ${audio.filename}`);
      } catch (err) {
        console.error(`❌ Error summarizing ${audio.filename}:`, err.message);
        await Audio.updateOne(
          { _id: audio._id },
          { summary: "SUMMARY_FAILED" }
        );
      }
    }
  } catch (err) {
    console.error("❌ Error in processPendingSummaries:", err.message);
  }
}

export function startSummaryService() {
  console.log("🚀 Starting summary service...");
  console.log(`⏱️ Will scan every ${SUMMARY_INTERVAL / 1000} seconds`);
  processPendingSummaries(); 
  setInterval(processPendingSummaries, SUMMARY_INTERVAL);
}
