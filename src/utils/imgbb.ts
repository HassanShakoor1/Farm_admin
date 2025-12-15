// Free image upload utility using Imgur API
export async function uploadToImgur(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  
  try {
    // Using Imgur's anonymous upload API
    const response = await fetch('https://api.imgur.com/3/image', {
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
      throw new Error(data.data?.error || 'Upload failed')
    }
  } catch (error) {
    console.error('Imgur upload error:', error)
    throw error
  }
}

export async function uploadMultipleToImgur(files: FileList): Promise<string[]> {
  const uploadPromises = Array.from(files).map(file => uploadToImgur(file))
  return Promise.all(uploadPromises)
}

// Keep the old function names for compatibility
export const uploadToImgBB = uploadToImgur
export const uploadMultipleToImgBB = uploadMultipleToImgur
