'use client';

import { useState, useEffect, useCallback } from 'react';
import Markdown from 'markdown-to-jsx';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const onInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputValue.trim() === '') return;

    const userMessage = { id: Date.now(), content: inputValue, role: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Define the schema for the response
      const schemaDefinition = {
        response: {
          message: "string",
          suggestions: ["string"],
          metadata: {
            confidence: "number",
            category: "string"
          }
        }
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: inputValue,
          schemaDefinition
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data?.response) {
        // Format the structured response for display
        const formattedContent = `${data.response.message}\n\n${
          data.response.suggestions.length > 0 
            ? `**Suggested follow-ups:**\n${data.response.suggestions.map(s => `- ${s}`).join('\n')}` 
            : ''
        }`;

        const aiMessage = { 
          id: Date.now() + 1, 
          content: formattedContent, 
          role: 'ai',
          metadata: data.response.metadata 
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } else {
        const errorMessage = { 
          id: Date.now() + 1, 
          content: `Error: ${data.error || 'Failed to get AI response.'}`, 
          role: 'ai' 
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('Error during API call:', error);
      const errorMessage = { 
        id: Date.now() + 1, 
        content: `Error: ${error.message || 'Could not connect to server.'}`, 
        role: 'ai' 
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

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
              {m.metadata && (
                <div className="message-metadata">
                  <small>
                    Confidence: {Math.round(m.metadata.confidence * 100)}% | 
                    Category: {m.metadata.category}
                  </small>
                </div>
              )}
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
          className="chat-input"
          autoComplete="off"
          aria-label="Chat input"
          disabled={loading}
        />
        <button 
          type="submit" 
          className="submit-button" 
          disabled={!inputValue.trim() || loading}
        >
          {loading ? 'Loading...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
