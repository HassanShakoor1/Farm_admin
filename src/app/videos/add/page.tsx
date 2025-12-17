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
  const [compressionQuality, setCompressionQuality] = useState<'medium' | 'high' | 'ultra'>('high')

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

    const originalSizeMB = (file.size / 1024 / 1024).toFixed(1)
    console.log(`Processing video: ${file.name} (${originalSizeMB}MB)`)

    setIsUploading(true)
    setUploadProgress(`Analyzing ${originalSizeMB}MB video...`)

    try {
      let fileToUpload = file

      // Automatically compress if file is large (over 50MB)
      const { shouldCompress, compressVideo } = await import('@/utils/videoCompressor')
      
      if (shouldCompress(file, 50)) {
        setUploadProgress(`Compressing ${originalSizeMB}MB video...`)
        
        try {
          const result = await compressVideo(
            file,
            compressionQuality, // Use user-selected quality
            (progress) => {
              setUploadProgress(`Compressing: ${progress}%`)
            },
            (status) => {
              setUploadProgress(status)
            }
          )

          fileToUpload = result.compressedFile
          const compressedMB = (result.compressedSize / 1024 / 1024).toFixed(1)
          setUploadProgress(
            `✅ Compressed ${originalSizeMB}MB → ${compressedMB}MB (${result.compressionRatio}% smaller)`
          )
        } catch (compressionError) {
          console.warn('Compression failed, uploading original:', compressionError)
          setUploadProgress('Using original video...')
        }
      }

      // Upload the video (compressed or original)
      setUploadProgress('Uploading to cloud...')
      const { uploadLargeVideo } = await import('@/utils/cloudinaryUpload')
      
      const videoUrl = await uploadLargeVideo(
        fileToUpload,
        (progress) => {
          setUploadProgress(`Uploading: ${progress}%`)
        },
        (status) => {
          setUploadProgress(status)
        }
      )

      // Set the uploaded video URL
      setFormData(prev => ({ ...prev, videoUrl }))
      setUploadProgress('Upload complete! ✅')
      
      // Try to generate thumbnail (optional)
      try {
        setUploadProgress('Generating thumbnail...')
        const { generateVideoThumbnail } = await import('@/utils/videoUpload')
        const thumbnail = await generateVideoThumbnail(file)
        setFormData(prev => ({ ...prev, thumbnailUrl: thumbnail }))
        setUploadProgress('All done! ✅')
      } catch (thumbnailError) {
        console.warn('Failed to generate thumbnail:', thumbnailError)
        setUploadProgress('Upload complete! ✅')
      }
      
      setTimeout(() => setUploadProgress(''), 3000)
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">📱 Upload Your Video</h2>
            
            <div className="space-y-6">
              {/* Compression Quality Selector */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  🎚️ Automatic Compression Quality
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCompressionQuality('medium')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      compressionQuality === 'medium'
                        ? 'border-purple-500 bg-purple-100 shadow-md'
                        : 'border-gray-300 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="font-bold text-sm">Fast</div>
                      <div className="text-xs text-gray-600">Smaller files</div>
                      <div className="text-xs text-gray-500 mt-1">720p • Good quality</div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setCompressionQuality('high')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      compressionQuality === 'high'
                        ? 'border-purple-500 bg-purple-100 shadow-md'
                        : 'border-gray-300 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">✨</div>
                      <div className="font-bold text-sm">Balanced</div>
                      <div className="text-xs text-gray-600">Recommended</div>
                      <div className="text-xs text-gray-500 mt-1">1080p • Great quality</div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setCompressionQuality('ultra')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      compressionQuality === 'ultra'
                        ? 'border-purple-500 bg-purple-100 shadow-md'
                        : 'border-gray-300 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎬</div>
                      <div className="font-bold text-sm">Ultra</div>
                      <div className="text-xs text-gray-600">Best quality</div>
                      <div className="text-xs text-gray-500 mt-1">1080p60 • Max quality</div>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-3 text-center">
                  💡 Videos over 50MB are automatically compressed. Smaller videos upload as-is.
                </p>
              </div>

              {/* Simple Video Upload - Unlimited Size */}
              <div>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-gradient-to-br from-blue-50 to-purple-50">
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
                        <div className="relative mb-4">
                          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                          <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-2">{uploadProgress}</p>
                        <p className="text-sm text-gray-600">Please wait...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-100 rounded-full p-4 mb-4">
                          <Upload className="h-12 w-12 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Upload Your iPhone Video
                        </h3>
                        <p className="text-lg text-blue-600 font-medium mb-2">
                          ✅ ANY SIZE • NO COMPRESSION • FULL QUALITY
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          iPhone 17 Pro Max • 4K • 8K • All formats supported
                        </p>
                        <div className="bg-white/50 rounded-lg p-3 text-xs text-gray-700 max-w-md">
                          <p className="font-medium mb-1">📱 Supports:</p>
                          <p>MP4, MOV, AVI, WebM, MKV - No size limit!</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
                
                {formData.videoUrl && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-green-500 rounded-full p-2 mr-3">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-green-900">Video Ready! ✅</p>
                          <p className="text-sm text-green-700">Your video will appear on the public site</p>
                        </div>
                      </div>
                      <a
                        href={formData.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:text-green-800 underline"
                      >
                        Preview
                      </a>
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
