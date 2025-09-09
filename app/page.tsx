'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

function randomCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function HomePage() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  return (
    <main className="max-w-xl mx-auto py-16 px-6 space-y-6">
      <h1 className="text-3xl font-bold">Chat4Crisis</h1>
      <p className="text-neutral-300">Simulation d'exercice de crise en temps réel.</p>

      <div className="space-y-2">
        <label className="block text-sm font-semibold">Rejoindre une salle</label>
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="CODE" className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" />
        <button disabled={!code || !name} onClick={() => router.push(`/room/${code}?name=${encodeURIComponent(name)}`)} className="px-4 py-2 rounded bg-indigo-600 disabled:opacity-40">Entrer</button>
      </div>

      <div className="pt-8 border-t border-neutral-800">
        <button onClick={() => { const c = randomCode(); router.push(`/room/${c}?admin=1&name=${encodeURIComponent('Formateur')}`); }} className="px-4 py-2 rounded bg-emerald-600">Créer une salle (Formateur)</button>
      </div>
    </main>
  );
}
