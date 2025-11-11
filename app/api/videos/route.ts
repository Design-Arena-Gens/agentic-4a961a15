import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const videos = await db.getVideos();
  return NextResponse.json({ videos });
}
