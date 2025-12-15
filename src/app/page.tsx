'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Plus, Package, MessageSquare, BarChart3, Users, Settings, Eye, Edit, Trash2, HardDrive } from 'lucide-react'
import AdminNavigation from '@/components/AdminNavigation'

interface Goat {
  id: number
  name: string
  breed: string
  age: string
  weight: string
  price: number
  description: string | null
  imageUrl: string | null
  isAvailable: boolean
  gender: string
  color: string | null
  healthStatus: string
  createdAt: string
  updatedAt: string
}

interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string | null
  message: string
  createdAt: string
}

export default function AdminDashboard() {
  const [goats, setGoats] = useState<Goat[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isCleaningUp, setIsCleaningUp] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch goats from API
      const goatsResponse = await fetch('/api/products')
      if (goatsResponse.ok) {
        const goatsData = await goatsResponse.json()
        setGoats(goatsData)
      } else {
        console.error('Failed to fetch goats')
        setGoats([])
      }

      // Fetch messages from API
      const messagesResponse = await fetch('/api/messages')
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json()
        setMessages(messagesData)
      } else {
        console.error('Failed to fetch messages')
        setMessages([])
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      setGoats([])
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGoat = async (id: number) => {
    if (confirm('Are you sure you want to delete this goat?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setGoats(goats.filter(g => g.id !== id))
        }
      } catch (error) {
        console.error('Error deleting goat:', error)
      }
    }
  }

  const handleDeleteMessage = async (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await fetch(`/api/messages/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setMessages(messages.filter(m => m.id !== id))
        } else {
          console.error('Failed to delete message')
          alert('Failed to delete message')
        }
      } catch (error) {
        console.error('Error deleting message:', error)
        alert('Error deleting message')
      }
    }
  }

  const cleanupOrphanedFiles = async () => {
    if (!confirm('This will delete all image files that are not referenced in the database. Are you sure?')) {
      return
    }

    setIsCleaningUp(true)
    try {
      const response = await fetch('/api/cleanup-files', {
        method: 'POST',
      })

      const result = await response.json()
      
      if (response.ok) {
        alert(`Cleanup completed! ${result.deletedFiles} orphaned files were deleted.`)
      } else {
        alert(`Cleanup failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error during cleanup:', error)
      alert('Error during file cleanup')
    } finally {
      setIsCleaningUp(false)
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
      {/* Header */}
      <AdminNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-col sm:flex-row sm:space-x-8 space-y-2 sm:space-y-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center sm:justify-start px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('goats')}
              className={`flex items-center justify-center sm:justify-start px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'goats'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Package className="h-5 w-5 mr-2" />
              Goats ({goats.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center justify-center sm:justify-start px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'messages'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Messages ({messages.length})
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <div className="flex-shrink-0 mb-2 sm:mb-0">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <div className="sm:ml-4 text-center sm:text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Total Goats</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">{goats.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <div className="flex-shrink-0 mb-2 sm:mb-0">
                    <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <div className="sm:ml-4 text-center sm:text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">New Messages</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">{messages.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <div className="flex-shrink-0 mb-2 sm:mb-0">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <div className="sm:ml-4 text-center sm:text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Available Goats</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {goats.filter(g => g.isAvailable).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <div className="flex-shrink-0 mb-2 sm:mb-0">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  </div>
                  <div className="sm:ml-4 text-center sm:text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Breeds</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {new Set(goats.map(g => g.breed)).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Management Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <HardDrive className="h-6 w-6 text-gray-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">File Management</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Clean up orphaned image files that are no longer referenced in the database.
              </p>
              <button
                onClick={cleanupOrphanedFiles}
                disabled={isCleaningUp}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCleaningUp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cleaning up...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clean Up Orphaned Files
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Goats</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {goats.slice(0, 3).map((goat) => (
                      <div key={goat.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{goat.name}</p>
                          <p className="text-sm text-gray-500">{goat.breed} • ₨{goat.price.toLocaleString()}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          goat.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {goat.isAvailable ? 'Available' : 'Sold'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {messages.slice(0, 3).map((message) => (
                      <div key={message.id} className="border-l-4 border-blue-400 pl-4">
                        <p className="text-sm font-medium text-gray-900">{message.name}</p>
                        <p className="text-sm text-gray-500">{message.subject}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goats Tab */}
        {activeTab === 'goats' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Goats for Eid ul Azha</h2>
              <Link
                href="/products/add"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg flex items-center justify-center sm:justify-start font-medium transition-all shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Goat
              </Link>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goat Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Breed & Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {goats.map((goat) => (
                    <tr key={goat.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{goat.name}</div>
                          <div className="text-sm text-gray-500">{goat.gender} • {goat.weight} • {goat.color}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {goat.breed}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">{goat.age}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₨{goat.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          goat.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {goat.isAvailable ? 'Available' : 'Sold'}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">{goat.healthStatus}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/products/edit/${goat.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteGoat(goat.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {goats.map((goat) => (
                <div key={goat.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{goat.name}</h3>
                      <p className="text-sm text-gray-500">{goat.gender} • {goat.weight} • {goat.color}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      goat.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {goat.isAvailable ? 'Available' : 'Sold'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Breed & Age</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {goat.breed}
                      </span>
                      <p className="text-sm text-gray-700 mt-1">{goat.age}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Price</p>
                      <p className="text-lg font-semibold text-gray-900">₨{goat.price.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Health Status</p>
                    <p className="text-sm text-gray-700">{goat.healthStatus}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link
                      href={`/products/edit/${goat.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteGoat(goat.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Messages</h2>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{message.name}</div>
                          <div className="text-sm text-gray-500">{message.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{message.subject || 'No subject'}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{message.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/messages/${message.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{message.name}</h3>
                      <p className="text-sm text-gray-500">{message.email}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {message.subject || 'No subject'}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {message.message}
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link
                      href={`/messages/${message.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
    </div>
  )
}