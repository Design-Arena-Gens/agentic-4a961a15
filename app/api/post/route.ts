import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { postToTikTok } from '@/lib/tiktok-poster';

export async function POST() {
  try {
    console.log('Starting video posting...');

    // Get config
    const config = await db.getConfig();
    if (!config.tiktokUsername || !config.tiktokPassword) {
      return NextResponse.json(
        { error: 'TikTok credentials not configured' },
        { status: 400 }
      );
    }

    // Get next unposted video
    const unpostedVideos = await db.getUnpostedVideos();
    if (unpostedVideos.length === 0) {
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

      console.log(`Successfully posted video: ${videoToPost.id}`);

      return NextResponse.json({
        success: true,
        videoId: videoToPost.id,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to post video' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error posting video:', error);
    return NextResponse.json(
      { error: 'Failed to post video' },
      { status: 500 }
    );
  }
}
