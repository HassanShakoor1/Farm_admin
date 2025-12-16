'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Play } from 'lucide-react'
import AdminNavigation from '@/components/AdminNavigation'

export default function YouTubeHelperPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [directUrl, setDirectUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const getDirectUrl = async () => {
    if (!youtubeUrl) {
      alert('Please enter a YouTube URL')
      return
    }

    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      alert('Invalid YouTube URL. Please check the URL and try again.')
      return
    }

    setIsProcessing(true)

    try {
      // For now, we'll provide instructions for manual conversion
      // In a production app, you'd use a YouTube API or conversion service
      const manualUrl = `https://www.youtube.com/watch?v=${videoId}`
      setDirectUrl(manualUrl)
      
      // Show instructions
      alert(`Video ID extracted: ${videoId}\n\nTo get the direct MP4 URL:\n1. Use a YouTube to MP4 converter like y2mate.com or savefrom.net\n2. Paste this URL: ${manualUrl}\n3. Download or get the direct link\n4. Use that direct link in your video form`)
      
    } catch (error) {
      alert('Error processing YouTube URL. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const sampleUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ'
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">YouTube Video Helper</h1>
          <p className="text-gray-600 mt-2">Convert your iPhone videos for use in the reels system</p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Upload to YouTube */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
              Upload to YouTube
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📱 For iPhone 17 Pro Max Videos:</h3>
              <ol className="text-sm text-blue-800 space-y-2 ml-4">
                <li>1. Go to <a href="https://youtube.com" target="_blank" className="underline font-medium">YouTube.com</a></li>
                <li>2. Click "Create" → "Upload Video"</li>
                <li>3. Upload your high-quality iPhone video (unlimited size!)</li>
                <li>4. Set visibility to "Unlisted" (not public, but accessible via link)</li>
                <li>5. Copy the YouTube URL after upload</li>
              </ol>
            </div>
          </div>

          {/* Step 2: Get Direct URL */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
              Get Direct Video URL
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  id="youtubeUrl"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <button
                onClick={getDirectUrl}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Get Conversion Instructions'}
              </button>

              {directUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">✅ YouTube URL Ready:</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={directUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(directUrl)}
                      className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Recommended Converters */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
              Recommended YouTube to MP4 Converters
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">🔥 Y2mate.com</h3>
                <p className="text-sm text-gray-600 mb-3">Fast, reliable, supports HD quality</p>
                <a
                  href="https://y2mate.com"
                  target="_blank"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Visit Y2mate
                </a>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">⚡ SaveFrom.net</h3>
                <p className="text-sm text-gray-600 mb-3">Simple interface, good quality</p>
                <a
                  href="https://savefrom.net"
                  target="_blank"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Visit SaveFrom
                </a>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">🎬 ClipConverter.cc</h3>
                <p className="text-sm text-gray-600 mb-3">Advanced options, multiple formats</p>
                <a
                  href="https://clipconverter.cc"
                  target="_blank"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Visit ClipConverter
                </a>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">📱 OnlineVideoConverter</h3>
                <p className="text-sm text-gray-600 mb-3">Mobile-friendly, no software needed</p>
                <a
                  href="https://onlinevideoconverter.pro"
                  target="_blank"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Visit OVC
                </a>
              </div>
            </div>
          </div>

          {/* Step 4: Use in Video Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">4</span>
              Use in Video Form
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">📝 Final Steps:</h3>
              <ol className="text-sm text-yellow-800 space-y-1 ml-4">
                <li>1. Copy the direct MP4 URL from the converter</li>
                <li>2. Go to Video Management → Add New Video</li>
                <li>3. Paste the direct URL in the "Video URL" field</li>
                <li>4. Add title and description</li>
                <li>5. Create video - it will work perfectly!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
