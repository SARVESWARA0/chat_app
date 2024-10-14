'use client';

import { useChat } from 'ai/react';
import { useState, useEffect, useCallback } from 'react';
import Markdown from 'markdown-to-jsx';

// ChatPage component using useChat hook from ai/react
export default function ChatPage() {
  // Destructure values from useChat hook
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [inputValue, setInputValue] = useState(input); // Local state for input value

  // Optimized input change handler
  const onInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setInputValue(value); // Update local state
      handleInputChange(e); // Sync with useChat's input handler
    },
    [handleInputChange]
  );

  // Filter out empty or unwanted messages before rendering
  const filteredMessages = messages.filter((m) => m.content.trim() !== "");

  // Auto scroll to the bottom of chat container when messages update
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [filteredMessages]);

  // Log messages and input value for debugging
  useEffect(() => {
    console.log('Filtered Messages:', filteredMessages);
    console.log('Input Value:', inputValue);
  }, [filteredMessages, inputValue]);

  // Submit handler that uses handleSubmit and resets the input
  const onSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return; // Prevent empty submissions
    handleSubmit(e); // Submit the form
    setInputValue(''); // Clear input after submit
  };

  return (
    <div className="chat-container">
      {/* Render chat messages */}
      <div className="chat-messages">
        {filteredMessages && filteredMessages.length > 0 ? (
          filteredMessages.map((m) => (
            <div
              key={m.id}
              className={m.role === 'user' ? 'user-message' : 'ai-message'}
            >
              <strong>{m.role === 'user' ? 'User: ' : 'AI: '}</strong>
              {/* Display message content only if it's not empty */}
              <Markdown>{m.content}</Markdown>
            </div>
          ))
        ) : (
          <p className="loading-indicator">No messages yet. Start the conversation!</p>
        )}
      </div>

      {/* Chat input and submit button */}
      <form onSubmit={onSubmit} className="chat-form">
        <input
          type="text"
          value={inputValue} // Use local state for better control
          placeholder="Say something..."
          onChange={onInputChange} // Optimized change handler
          className="chat-input"
          autoComplete="off"
          aria-label="Chat input"
        />
        <button
          type="submit"
          className="submit-button"
          disabled={!inputValue.trim()} // Disable button if input is empty
        >
          Send
        </button>
      </form>
    </div>
  );
}
