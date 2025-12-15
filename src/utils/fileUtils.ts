import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Safely delete an image file from the uploads directory
 * @param imageUrl - The image URL (e.g., "/uploads/goat-123456789.jpg")
 * @returns Promise<boolean> - true if deleted successfully, false otherwise
 */
export async function deleteImageFile(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
      console.log('Invalid image URL for deletion:', imageUrl)
      return false
    }

    // Extract filename from URL
    const filename = imageUrl.replace('/uploads/', '')
    const filePath = join(process.cwd(), 'public', 'uploads', filename)

    // Check if file exists before attempting to delete
    if (!existsSync(filePath)) {
      console.log('File does not exist:', filePath)
      return false
    }

    // Delete the file
    await unlink(filePath)
    console.log('Successfully deleted file:', filePath)
    return true
  } catch (error) {
    console.error('Error deleting file:', imageUrl, error)
    return false
  }
}

/**
 * Delete multiple image files
 * @param imageUrls - Array of image URLs to delete
 * @returns Promise<number> - Number of files successfully deleted
 */
export async function deleteMultipleImageFiles(imageUrls: string[]): Promise<number> {
  let deletedCount = 0
  
  for (const imageUrl of imageUrls) {
    const success = await deleteImageFile(imageUrl)
    if (success) {
      deletedCount++
    }
  }
  
  return deletedCount
}

/**
 * Extract image URLs from goat data (including from description JSON)
 * @param goat - Goat object with imageUrl and description fields
 * @returns string[] - Array of all image URLs associated with the goat
 */
export function extractAllImageUrls(goat: { imageUrl?: string | null, description?: string | null }): string[] {
  const imageUrls: string[] = []
  
  // Add main image URL
  if (goat.imageUrl && goat.imageUrl.startsWith('/uploads/')) {
    imageUrls.push(goat.imageUrl)
  }
  
  // Extract additional images from description JSON
  if (goat.description) {
    try {
      const parsed = JSON.parse(goat.description)
      if (parsed.additionalImages && Array.isArray(parsed.additionalImages)) {
        const validAdditionalImages = parsed.additionalImages.filter(
          (url: string) => url && url.startsWith('/uploads/')
        )
        imageUrls.push(...validAdditionalImages)
      }
    } catch (error) {
      // Description is not JSON, ignore
    }
  }
  
  return imageUrls
}
