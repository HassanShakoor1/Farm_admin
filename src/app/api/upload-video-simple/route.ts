import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Simple local video upload (for development/testing)
export async function POST(request: NextRequest) {
  try {
    console.log('Simple video upload request received')
    
    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    console.log(`File received: ${file.name}, size: ${file.size}, type: ${file.type}`)

    // Validate file size (10MB limit for Vercel)
    const maxSize = 10 * 1024 * 1024 // 10MB (Vercel limit)
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Video file too large. Maximum size is 10MB for local upload.' },
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'videos')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'mp4'
    const fileName = `video_${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    
    // Return the public URL
    const videoUrl = `/uploads/videos/${fileName}`
    
    console.log(`Video saved successfully: ${videoUrl}`)

    return NextResponse.json({
      videoUrl,
      message: 'Video uploaded successfully to local storage',
      fileName
    })
  } catch (error) {
    console.error('Simple video upload error:', error)
    return NextResponse.json(
      { error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
