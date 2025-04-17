import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import dotenv from "dotenv";
dotenv.config();

const gemini = new ChatGoogleGenerativeAI({
  model: "models/gemini-1.5-pro",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.7,
});

const summaryPrompt = new PromptTemplate({
  template: "Summarize the following meeting transcript into a brief summary:\n{transcript}",
  inputVariables: ["transcript"],
});

const actionItemPrompt = new PromptTemplate({
  template: "Extract action items from the following meeting transcript:\n{transcript}",
  inputVariables: ["transcript"],
});

const speakerPrompt = new PromptTemplate({
  template: "Segregate the following meeting transcript by speaker and create a dialogue for each speaker:\n{transcript}",
  inputVariables: ["transcript"],
});

const momPrompt = new PromptTemplate({
  template: `
Generate a professional and well-structured Minutes of Meeting (MoM) from the following transcript.

Use this format:

---
### 📝 Minutes of Meeting (MOM)
**Meeting Title:** [Auto-detect from transcript or mention “Team Sync” if not available]  
**Date:** [Use today's date or infer if provided]

#### 1. Meeting Highlights / Agenda
- [Bullet point summary]

#### 2. Key Performance / Progress Updates
- [Achievements, updates, stats]

#### 3. Issues & Challenges Identified
- [Pain points discussed]

#### 4. New Initiatives / Announcements
- **A. [Title]**
  - Description

#### 5. Responsibilities / Expectations
- [What’s expected from participants]

#### 6. Clarifications / FAQs
- [Common questions and answers]

#### 7. Action Items
- ✅ [Clear tasks from discussion]

📅 Next Meeting: [If mentioned]  
📌 Resources/Recording: [If mentioned]

---

TRANSCRIPT:
{transcript}
`,
  inputVariables: ["transcript"],
});

export async function generateSummary(transcript) {
  const chain = new LLMChain({ llm: gemini, prompt: summaryPrompt });
  const result = await chain.call({ transcript });
  return result.text;
}

export async function extractActionItems(transcript) {
  const chain = new LLMChain({ llm: gemini, prompt: actionItemPrompt });
  const result = await chain.call({ transcript });
  return result.text;
}

export async function segregateSpeakers(transcript) {
  const chain = new LLMChain({ llm: gemini, prompt: speakerPrompt });
  const result = await chain.call({ transcript });
  return result.text;
}

export async function generateMinutesOfMeeting(transcript) {
  const chain = new LLMChain({ llm: gemini, prompt: momPrompt });
  const result = await chain.call({ transcript });
  return result.text;
}
