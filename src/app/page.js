// File: app/page.js
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const AIFunctionButton = ({ onClick, label }) => (
  <button className="ai-function-button" onClick={onClick}>
    {label}
  </button>
);

export default function Home() {
  const router = useRouter();

  const aiFunctions = [
    { path: '/s.t', label: 'Stream Text' },
    { path: '/s.o', label: 'Stream Object' },
    { path: '/g.t', label: 'Generate Text' },
    { path: '/g.o', label: 'Generate Object' },
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <div className="ai-function-selector bg-cover bg-center min-h-screen flex items-center justify-center">
      <div className="bg-white bg-opacity-80 rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Select an AI Function</h1>
        <div className="button-container grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          {aiFunctions.map((func, index) => (
            <AIFunctionButton 
              key={index} 
              label={func.label} 
              onClick={() => handleNavigation(func.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
