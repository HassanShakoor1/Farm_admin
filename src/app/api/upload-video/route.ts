import { NextRequest, NextResponse } from 'next/server'

// Server-side video upload to Imgur
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    // Validate file size (200MB limit)
    const maxSize = 200 * 1024 * 1024 // 200MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Video file too large. Maximum size is 200MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload MP4, WebM, OGG, MOV, or AVI files.' },
        { status: 400 }
      )
    }

    // Convert file to buffer for upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Imgur
    const imgurFormData = new FormData()
    imgurFormData.append('video', new Blob([buffer], { type: file.type }))

    const response = await fetch('https://api.imgur.com/3/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7', // Public Imgur client ID
      },
      body: imgurFormData,
    })

    const data = await response.json()

    if (response.ok && data.success) {
      return NextResponse.json({
        videoUrl: data.data.link,
        message: 'Video uploaded successfully'
      })
    } else {
      console.error('Imgur upload error:', data)
      return NextResponse.json(
        { error: data.data?.error || 'Failed to upload video to Imgur' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error during video upload' },
      { status: 500 }
    )
  }
}
