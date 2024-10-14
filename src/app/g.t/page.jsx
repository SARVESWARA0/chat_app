'use client';

import { useState } from 'react';
import Markdown from 'markdown-to-jsx'; // Import Markdown renderer
import { continueConversation } from './actions'; // Assuming continueConversation is in the same directory

export default function ChatPage() {
  const [conversation, setConversation] = useState([]); // Holds chat messages (user and AI)
  const [input, setInput] = useState(''); // Manages the input field text
  const [isLoading, setIsLoading] = useState(false); // Tracks loading state

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!input.trim()) return; // Avoid empty inputs

    setIsLoading(true);

    // Add user's input message to the conversation
    const userMessage = { role: 'user', content: input };
    const updatedConversation = [...conversation, userMessage];

    setConversation(updatedConversation); // Update UI with user's message
    setInput(''); // Clear the input field

    // Call the API to continue the conversation
    try {
      const { messages } = await continueConversation(updatedConversation);
      setConversation(messages); // Update conversation with AI's response
    } catch (error) {
      console.error("Error during API call:", error);
      setConversation([
        ...updatedConversation,
        { role: 'assistant', content: "There was an error processing your request." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle key press event
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(); // Call submit function on Enter key press
    }
  };

  return (
    <div className="chat-page">
      {/* Render chat messages */}
      <div className="chat-container">
        {conversation.length > 0 ? (
          <div className="chat-messages">
            {conversation.map((message, index) => (
              <div key={index} className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}>
                <strong>{message.role === 'user' ? 'User: ' : 'AI: '}</strong> 
                <Markdown>{message.content}</Markdown> {/* Render Markdown content */}
              </div>
            ))}
          </div>
        ) : (
          <p>No messages yet. Start the conversation!</p>
        )}
      </div>

      {/* Input form for user input */}
      <div className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress} // Add key press event
          placeholder={isLoading ? 'Please wait...' : 'Type a message...'}
          disabled={isLoading}
          className="chat-input"
        />
        <button onClick={handleSubmit} disabled={!input.trim() || isLoading} className="submit-button">
          {isLoading ? 'Loading...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
