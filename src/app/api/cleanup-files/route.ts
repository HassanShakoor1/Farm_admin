import { NextResponse } from 'next/server'
import { readdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/db'

/**
 * Clean up orphaned image files that are not referenced in the database
 */
export async function POST() {
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    
    // Check if uploads directory exists
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({ 
        message: 'Uploads directory does not exist',
        deletedFiles: 0 
      })
    }

    // Get all files in uploads directory
    const files = await readdir(uploadsDir)
    const imageFiles = files.filter(file => 
      file.match(/\.(jpg|jpeg|png|webp)$/i) && file.startsWith('goat-')
    )

    if (imageFiles.length === 0) {
      return NextResponse.json({ 
        message: 'No image files found to clean up',
        deletedFiles: 0 
      })
    }

    // Get all goats from database
    const goats = await prisma.goat.findMany({
      select: { imageUrl: true, description: true }
    })

    // Extract all referenced image URLs
    const { extractAllImageUrls } = await import('@/utils/fileUtils')
    const referencedUrls = new Set<string>()
    
    goats.forEach(goat => {
      const urls = extractAllImageUrls(goat)
      urls.forEach(url => referencedUrls.add(url))
    })

    // Find orphaned files
    const orphanedFiles: string[] = []
    for (const file of imageFiles) {
      const fileUrl = `/uploads/${file}`
      if (!referencedUrls.has(fileUrl)) {
        orphanedFiles.push(file)
      }
    }

    // Delete orphaned files
    let deletedCount = 0
    for (const file of orphanedFiles) {
      try {
        const filePath = join(uploadsDir, file)
        await unlink(filePath)
        deletedCount++
        console.log('Deleted orphaned file:', file)
      } catch (error) {
        console.error('Error deleting orphaned file:', file, error)
      }
    }

    return NextResponse.json({ 
      message: `Cleanup completed. Deleted ${deletedCount} orphaned files.`,
      deletedFiles: deletedCount,
      totalFiles: imageFiles.length,
      orphanedFiles: orphanedFiles
    })
  } catch (error) {
    console.error('Error during file cleanup:', error)
    return NextResponse.json(
      { error: 'Failed to clean up files' },
      { status: 500 }
    )
  }
}
