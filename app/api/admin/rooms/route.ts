import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function GET(req: NextRequest) {
  if (ADMIN_SECRET) {
    const header = req.headers.get('x-admin-secret');
    if (header !== ADMIN_SECRET) return new NextResponse('Unauthorized', { status: 401 });
  }
  const rooms = await prisma.room.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(rooms.map(r => ({ id: r.id, code: r.code, createdAt: r.createdAt })));
}
