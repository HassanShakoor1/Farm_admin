'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Upload } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
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
  imageUrls?: string[] | null
  isAvailable: boolean
  gender: string
  color: string | null
  healthStatus: string
}

export default function EditGoat() {
  const router = useRouter()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [formData, setFormData] = useState({
    name: '',
    breed: 'Rajanpuri',
    age: '',
    weight: '',
    price: '',
    description: '',
    isAvailable: true,
    gender: 'Male',
    color: '',
    healthStatus: 'Healthy'
  })

  useEffect(() => {
    const fetchGoat = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (response.ok) {
          const goat: Goat = await response.json()
          
          // Parse existing images from description
          let existingDescription = goat.description || ''
          let existingImages: string[] = []
          
          if (goat.description) {
            try {
              const parsed = JSON.parse(goat.description)
              existingDescription = parsed.description || ''
              if (parsed.additionalImages && Array.isArray(parsed.additionalImages)) {
                existingImages = parsed.additionalImages
              }
            } catch (e) {
              // Description is not JSON, use as is
              existingDescription = goat.description
            }
          }
          
          // Set up image URLs array with existing images
          const allImages = []
          if (goat.imageUrl) allImages.push(goat.imageUrl)
          allImages.push(...existingImages)
          
          setFormData({
            name: goat.name,
            breed: goat.breed,
            age: goat.age,
            weight: goat.weight,
            price: goat.price.toString(),
            description: existingDescription,
            isAvailable: goat.isAvailable,
            gender: goat.gender,
            color: goat.color || '',
            healthStatus: goat.healthStatus
          })
          
          // Set existing images in the imageUrls state
          if (allImages.length > 0) {
            setImageUrls(allImages.concat([''])) // Add empty field for new URLs
          }
        } else {
          alert('Goat not found')
          router.push('/')
        }
      } catch (error) {
        console.error('Error fetching goat:', error)
        alert('Error loading goat data')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchGoat()
    }
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      imageUrls: [...uploadedImages, ...imageUrls.filter(url => url.trim() !== '')]
    }

    console.log('Updating goat data:', submitData)

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push('/')
      } else {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        alert(`Error updating goat: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert(`Error updating goat: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this goat? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/products/${params.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          router.push('/')
        } else {
          alert('Error deleting goat')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error deleting goat')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()
        if (response.ok) {
          return result.imageUrl
        } else {
          throw new Error(result.error || 'Failed to upload image')
        }
      })

      const newImageUrls = await Promise.all(uploadPromises)
      setUploadedImages(prev => [...prev, ...newImageUrls])
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload one or more images')
    } finally {
      setIsUploading(false)
    }
  }

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const addImageUrlField = () => {
    setImageUrls(prev => [...prev, ''])
  }

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls(prev => prev.map((url, i) => i === index ? value : url))
  }

  const removeImageUrlField = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Goat</h1>
              <p className="text-gray-600 mt-2">Update goat information for Eid ul Azha.</p>
            </div>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Goat
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Goat Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Bakra Sultan"
                />
              </div>

              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
                  Breed *
                </label>
                <select
                  id="breed"
                  name="breed"
                  required
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Rajanpuri">Rajanpuri</option>
                  <option value="Maaki Cheena">Maaki Cheena</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="text"
                  id="age"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2 years"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                  Weight *
                </label>
                <input
                  type="text"
                  id="weight"
                  name="weight"
                  required
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 45 kg"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
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
                placeholder="Describe the goat's qualities, health, and suitability for Eid sacrifice..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (PKR) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="85000"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Brown & White"
                />
              </div>
            </div>

            <div>
              <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Health Status *
              </label>
              <select
                id="healthStatus"
                name="healthStatus"
                required
                value={formData.healthStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Excellent">Excellent</option>
                <option value="Healthy">Healthy</option>
                <option value="Good">Good</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                Goat is available for sale
              </label>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-end space-x-4">
                <Link
                  href="/"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Goat
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Image Upload Section */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">📸 Goat Images (Multiple Images Supported)</h2>
          
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">📁 Upload Multiple Image Files</h4>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload multiple images</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB each (Select multiple files)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
              
              {/* Display uploaded images */}
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-green-600 mb-3">✅ {uploadedImages.length} new image(s) uploaded successfully!</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Uploaded goat ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* URL Input */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">🔗 Edit Image URLs</h4>
              <div className="space-y-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/goat-image.jpg"
                      value={url}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrlField(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageUrlField}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add another image URL
                </button>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Use <a href="https://imgur.com" target="_blank" className="text-blue-600 underline">Imgur</a>, <a href="https://postimg.cc" target="_blank" className="text-blue-600 underline">PostImg</a>, or <a href="https://imgbb.com" target="_blank" className="text-blue-600 underline">ImgBB</a></p>
                  <p>• URLs should end with .jpg, .png, etc.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Upload multiple high-quality photos of your goats from different angles for better customer engagement. 
              The first image will be used as the main display image. Images will be automatically optimized and stored securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}