"use client";
import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw, Zap } from 'lucide-react';

interface Room { id: string; code: string; createdAt: string; }

export default function AdminPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selected, setSelected] = useState<Room | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(1);
  const [loading, setLoading] = useState(false);
  const secret = typeof window !== 'undefined' ? localStorage.getItem('ADMIN_SECRET') || '' : '';

  async function loadRooms() {
    const res = await fetch('/api/admin/rooms', { headers: { 'x-admin-secret': secret || '' } });
    if (res.ok) setRooms(await res.json());
  }

  async function submitEvent() {
    if (!selected || !title) return;
    setLoading(true);
    const res = await fetch(`/api/rooms/${selected.code}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret || '' },
      body: JSON.stringify({ title, description, severity })
    });
    setLoading(false);
    if (res.ok) {
      setTitle(''); setDescription(''); setSeverity(1);
      alert('Événement injecté');
    } else {
      alert('Erreur injection');
    }
  }

  useEffect(() => { loadRooms(); }, []);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin – Rooms</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des salles</CardTitle>
              <CardDescription>Sélectionnez une salle pour injecter un événement.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadRooms} title="Rafraîchir"><RefreshCw size={16} /></Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {rooms.map(r => (
              <button key={r.id} onClick={() => setSelected(r)} className={`w-full text-left px-3 py-2 rounded text-sm ${selected?.id === r.id ? 'bg-indigo-600 border-indigo-500' : 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700'}`}>{r.code}</button>
            ))}
            {!rooms.length && <div className="text-neutral-500 text-sm">Aucune salle active encore.</div>}
          </div>
        </Card>
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Injection d'événement</CardTitle>
              <CardDescription>{selected ? `Salle sélectionnée: ${selected.code}` : 'Sélectionnez une salle à gauche.'}</CardDescription>
            </div>
            <div className="text-neutral-500 text-sm">{selected ? new Date(selected.createdAt).toLocaleString() : ''}</div>
          </div>
          <div className="space-y-3">
            <Input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="w-full h-28 text-sm rounded bg-neutral-900 border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs uppercase tracking-wide font-medium">Sévérité</label>
                <select value={severity} onChange={e => setSeverity(Number(e.target.value))} className="mt-1 block w-32 rounded bg-neutral-900 border border-neutral-700 px-2 py-1 text-sm">
                  {[1,2,3].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Button onClick={submitEvent} disabled={!selected || !title || loading}><Zap size={16} className="mr-2"/>{loading ? '...' : 'Envoyer'}</Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
