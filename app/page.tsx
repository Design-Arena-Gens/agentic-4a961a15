'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Video {
  id: string;
  url: string;
  thumbnail: string;
  views: number;
  author: string;
  description: string;
  collectedAt: string;
}

interface CollectionStats {
  totalCollected: number;
  totalPosted: number;
  lastCollection: string | null;
  lastPost: string | null;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [message, setMessage] = useState('');
  const [credentials, setCredentials] = useState({
    tiktokUsername: '',
    tiktokPassword: '',
  });

  useEffect(() => {
    checkConfiguration();
    fetchStats();
    fetchVideos();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setIsConfigured(data.configured);
    } catch (error) {
      console.error('Error checking configuration:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Credentials saved successfully!');
        setIsConfigured(true);
      } else {
        setMessage(data.error || 'Failed to save credentials');
      }
    } catch (error) {
      setMessage('Error saving credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectNow = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/collect', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully collected ${data.count} videos!`);
        fetchStats();
        fetchVideos();
      } else {
        setMessage(data.error || 'Failed to collect videos');
      }
    } catch (error) {
      setMessage('Error collecting videos');
    } finally {
      setLoading(false);
    }
  };

  const handlePostNow = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/post', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully posted video!`);
        fetchStats();
        fetchVideos();
      } else {
        setMessage(data.error || 'Failed to post video');
      }
    } catch (error) {
      setMessage('Error posting video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">⚽ Football TikTok Agent</h1>
          <p className="text-gray-400">Automated collection and posting of viral football edits</p>
        </header>

        {message && (
          <div className={`p-4 mb-6 rounded-lg ${message.includes('Error') || message.includes('Failed') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
            {message}
          </div>
        )}

        {!isConfigured ? (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Configure TikTok Account</h2>
            <p className="text-gray-400 mb-4">
              Enter your TikTok credentials to enable automated posting. Your credentials are stored securely.
            </p>
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">TikTok Username</label>
                <input
                  type="text"
                  value={credentials.tiktokUsername}
                  onChange={(e) => setCredentials({ ...credentials, tiktokUsername: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your_username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">TikTok Password</label>
                <input
                  type="password"
                  value={credentials.tiktokPassword}
                  onChange={(e) => setCredentials({ ...credentials, tiktokPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
              >
                {loading ? 'Saving...' : 'Save Credentials'}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-400">{stats?.totalCollected || 0}</div>
                <div className="text-sm text-gray-400 mt-1">Total Collected</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-400">{stats?.totalPosted || 0}</div>
                <div className="text-sm text-gray-400 mt-1">Total Posted</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-sm font-medium text-purple-400">
                  {stats?.lastCollection ? format(new Date(stats.lastCollection), 'MMM d, HH:mm') : 'Never'}
                </div>
                <div className="text-sm text-gray-400 mt-1">Last Collection</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-sm font-medium text-orange-400">
                  {stats?.lastPost ? format(new Date(stats.lastPost), 'MMM d, HH:mm') : 'Never'}
                </div>
                <div className="text-sm text-gray-400 mt-1">Last Post</div>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <button
                onClick={handleCollectNow}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
              >
                {loading ? 'Collecting...' : '🔍 Collect Videos Now'}
              </button>
              <button
                onClick={handlePostNow}
                disabled={loading || videos.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
              >
                {loading ? 'Posting...' : '📤 Post Video Now'}
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Collected Videos</h2>
              {videos.length === 0 ? (
                <p className="text-gray-400">No videos collected yet. Click "Collect Videos Now" to start.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video) => (
                    <div key={video.id} className="bg-gray-700 rounded-lg overflow-hidden">
                      <div className="aspect-[9/16] bg-gray-600 relative">
                        <img
                          src={video.thumbnail}
                          alt={video.description}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-gray-300 mb-1">@{video.author}</div>
                        <div className="text-xs text-gray-400 mb-2 line-clamp-2">{video.description}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-blue-400">👁️ {(video.views / 1000).toFixed(0)}K views</span>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            View →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">ℹ️ How It Works</h2>
          <ul className="space-y-2 text-gray-400">
            <li>• Searches TikTok daily for trending football edits with 500K+ views</li>
            <li>• Collects 6 high-quality videos each day</li>
            <li>• Automatically posts one video daily to your TikTok account</li>
            <li>• Scheduling runs automatically via Vercel Cron (9 AM collection, 6 PM posting)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
