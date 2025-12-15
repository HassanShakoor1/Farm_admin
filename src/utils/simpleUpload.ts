// Simple image upload utilities with multiple fallbacks

// Convert file to base64 data URL (works offline, but creates large URLs)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Upload to multiple services with fallbacks
export async function uploadImageWithFallbacks(file: File): Promise<string> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file')
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('Image too large. Please select an image smaller than 10MB')
  }

  const errors: string[] = []

  // Try Imgur first
  try {
    const { uploadToImgur } = await import('./imgbb')
    return await uploadToImgur(file)
  } catch (error) {
    errors.push(`Imgur: ${error}`)
  }

  // Try Cloudinary if configured
  try {
    if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      const { uploadToCloudinary } = await import('./cloudinary')
      return await uploadToCloudinary(file)
    }
  } catch (error) {
    errors.push(`Cloudinary: ${error}`)
  }

  // Final fallback: base64 (not ideal but works)
  try {
    console.warn('Using base64 fallback - consider setting up proper image hosting')
    return await fileToBase64(file)
  } catch (error) {
    errors.push(`Base64: ${error}`)
  }

  throw new Error(`All upload methods failed: ${errors.join(', ')}`)
}

export async function uploadMultipleImages(files: FileList): Promise<string[]> {
  const uploadPromises = Array.from(files).map(file => uploadImageWithFallbacks(file))
  return Promise.all(uploadPromises)
}
