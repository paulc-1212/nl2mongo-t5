'use client';

import SystemMessage from '@/components/SystemMessage';
import UserMessage from '@/components/UserMessage';
import { DataItem, Message, MessageFromSystem, MessageFromUser, SenderType } from '@/lib/Message';
import { FormEvent, useState } from 'react';


export default function Home() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query) return;

    const newMessage: Message = new MessageFromUser(query);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setQuery('');

    try {
      const startTime = performance.now();

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })
      const json: DataItem = await response.json();
      if (!response.ok) {
        const errorMessage: Message = new MessageFromSystem([json], true);
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        return;
      }
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      const systemMessage: Message = new MessageFromSystem([json], false, duration);
      setMessages((prevMessages) => [...prevMessages, systemMessage]);
    } catch(error:unknown) {
      console.error("Error fetching data:", JSON.stringify(error));
      const errorMessage: Message = new MessageFromSystem([{error}] as DataItem[], true);
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-light mb-6 text-gray-200 text-center">
      Start chatting with your MongoDB data below ↓
      </h1>
      <div className="w-full max-w-3xl flex-grow overflow-y-auto mb-4 space-y-4">
        {!messages.length && (
          <p className="text-center text-gray-500 text-sm">No messages yet.</p>
        )}
        {
          messages.map(msg => msg.sender === SenderType.User
            ? <UserMessage key={msg.id} message={msg as MessageFromUser} />
            : <SystemMessage key={msg.id} message={msg as MessageFromSystem} />)
        }
      </div>
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
    </>
  )
}