// Video upload utilities for admin panel

// Upload video to Imgur (supports MP4 up to 200MB)
export async function uploadVideoToImgur(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('video', file)
  
  try {
    const response = await fetch('https://api.imgur.com/3/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7', // Public Imgur client ID
      },
      body: formData,
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      return data.data.link
    } else {
      throw new Error(data.data?.error || 'Video upload failed')
    }
  } catch (error) {
    console.error('Imgur video upload error:', error)
    throw error
  }
}

// Validate video file
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid video file (MP4, WebM, OGG, MOV, or AVI)'
    }
  }
  
  // Check file size (max 200MB for Imgur)
  const maxSize = 200 * 1024 * 1024 // 200MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Video file too large. Please upload videos smaller than 200MB.'
    }
  }
  
  return { valid: true }
}

// Generate video thumbnail from video file
export function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    video.onloadedmetadata = () => {
      // Set canvas size
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Seek to 1 second or 10% of video duration
      video.currentTime = Math.min(1, video.duration * 0.1)
    }
    
    video.onseeked = () => {
      // Draw video frame to canvas
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to base64
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
      resolve(thumbnail)
      
      // Cleanup
      video.remove()
      canvas.remove()
    }
    
    video.onerror = () => {
      reject(new Error('Failed to generate thumbnail'))
      video.remove()
      canvas.remove()
    }
    
    // Load video
    video.src = URL.createObjectURL(file)
    video.load()
  })
}
