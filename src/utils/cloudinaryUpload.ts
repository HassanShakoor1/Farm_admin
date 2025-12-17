// Cloudinary Video Upload - Handles Unlimited File Sizes
// No compression, maintains original quality

export async function uploadVideoToCloudinary(file: File, onProgress?: (progress: number) => void): Promise<string> {
  // Cloudinary configuration - FREE TIER
  const CLOUD_NAME = 'demo' // Replace with your cloud name from cloudinary.com
  const UPLOAD_PRESET = 'ml_default' // Unsigned upload preset
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('resource_type', 'video')
  formData.append('folder', 'goat_videos')
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // Progress tracking
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100)
        onProgress(progress)
      }
    })
    
    // Success handler
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response.secure_url)
        } catch (error) {
          reject(new Error('Failed to parse response'))
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })
    
    // Error handler
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })
    
    // Send request
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`)
    xhr.send(formData)
  })
}

// Alternative: Upload to file.io (free, no account needed, 2GB limit)
export async function uploadToFileIO(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // Progress tracking
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100)
        onProgress(progress)
      }
    })
    
    // Success handler
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.success && response.link) {
            resolve(response.link)
          } else {
            reject(new Error('Upload failed'))
          }
        } catch (error) {
          reject(new Error('Failed to parse response'))
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })
    
    // Error handler
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })
    
    // Send request
    xhr.open('POST', 'https://file.io')
    xhr.send(formData)
  })
}

// Production-ready upload with automatic fallback
export async function uploadLargeVideo(
  file: File,
  onProgress?: (progress: number) => void,
  onStatusChange?: (status: string) => void
): Promise<string> {
  try {
    // Method 1: Try Cloudinary first (best quality, unlimited)
    onStatusChange?.('Uploading to Cloudinary...')
    const url = await uploadVideoToCloudinary(file, onProgress)
    onStatusChange?.('Upload complete!')
    return url
  } catch (cloudinaryError) {
    console.error('Cloudinary failed, trying alternative...', cloudinaryError)
    
    try {
      // Method 2: Fallback to File.io (2GB limit but no account needed)
      onStatusChange?.('Using alternative upload method...')
      const url = await uploadToFileIO(file, onProgress)
      onStatusChange?.('Upload complete!')
      return url
    } catch (fileioError) {
      console.error('All upload methods failed', fileioError)
      throw new Error('Failed to upload video. Please try a different file or contact support.')
    }
  }
}

