// Cloudinary upload utility for Vercel deployment
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'goat_farm_uploads') // We'll create this preset
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    const data = await response.json()
    
    if (response.ok) {
      return data.secure_url
    } else {
      throw new Error(data.error?.message || 'Upload failed')
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

export async function uploadMultipleToCloudinary(files: FileList): Promise<string[]> {
  const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file))
  return Promise.all(uploadPromises)
}
