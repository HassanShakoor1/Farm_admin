'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Upload, Play, Image as ImageIcon } from 'lucide-react'
import AdminNavigation from '@/components/AdminNavigation'

interface Video {
  id: number
  title: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  isActive: boolean
}

export default function EditVideoPage() {
  const router = useRouter()
  const params = useParams()
  const videoId = params.id as string

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    isActive: true
  })
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  useEffect(() => {
    fetchVideo()
  }, [videoId])

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}`)
      if (response.ok) {
        const video: Video = await response.json()
        setFormData({
          title: video.title,
          description: video.description || '',
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl || '',
          isActive: video.isActive
        })
      } else {
        alert('Failed to load video')
        router.push('/videos')
      }
    } catch (error) {
      console.error('Error fetching video:', error)
      alert('Error loading video')
      router.push('/videos')
    } finally {
      setLoading(false)
    }
  }

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
      alert('Please provide a title and video URL')
      return
    }

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/videos')
      } else {
        const error = await response.json()
        alert(`Failed to update video: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating video:', error)
      alert('Error updating video')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Video</h1>
          <p className="text-gray-600 mt-2">Update your goat farm video</p>
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">Video Upload</h2>
            
            <div className="space-y-6">
              {/* Current Video */}
              {formData.videoUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Video
                  </label>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <a
                      href={formData.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm break-all"
                    >
                      {formData.videoUrl}
                    </a>
                  </div>
                </div>
              )}

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎬 Upload New Video File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-sm text-gray-600">{uploadProgress}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload new video or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          MP4, WebM, MOV up to 200MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Video URL Input (Alternative) */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  🔗 Video URL
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
                <p className="text-xs text-gray-500 mt-1">
                  You can also paste a direct video URL from YouTube, Vimeo, or any video hosting service
                </p>
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
              Update Video
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
