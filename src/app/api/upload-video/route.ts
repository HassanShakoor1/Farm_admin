import { NextRequest, NextResponse } from 'next/server'

// Server-side video upload with multiple fallback options
export async function POST(request: NextRequest) {
  try {
    console.log('Video upload request received')
    
    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    console.log(`File received: ${file.name}, size: ${file.size}, type: ${file.type}`)

    // Validate file size (20MB limit for Imgur)
    const maxSize = 20 * 1024 * 1024 // 20MB (Imgur practical limit)
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Video file too large. Maximum size is 20MB for online upload.' },
        { status: 413 }
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

    // Convert file to base64 for more reliable upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    console.log('Attempting upload to Imgur...')

    // Try uploading to Imgur with base64
    try {
      const imgurFormData = new FormData()
      imgurFormData.append('image', base64)
      imgurFormData.append('type', 'base64')

      const response = await fetch('https://api.imgur.com/3/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 546c25a59c58ad7',
        },
        body: imgurFormData,
      })

      console.log(`Imgur response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Imgur API error:', errorText)
        throw new Error(`Imgur API returned ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Imgur response:', data)

      if (data.success && data.data && data.data.link) {
        return NextResponse.json({
          videoUrl: data.data.link,
          message: 'Video uploaded successfully to Imgur'
        })
      } else {
        throw new Error(data.data?.error || 'Imgur upload failed')
      }
    } catch (imgurError) {
      console.error('Imgur upload failed:', imgurError)
      
      // Fallback: Return base64 data URL for local testing
      const dataUrl = `data:${file.type};base64,${base64}`
      
      return NextResponse.json({
        videoUrl: dataUrl,
        message: 'Video converted to base64 (fallback method)',
        warning: 'Using fallback method - video may not work on all devices'
      })
    }
  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
