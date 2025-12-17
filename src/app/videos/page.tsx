'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Play, Eye, Edit, Trash2, Heart } from 'lucide-react'
import AdminNavigation from '@/components/AdminNavigation'

interface Video {
  id: number
  title: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  likesCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    likes: number
  }
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos')
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        const response = await fetch(`/api/videos/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setVideos(videos.filter(video => video.id !== id))
        } else {
          alert('Failed to delete video')
        }
      } catch (error) {
        console.error('Error deleting video:', error)
        alert('Error deleting video')
      }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
            <p className="text-gray-600 mt-2">Manage your goat farm videos and reels</p>
          </div>
          <Link
            href="/videos/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Video
          </Link>
        </div>

        {videos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Videos Yet</h3>
            <p className="text-gray-600 mb-6">Start by uploading your first goat video!</p>
            <Link
              href="/videos/add"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload First Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  {video.isActive ? (
                    <span className="absolute top-1.5 right-1.5 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="absolute top-1.5 right-1.5 bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">{video.title}</h3>
                  {video.description && (
                    <p className="text-gray-600 text-xs mb-2 line-clamp-1">{video.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Heart className="h-3 w-3 text-red-500 mr-1" />
                      <span>{video.likesCount}</span>
                    </div>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex gap-1">
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-2 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </a>
                    <Link
                      href={`/videos/edit/${video.id}`}
                      className="flex-1 inline-flex items-center justify-center px-2 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="flex-1 inline-flex items-center justify-center px-2 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
