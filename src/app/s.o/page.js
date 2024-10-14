'use client';

import React, { useState, useCallback } from 'react';
import { continueConversation } from './actions'; // Ensure this path points to your correct actions file
import Markdown from 'markdown-to-jsx';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    setIsLoading(true);

    const userMessage = {
      id: Date.now(),
      content: inputValue,
      role: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');

    try {
      // Add the user input to the conversation history
      const newHistory = [...messages, userMessage];

      // Call the continueConversation function to process the conversation
      const updatedHistory = await continueConversation(newHistory);
      const assistantMessage = updatedHistory.messages[updatedHistory.messages.length - 1].content;

      const aiMessage = {
        id: Date.now() + 1,
        content: assistantMessage,
        role: 'assistant',
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: `Error: Failed to get AI response.`,
        role: 'assistant',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'user-message' : 'ai-message'}>
            <strong>{m.role === 'user' ? 'User: ' : 'AI: '}</strong>
            <Markdown>{m.content}</Markdown>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="chat-form">
        <input
          type="text"
          value={inputValue}
          placeholder={isLoading ? 'Loading...' : 'Say something...'}
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
