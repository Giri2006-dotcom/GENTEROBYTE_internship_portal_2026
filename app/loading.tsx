import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="w-20 h-20 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
        {/* Inner pulsing accent ring */}
        <div className="absolute w-12 h-12 rounded-full border-4 border-accent-100 border-b-accent-500 animate-spin [animation-duration:1.5s] [animation-direction:reverse]"></div>
        {/* Center dot */}
        <div className="absolute w-3 h-3 bg-navy-900 rounded-full"></div>
      </div>
      <p className="mt-6 text-sm font-bold tracking-widest text-navy-800 uppercase animate-pulse">
        Loading Gentrobyte...
      </p>
    </div>
  );
}
