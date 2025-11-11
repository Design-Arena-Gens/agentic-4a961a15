import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scrapeTikTokVideos } from '@/lib/tiktok-scraper';

// This endpoint will be called by Vercel Cron
// Runs daily at 9:00 AM UTC
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON] Starting daily video collection...');

    // Scrape TikTok for videos with 500k+ views
    const scrapedVideos = await scrapeTikTokVideos(500000, 6);

    // Add videos to database
    for (const video of scrapedVideos) {
      await db.addVideo(video);
    }

    console.log(`[CRON] Successfully collected ${scrapedVideos.length} videos`);

    return NextResponse.json({
      success: true,
      count: scrapedVideos.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error collecting videos:', error);
    return NextResponse.json(
      { error: 'Failed to collect videos' },
      { status: 500 }
    );
  }
}
