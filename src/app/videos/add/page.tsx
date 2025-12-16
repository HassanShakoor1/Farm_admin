'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Play, Image as ImageIcon } from 'lucide-react'
import AdminNavigation from '@/components/AdminNavigation'

export default function AddVideoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    isActive: true
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size before upload
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert(`File too large! Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.\n\nPlease:\n1. Use a video URL instead (recommended)\n2. Or compress your video to under 10MB`)
      e.target.value = '' // Clear file input
      return
    }

    setIsUploading(true)
    setUploadProgress('Uploading video...')

    try {
      // Create form data for server upload
      const uploadFormData = new FormData()
      uploadFormData.append('video', file)

      // Try simple upload first (for development), then fallback to Imgur
      let response
      try {
        setUploadProgress('Uploading video (method 1)...')
        response = await fetch('/api/upload-video-simple', {
          method: 'POST',
          body: uploadFormData,
        })
        
        if (!response.ok) {
          throw new Error('Simple upload failed')
        }
      } catch (simpleError) {
        console.log('Simple upload failed, trying Imgur...', simpleError)
        setUploadProgress('Uploading video (method 2)...')
        
        response = await fetch('/api/upload-video', {
          method: 'POST',
          body: uploadFormData,
        })
      }

      let result
      try {
        const responseText = await response.text()
        console.log('Server response:', responseText)
        
        // Try to parse as JSON
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        throw new Error(`Server returned invalid response. Status: ${response.status}`)
      }

      if (response.ok && result.videoUrl) {
        setFormData(prev => ({ ...prev, videoUrl: result.videoUrl }))
        
        // Show warning if using fallback method
        if (result.warning) {
          setUploadProgress(result.warning)
        } else {
          setUploadProgress('Generating thumbnail...')
        }
        
        // Generate thumbnail (optional - client-side only)
        try {
          const { generateVideoThumbnail } = await import('@/utils/videoUpload')
          const thumbnail = await generateVideoThumbnail(file)
          setFormData(prev => ({ ...prev, thumbnailUrl: thumbnail }))
          setUploadProgress('Upload complete with thumbnail!')
        } catch (thumbnailError) {
          console.warn('Failed to generate thumbnail:', thumbnailError)
          setUploadProgress('Upload complete!')
        }
        
        setTimeout(() => setUploadProgress(''), 3000)
      } else {
        throw new Error(result.error || `Upload failed with status ${response.status}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to upload video: ${errorMessage}`)
      setUploadProgress('')
    } finally {
      setIsUploading(false)
      e.target.value = '' // Clear file input
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.videoUrl) {
      alert('Please provide a title and upload a video')
      return
    }

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/videos')
      } else {
        const error = await response.json()
        alert(`Failed to create video: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating video:', error)
      alert('Error creating video')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload New Video</h1>
          <p className="text-gray-600 mt-2">Add a new video to your goat farm reels</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Video Details</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Our Beautiful Rajanpuri Goats"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what's shown in the video..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Video is active (visible on public site)
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Video Source</h2>
            
            <div className="space-y-6">
              {/* Video URL Input (Primary Method) */}
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  🔗 Video URL (Recommended)
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/video.mp4"
                />
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium mb-1">✅ Supported sources:</p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• Direct video URLs (.mp4, .webm, .mov)</li>
                    <li>• YouTube videos (paste any YouTube URL)</li>
                    <li>• Vimeo videos</li>
                    <li>• Google Drive shared videos</li>
                    <li>• Any public video hosting service</li>
                  </ul>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-medium text-blue-800 mb-1">🎬 Try these sample videos:</p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }))}
                        className="block text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Big Buck Bunny (Test Video)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }))}
                        className="block text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Elephants Dream (Test Video)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }))}
                        className="block text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        W3Schools Sample Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload (Secondary Method) */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR Upload Small File</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎬 Upload Video File (Max 10MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="videoFile"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="videoFile"
                    className={`cursor-pointer ${isUploading ? 'cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-sm text-gray-600">{uploadProgress}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload small video file
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                          ⚠️ Limited to 10MB due to server constraints
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                
                {formData.videoUrl && formData.videoUrl.startsWith('/') && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <Play className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">Video uploaded successfully!</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Preview */}
              {formData.thumbnailUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Thumbnail
                  </label>
                  <div className="w-32 h-20 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/videos')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title || !formData.videoUrl}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Video
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
