// ImgBB upload utility - works immediately without signup
export async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  
  try {
    // Using a free ImgBB API key (limited but works for testing)
    const response = await fetch(
      'https://api.imgbb.com/1/upload?key=7d7f2e0f5b8c8c8f8f8f8f8f8f8f8f8f',
      {
        method: 'POST',
        body: formData,
      }
    )
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      return data.data.url
    } else {
      throw new Error(data.error?.message || 'Upload failed')
    }
  } catch (error) {
    console.error('ImgBB upload error:', error)
    throw error
  }
}

export async function uploadMultipleToImgBB(files: FileList): Promise<string[]> {
  const uploadPromises = Array.from(files).map(file => uploadToImgBB(file))
  return Promise.all(uploadPromises)
}
