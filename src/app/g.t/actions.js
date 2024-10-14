'use server';


import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
const google=createGoogleGenerativeAI({apiKey:process.env.GOOGLE_API_KEY})
const systemPrompt = JSON.stringify({persona:"you are a chatbot to help the user in chemistry related topics",
  instructions:"first check whether the user input is related to chemistry ,if not tell ur persona"
})
export async function continueConversation(history) {
  'use server';
  
  const { text } = await generateText({
    model: google('gemini-1.5-pro-002'),
    system: systemPrompt,
    messages: history,
  });

  return {
    messages: [
      ...history,
      {
        role: 'assistant',
        content: text,
      },
    ],
  };
}
