import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const geminiModel = ai.models.generateContent.bind(ai.models);

export async function generateResumeFeedback(resumeText: string) {
  const prompt = `Analyze the following resume and provide constructive feedback to improve it. 
  Focus on layout, keywords, and impact.
  
  Resume:
  ${resumeText}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}

export async function generateWebsiteIdea(industry: string) {
  const prompt = `Generate 5 creative website ideas for the ${industry} industry. 
  Include a name, unique value proposition, and key features for each.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}

export async function explainCode(code: string) {
  const prompt = `Explain the following code in simple terms:
  
  ${code}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}

export async function summarizeText(text: string) {
  const prompt = `Summarize the following text in a concise manner:
  
  ${text}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}
