import { google } from "googleapis";
import fs from "fs";

const credentials = JSON.parse(fs.readFileSync("google-credentials.json"));

const SCOPES = ["https://www.googleapis.com/auth/documents", "https://www.googleapis.com/auth/drive"];

const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  SCOPES
);

const docs = google.docs({ version: "v1", auth });
const drive = google.drive({ version: "v3", auth });

export async function saveToGoogleDocs({ title, summary, actionItems, mom }) {
  try {
    const doc = await docs.documents.create({
      requestBody: {
        title: title,
      },
    });

    const documentId = doc.data.documentId;

    const sections = [
      { heading: "📜 Summary", content: summary },
      { heading: "🎯 Action Items", content: actionItems },
      { heading: "📋 Minutes of Meeting", content: mom },
    ];

    let requests = [];

    let index = 1;
    requests.push({
      insertText: {
        location: { index },
        text: `${title}\n\n`,
      },
    });
    requests.push({
      updateTextStyle: {
        range: {
          startIndex: index,
          endIndex: index + title.length,
        },
        textStyle: {
          bold: true,
          fontSize: { magnitude: 18, unit: "PT" },
        },
        fields: "bold,fontSize",
      },
    });

    index += title.length + 2;

    for (const section of sections) {
      requests.push({
        insertText: {
          location: { index },
          text: `${section.heading}\n`,
        },
      });
      requests.push({
        updateTextStyle: {
          range: {
            startIndex: index,
            endIndex: index + section.heading.length,
          },
          textStyle: {
            bold: true,
            fontSize: { magnitude: 14, unit: "PT" },
          },
          fields: "bold,fontSize",
        },
      });

      index += section.heading.length + 1;

      const contentText = `${section.content.trim()}\n\n`;
      requests.push({
        insertText: {
          location: { index },
          text: contentText,
        },
      });

      index += contentText.length;
    }

    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests },
    });

    await drive.permissions.create({
      fileId: documentId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    console.log(`✅ Google Doc created: https://docs.google.com/document/d/${documentId}`);

  } catch (err) {
    console.error("❌ Failed to create or share Google Doc:", err.message);
  }
}
