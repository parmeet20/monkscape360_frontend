// lib/config.ts
export const config = {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "",
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || "",
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
};
