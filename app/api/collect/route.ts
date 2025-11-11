import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scrapeTikTokVideos } from '@/lib/tiktok-scraper';

export async function POST() {
  try {
    console.log('Starting video collection...');

    // Scrape TikTok for videos with 500k+ views
    const scrapedVideos = await scrapeTikTokVideos(500000, 6);

    // Add videos to database
    for (const video of scrapedVideos) {
      await db.addVideo(video);
    }

    console.log(`Successfully collected ${scrapedVideos.length} videos`);

    return NextResponse.json({
      success: true,
      count: scrapedVideos.length,
    });
  } catch (error) {
    console.error('Error collecting videos:', error);
    return NextResponse.json(
      { error: 'Failed to collect videos' },
      { status: 500 }
    );
  }
}
