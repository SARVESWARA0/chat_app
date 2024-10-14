import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize Google Gemini AI with your API key
const google = createGoogleGenerativeAI({
  apiKey:process.env.GOOGLE_API_KEY, // Ensure your API key is set in your environment variables
});

// Define the system prompt and persona
const systemPrompt = `persona: You are an AI assistant specialized in psychology. You are knowledgeable about various psychological theories, practices, mental health topics, and human behavior. 

instructions: Respond only to questions and topics related to psychology. If a user asks about topics outside of psychology, respond with: "I can only assist with questions related to psychology. Please ask about psychological theories, mental health, or human behavior."


`;

export async function POST(req, res) {
  try {
    const { messages } = await req.json(); // Extract messages from the request body

    // Combine system prompt with user messages
    const combinedMessages = [
      { role: 'system', content: systemPrompt }, // Add the system prompt
      ...convertToCoreMessages(messages) // Convert user messages to the core format
    ];

    // Stream text from the Gemini model
    const result = await streamText({
      model: google('gemini-1.5-pro-002'), // Use the Gemini model identifier
      messages: combinedMessages, // Pass the combined system and user messages
    });

    // Convert the response to a stream and send it back
    return result.toDataStreamResponse(res);
  } catch (error) {
    console.error('Error in streaming text response:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
