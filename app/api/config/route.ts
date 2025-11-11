import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const config = await db.getConfig();
  return NextResponse.json({
    configured: !!(config.tiktokUsername && config.tiktokPassword),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tiktokUsername, tiktokPassword } = body;

    if (!tiktokUsername || !tiktokPassword) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    await db.setConfig({ tiktokUsername, tiktokPassword });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
