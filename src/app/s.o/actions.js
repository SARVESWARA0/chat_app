import { streamObject } from 'ai'; // Import the AI SDK
import { createGoogleGenerativeAI } from '@ai-sdk/google'; // Ensure correct AI SDK import
import { z } from 'zod'; // Import Zod for schema validation

const google = createGoogleGenerativeAI({
  apiKey:process.env.GOOGLE_API_KEY, // Securely access API key from environment variables
});

// Define the system prompt with specific instructions
const systemPrompt = `
persona: You are an AI assistant specialized in green environments and sustainability, capable of answering questions related to eco-friendly practices, renewable energy, conservation, climate change, and anything else within the realm of environmental science.

instructions: If a user asks a question unrelated to green environments or sustainability, respond with: "I can only assist with questions related to green environments and sustainability. Please ask about eco-friendly practices or environmental science."
`;

// Define the schema using Zod
const schema = z.object({
  response: z.object({
    message: z.string(),
    suggestions: z.array(z.string()).optional(),
    metadata: z.object({
      confidence: z.number().min(0).max(1),
      category: z.string(),
    }).optional(),
  }),
});

export async function continueConversation(history) {
  // Combine the system prompt with the conversation history
  const combinedPrompt = `${systemPrompt}\nUser: ${history.map((msg) => msg.content).join('\nUser: ')}`;

  try {
    // Use streamObject() to stream structured responses from the model
    const { partialObjectStream } = await streamObject({
      model: google('gemini-1.5-pro-002'),
      prompt: combinedPrompt,
      schema: schema, // Pass the schema to validate the response
    });

    let lastMessage = '';
    let newMessages = [...history]; // Keep track of the conversation history

    // Process the partial responses
    for await (const partialObject of partialObjectStream) {
      if (partialObject && partialObject.response && partialObject.response.message) {
        lastMessage = partialObject.response.message;

        // Update the conversation history with the latest AI response
        newMessages = [
          ...newMessages,
          {
            role: 'assistant',
            content: lastMessage,
          },
        ];
      }
    }

    // Return the updated conversation history
    return {
      messages: newMessages,
    };

  } catch (error) {
    console.error('Error during conversation continuation:', error);
    throw new Error('Failed to generate AI response');
  }
}
