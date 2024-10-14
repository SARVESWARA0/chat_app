'use client';

import { useState, useEffect, useCallback } from 'react';
import Markdown from 'markdown-to-jsx';
import { continueConversation } from './actions'; // Import continueConversation from route

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle user input
  const onInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  // Handle form submission to send the user's input
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputValue.trim() === '') return;

    const userMessage = { id: Date.now(), content: inputValue, role: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Continue the conversation by sending the current message history
      const response = await continueConversation([...messages, userMessage]);

      if (response?.messages) {
        setMessages(response.messages);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          content: 'Error: Failed to get AI response.',
          role: 'ai',
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('Error during API call:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: 'Error: Could not connect to server.',
        role: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-page">
      <div className="chat-container">
        {messages.length > 0 ? (
          <div className="chat-messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`message ${m.role === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <strong>{m.role === 'user' ? 'User: ' : 'AI: '}</strong>
                <Markdown>{m.content}</Markdown>
              </div>
            ))}
          </div>
        ) : (
          <p className="loading-indicator">No messages yet. Start the conversation!</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={inputValue}
          placeholder={isLoading ? 'Please wait...' : 'Ask about technology...'}
          onChange={onInputChange}
          className="chat-input"
          autoComplete="off"
          aria-label="Chat input"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="submit-button"
          disabled={!inputValue.trim() || isLoading}
        >
          {isLoading ? 'Loading...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
