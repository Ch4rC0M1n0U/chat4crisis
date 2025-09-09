/*
  Custom server to integrate WebSocket for real-time crisis simulation.
*/
const { createServer } = require('http');
const next = require('next');
const { WebSocketServer } = require('ws');
const { randomUUID } = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// In-memory WS connection mapping: roomCode -> Set(ws)
const roomSockets = new Map();

// Simple random event scheduler per room (in-memory). For production consider persistent job queue.
const schedulerIntervals = new Map(); // roomCode -> intervalId

function startSchedulerForRoom(roomCode, roomId) {
  if (schedulerIntervals.has(roomCode)) return; // already running
  const interval = setInterval(async () => {
    // 30% chance to emit an event each tick
    if (Math.random() < 0.3) {
      const titles = ['Incident réseau', 'Perte alimentation', 'Afflux médias', 'Appel témoin', 'Alerte sécurité'];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const description = 'Événement automatique généré pour la simulation.';
      try {
        const event = await prisma.crisisEvent.create({ data: { roomId, title, description, severity: Math.ceil(Math.random()*3) } });
        broadcastToRoom(roomCode, { type: 'EVENT', id: event.id, title: event.title, description: event.description, severity: event.severity, auto: true });
      } catch (e) {
        console.error('Scheduler event error', e);
      }
    }
  }, 15000 + Math.random()*15000); // random-ish pacing 15-30s
  schedulerIntervals.set(roomCode, interval);
}

function stopSchedulerForRoom(roomCode) {
  const int = schedulerIntervals.get(roomCode);
  if (int) clearInterval(int);
  schedulerIntervals.delete(roomCode);
}

function broadcastToRoom(roomCode, payload) {
  const set = roomSockets.get(roomCode);
  if (!set) return;
  const data = JSON.stringify(payload);
  for (const ws of set) {
    if (ws.readyState === 1) {
      ws.send(data);
    }
  }
}

async function ensureRoom(code) {
  let room = await prisma.room.findUnique({ where: { code } });
  if (!room) {
    room = await prisma.room.create({ data: { code } });
  }
  return room;
}

async function registerParticipant(roomId, name, role = 'user') {
  return prisma.participant.create({ data: { name, role, roomId } });
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end('Internal error');
    }
  });

  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    const params = new URLSearchParams((req.url.split('?')[1]) || '');
    const roomCode = params.get('room');
    let username = params.get('name') || 'Anonyme';
    if (!roomCode) {
      ws.close(1008, 'Room code required');
      return;
    }
    const room = await ensureRoom(roomCode);
    const participant = await registerParticipant(room.id, username);

  // Start scheduler when first participant joins
  startSchedulerForRoom(roomCode, room.id);

    if (!roomSockets.has(roomCode)) roomSockets.set(roomCode, new Set());
    roomSockets.get(roomCode).add(ws);

    ws.send(JSON.stringify({ type: 'WELCOME', participantId: participant.id, roomCode }));
    broadcastToRoom(roomCode, { type: 'SYSTEM', message: `${username} a rejoint la salle.` });

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'CHAT') {
          const saved = await prisma.message.create({ data: { roomId: room.id, sender: username, content: msg.content, type: 'TEXT' } });
          broadcastToRoom(roomCode, { type: 'CHAT', id: saved.id, sender: username, content: msg.content, createdAt: saved.createdAt });
        } else if (msg.type === 'EVENT_DISPATCH') {
          // Only allow if role admin (simple naive check)
          if (participant.role !== 'admin') return;
          const event = await prisma.crisisEvent.create({ data: { roomId: room.id, title: msg.title, description: msg.description, severity: msg.severity || 1 } });
          broadcastToRoom(roomCode, { type: 'EVENT', id: event.id, title: event.title, description: event.description, severity: event.severity });
        }
      } catch (e) {
        console.error('Message handling error', e);
      }
    });

    ws.on('close', () => {
      const set = roomSockets.get(roomCode);
      if (set) {
        set.delete(ws);
        broadcastToRoom(roomCode, { type: 'SYSTEM', message: `${username} a quitté la salle.` });
        if (set.size === 0) {
          // no more connections: stop scheduler to free resources
          stopSchedulerForRoom(roomCode);
          roomSockets.delete(roomCode);
        }
      }
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log('> Server ready on http://localhost:' + port);
  });
});
