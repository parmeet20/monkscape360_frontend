import { GoogleGenAI } from '@google/genai';
import { config } from "@/lib/config";

const GEMINI_API_KEY = config.NEXT_PUBLIC_GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function askGemini(prompt: string) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: prompt,
        });
        return response.text || 'No response';
    } catch (error: any) {
        console.error('askGemini error:', error);
        throw new Error('Failed to fetch from Gemini API');
    }
}
