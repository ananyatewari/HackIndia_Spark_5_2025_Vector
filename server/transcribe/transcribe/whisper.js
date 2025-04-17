import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

async function uploadAudio(filePath) {
  const audioData = fs.readFileSync(filePath);

  const response = await axios.post('https://api.assemblyai.com/v2/upload', audioData, {
    headers: {
      'authorization': ASSEMBLYAI_API_KEY,
      'content-type': 'application/octet-stream',
    },
  });

  return response.data.upload_url;
}

async function startTranscription(audioUrl) {
  const response = await axios.post(
    'https://api.assemblyai.com/v2/transcript',
    {
      audio_url: audioUrl,
    },
    {
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
    }
  );

  return response.data.id;
}

async function waitForCompletion(transcriptId) {
  while (true) {
    const response = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      {
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
        },
      }
    );

    if (response.data.status === 'completed') {
      return response.data.text;
    } else if (response.data.status === 'error') {
      throw new Error(`Transcription failed: ${response.data.error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

export async function transcribeAudio(filePath) {
  try {
    const audioUrl = await uploadAudio(filePath);
    const transcriptId = await startTranscription(audioUrl);
    const text = await waitForCompletion(transcriptId);
    return text;
  } catch (err) {
    console.error('❌ Error using AssemblyAI:', err.message);
    return null;
  }
}
