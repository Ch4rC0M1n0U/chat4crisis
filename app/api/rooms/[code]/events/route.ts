import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  if (ADMIN_SECRET) {
    const header = req.headers.get('x-admin-secret');
    if (header !== ADMIN_SECRET) return new NextResponse('Unauthorized', { status: 401 });
  }
  const body = await req.json();
  const { code } = params;
  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return new NextResponse('Room not found', { status: 404 });
  if (!body.title) return new NextResponse('Missing title', { status: 400 });
  const event = await prisma.crisisEvent.create({ data: { roomId: room.id, title: body.title, description: body.description || '', severity: body.severity || 1 } });
  // NOTE: diffusion en temps réel non branchée ici (WS). Future: stocker et WS picking.
  return NextResponse.json({ ok: true, id: event.id });
}
