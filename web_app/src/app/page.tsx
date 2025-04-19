'use client';

import { FormEvent, useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    //add logic here to handle the query submission
    console.log('Query submitted:', query);
  };

  return (
    <div className="w-full max-w-3xl mt-auto sticky bottom-0 pb-3 bg-gray-950 pt-3 border-t border-cyan-500/30">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center bg-gray-800 rounded-md p-1 border border-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-cyan-400 focus-within:border-cyan-400">
          <input className="flex-grow bg-transparent outline-none px-3 py-2 placeholder-gray-500 text-gray-100 text-sm"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter natural language query..."
          />
          <button type="submit" className="p-2 text-cyan-400 hover:text-cyan-300 disabled:text-gray-600 disabled:cursor-not-allowed transition duration-150 ease-in-out" aria-label="Submit query">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
}