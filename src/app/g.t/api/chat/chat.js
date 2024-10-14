'use client';

import { useState, useEffect, useCallback } from 'react';
import Markdown from 'markdown-to-jsx';

export default function Chat() {
  const [messages, setMessages] = useState([]); // Holds all the chat messages (user & AI)
  const [inputValue, setInputValue] = useState(''); // Manages the input text
  const [loading, setLoading] = useState(false); // Tracks if a request is in progress

  // Handle input change
  const onInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return; // Avoid empty input submissions

    const userMessage = { id: Date.now(), content: inputValue, role: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue(''); // Clear input after user submits

    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok && data?.text) {
        const aiMessage = { id: Date.now() + 1, content: data.text, role: 'ai' };
        setMessages((prevMessages) => [...prevMessages, aiMessage]); // Add AI response
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          content: `Error: ${data.error || 'Failed to get AI response.'}`,
          role: 'ai',
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]); // Add error message
      }
    } catch (error) {
      console.error('Error during API call:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: 'Error: Could not connect to server.',
        role: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]); // Add error message if fetch fails
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll to the latest message when new messages arrive
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // Handle "Enter" key press for submitting the chat
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e); // Submit the form when pressing Enter
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div
              key={m.id}
              className={m.role === 'user' ? 'user-message' : 'ai-message'}
            >
              <strong>{m.role === 'user' ? 'User: ' : 'AI: '}</strong>
              <Markdown>{m.content}</Markdown>
            </div>
          ))
        ) : (
          <p className="loading-indicator">No messages yet. Start the conversation!</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          value={inputValue}
          placeholder={loading ? 'Please wait...' : 'Say something...'}
          onChange={onInputChange}
          onKeyPress={handleKeyPress} // Submit on pressing Enter
          className="chat-input"
          autoComplete="off"
          aria-label="Chat input"
          disabled={loading} // Disable input during loading
        />
        <button type="submit" className="submit-button" disabled={!inputValue.trim() || loading}>
          {loading ? 'Loading...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
