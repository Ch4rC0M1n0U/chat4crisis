'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

interface ChatMessage {
  type: string;
  id?: string;
  sender?: string;
  content?: string;
  message?: string;
  title?: string;
  description?: string;
  severity?: number;
  createdAt?: string;
}

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const search = useSearchParams();
  const admin = search.get('admin') === '1';
  const name = search.get('name') || 'Anonyme';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws?room=${code}&name=${encodeURIComponent(name)}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'WELCOME') return; // ignore initial
      setMessages(m => [...m, msg]);
      if (msg.type === 'EVENT') {
        // beep for pressure
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          osc.type = 'sine';
            osc.frequency.value = 880;
          osc.connect(ctx.destination);
          osc.start();
          setTimeout(() => osc.stop(), 180);
        } catch {}
      }
    };
    return () => { ws.close(); };
  }, [code, name]);

  function sendChat() {
    if (!input.trim()) return;
    wsRef.current?.send(JSON.stringify({ type: 'CHAT', content: input }));
    setInput('');
  }

  function dispatchEvent() {
    const title = prompt('Titre de l\'événement ?');
    if (!title) return;
    const description = prompt('Description ?') || '';
    wsRef.current?.send(JSON.stringify({ type: 'EVENT_DISPATCH', title, description, severity: 2 }));
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
        <h2 className="font-semibold">Salle {code}</h2>
        <div className="space-x-2 text-sm">
          <span>{name}</span>
          {admin && <button onClick={dispatchEvent} className="px-2 py-1 bg-pink-600 rounded">Déclencher un événement</button>}
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4 space-y-2 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={`rounded p-2 ${m.type === 'EVENT' ? 'bg-red-800/30 border border-red-500/40' : m.type === 'SYSTEM' ? 'text-neutral-400' : 'bg-neutral-800'}`}> 
            {m.type === 'CHAT' && <><strong>{m.sender}:</strong> {m.content}</>}
            {m.type === 'SYSTEM' && <em>{m.message}</em>}
            {m.type === 'EVENT' && <div>
              <div className="font-bold text-red-300">ALERTE: {m.title}</div>
              <div>{m.description}</div>
            </div>}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-neutral-800 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendChat(); }} placeholder="Message..." className="flex-1 px-3 py-2 rounded bg-neutral-900 border border-neutral-700" />
        <button onClick={sendChat} className="px-4 py-2 bg-indigo-600 rounded">Envoyer</button>
      </div>
    </div>
  );
}
