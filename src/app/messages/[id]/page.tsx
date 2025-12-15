'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Calendar, Trash2, Reply } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string | null
  message: string
  createdAt: string
}

export default function MessageDetail() {
  const params = useParams()
  const router = useRouter()
  const [message, setMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For now, using mock data. Later this will fetch from your API
    const mockMessage = {
      id: parseInt(params.id as string),
      name: "John Smith",
      email: "john@example.com",
      subject: "Product Inquiry",
      message: "Hi there! I'm interested in your goat cheese products. Do you offer bulk pricing for restaurants? I run a small farm-to-table restaurant and would love to feature your products on our menu. Could you please let me know about wholesale pricing and minimum order quantities? Also, do you have any seasonal varieties available? Thank you for your time!",
      createdAt: new Date().toISOString()
    }

    setMessage(mockMessage)
    setLoading(false)
  }, [params.id])

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/messages/${params.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          router.push('/')
        } else {
          alert('Error deleting message')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error deleting message')
      }
    }
  }

  const handleReply = () => {
    if (message) {
      const subject = `Re: ${message.subject || 'Your inquiry'}`
      const body = `Hi ${message.name},\n\nThank you for your message regarding our goat farm products.\n\n\n\nBest regards,\nGreen Valley Goat Farm`
      
      window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!message) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Not Found</h2>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🐐 Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="http://localhost:3000" 
                target="_blank"
                className="text-blue-600 hover:text-blue-800"
              >
                View Public Site
              </Link>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Message Details</h1>
              <p className="text-gray-600 mt-2">Contact message from {message.name}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReply}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Message Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{message.name}</h3>
                  <p className="text-sm text-gray-500">{message.email}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(message.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900">
              Subject: {message.subject || 'No subject'}
            </h4>
          </div>

          {/* Message Content */}
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {message.message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Message ID: #{message.id}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleReply}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Reply via Email
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(message.email)}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Copy Email
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reply Template */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Reply Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                const subject = `Re: ${message.subject || 'Your inquiry'}`
                const body = `Hi ${message.name},\n\nThank you for your interest in our products! We'd be happy to discuss wholesale pricing for your restaurant. I'll send you our wholesale catalog and pricing information shortly.\n\nBest regards,\nGreen Valley Goat Farm`
                window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
              }}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900 mb-2">Wholesale Inquiry</h4>
              <p className="text-sm text-gray-600">Template for restaurant/bulk order inquiries</p>
            </button>
            
            <button
              onClick={() => {
                const subject = `Re: ${message.subject || 'Your inquiry'}`
                const body = `Hi ${message.name},\n\nThank you for contacting us! We're open for farm visits Monday through Saturday. Please let me know what dates work best for you and I'll schedule a tour.\n\nBest regards,\nGreen Valley Goat Farm`
                window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
              }}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900 mb-2">Farm Visit Request</h4>
              <p className="text-sm text-gray-600">Template for tour and visit requests</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
