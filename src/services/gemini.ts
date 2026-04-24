import { GoogleGenAI } from "@google/genai";
import { HackAgent, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askAgent(agent: HackAgent, history: ChatMessage[], message: string) {
  const model = "gemini-3-flash-preview";
  
  const contents = [
    ...history.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    })),
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: agent.instruction,
    },
  });

  return response.text || "I'm sorry, I couldn't process that.";
}

export async function askAgentStream(
  agent: HackAgent, 
  history: ChatMessage[], 
  message: string, 
  onChunk: (text: string) => void
) {
  const model = "gemini-3-flash-preview";
  
  const contents = [
    ...history.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    })),
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

  const stream = await ai.models.generateContentStream({
    model,
    contents,
    config: {
      systemInstruction: agent.instruction,
    },
  });

  let fullText = "";
  for await (const chunk of stream) {
    const chunkText = chunk.text;
    if (chunkText) {
      fullText += chunkText;
      onChunk(fullText);
    }
  }

  return fullText;
}

export async function brainstormIdeas(theme: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate 3 innovative and high-potential hackathon project ideas based on the theme: "${theme}". 
  For each idea, provide:
  1. A catchy title.
  2. A 2-sentence description.
  3. The core AI technology it would use.
  4. 2-3 specific technical challenges they might face.
  5. 2-3 titles of relevant research papers (simulated but realistic).
  
  Format the output as a JSON object with a key "ideas" which is an array of objects with keys: "title", "description", "tech", "challenges" (array), "research" (array of {title, relevance}).`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const parsed = JSON.parse(response.text || '{"ideas": []}');
  return parsed.ideas;
}

export async function explainCode(code: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `Explain the following code snippet, identify any potential bugs, and suggest improvements for performance and readability:
  
  \`\`\`
  ${code}
  \`\`\``;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text || "Analysis failed.";
}

export async function generatePitch(project: any) {
  const model = "gemini-3-flash-preview";
  const prompt = `Create a compelling 2-minute hackathon pitch for the following project:
  Project Name: ${project.name}
  Tagline: ${project.tagline}
  Problem: ${project.problem}
  Solution: ${project.solution}
  
  Include a Hook, Problem, Solution, Demo Highlights, and a call to action.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text || "Pitch generation failed.";
}
