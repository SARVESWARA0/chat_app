'use client';

import { useChat } from 'ai/react'; // Import the `useChat` hook from the AI SDK
import { useEffect } from 'react';

export default function Chat() {
  // Use the `useChat` hook to manage the chat state
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  // Scroll to the bottom of the chat messages when a new message is added
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto">
      <h1 className="text-2xl font-semibold text-center mb-4">Chat with AI</h1>

      {/* Render messages in a scrollable container */}
      <div id="chat-container" className="flex-grow overflow-auto bg-gray-50 p-4 rounded-lg shadow-md mb-4">
        {messages.length === 0 && <p className="text-gray-500">No messages yet. Start the conversation!</p>}
        {messages.map((m) => (
          <div key={m.id} className={`my-2 p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'}`}>
            <span className="font-semibold">{m.role === 'user' ? 'User' : 'AI'}:</span>
            <span className="ml-2">{m.content}</span>
          </div>
        ))}
        {isLoading && <p className="text-gray-500">AI is typing...</p>}
      </div>

      {/* Chat input and submit button */}
      <form onSubmit={handleSubmit} className="flex">
        <input
          className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          placeholder="Type your message here..."
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white font-bold p-2 rounded-r-lg hover:bg-blue-700 transition duration-300"
          disabled={isLoading || input.trim() === ''}
        >
          Send
        </button>
      </form>
    </div>
  );
}
