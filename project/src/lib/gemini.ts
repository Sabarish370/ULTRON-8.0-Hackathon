import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateResponse(prompt: string): Promise<string> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add your API key to the .env file.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Add safety settings and structure the prompt
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const response = await result.response;
    
    if (!response.text()) {
      throw new Error('No response generated');
    }
    
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate response: ${error.message}`);
    }
    throw new Error('Failed to generate response');
  }
}