import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { postToTikTok } from '@/lib/tiktok-poster';

// This endpoint will be called by Vercel Cron
// Runs daily at 6:00 PM UTC
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON] Starting daily video posting...');

    // Get config
    const config = await db.getConfig();
    if (!config.tiktokUsername || !config.tiktokPassword) {
      console.log('[CRON] TikTok credentials not configured');
      return NextResponse.json(
        { error: 'TikTok credentials not configured' },
        { status: 400 }
      );
    }

    // Get next unposted video
    const unpostedVideos = await db.getUnpostedVideos();
    if (unpostedVideos.length === 0) {
      console.log('[CRON] No videos available to post');
      return NextResponse.json(
        { error: 'No videos available to post' },
        { status: 400 }
      );
    }

    const videoToPost = unpostedVideos[0];

    // Post to TikTok
    const result = await postToTikTok(
      videoToPost,
      config.tiktokUsername,
      config.tiktokPassword
    );

    if (result.success) {
      // Mark as posted
      await db.markVideoAsPosted(videoToPost.id);

      console.log(`[CRON] Successfully posted video: ${videoToPost.id}`);

      return NextResponse.json({
        success: true,
        videoId: videoToPost.id,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log(`[CRON] Failed to post video: ${result.error}`);
      return NextResponse.json(
        { error: result.error || 'Failed to post video' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[CRON] Error posting video:', error);
    return NextResponse.json(
      { error: 'Failed to post video' },
      { status: 500 }
    );
  }
}
