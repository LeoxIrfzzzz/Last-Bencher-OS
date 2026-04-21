import { GoogleGenAI, Type } from "@google/genai";
import { TimeSlot, DayOfWeek } from "../types";

// The API key for deployment should be set as VITE_GEMINI_API_KEY in Netlify/Vercel.
// In AI Studio, it uses process.env.GEMINI_API_KEY.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (process as any).env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey });

export async function extractTimetableFromImage(base64Data: string, mimeType: string): Promise<TimeSlot[]> {
  const prompt = `Extract the weekly academic schedule from this image. 
  Return a JSON array of objects with the following fields: 
  subject (string), 
  day (string, must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday), 
  startTime (string, standard 24h format HH:mm), 
  endTime (string, standard 24h format HH:mm).
  
  Only include actual lecture/class sessions. Ignore breaks or lunch.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            day: { type: Type.STRING },
            startTime: { type: Type.STRING },
            endTime: { type: Type.STRING }
          },
          required: ["subject", "day", "startTime", "endTime"]
        }
      }
    }
  });

  const parsed = JSON.parse(response.text || "[]");
  
  // Add IDs to the slots
  return parsed.map((slot: any) => ({
    ...slot,
    id: crypto.randomUUID()
  }));
}
