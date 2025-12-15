import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid goat ID' },
        { status: 400 }
      )
    }

    const goat = await prisma.goat.findUnique({
      where: { id }
    })

    if (!goat) {
      return NextResponse.json(
        { error: 'Goat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(goat)
  } catch (error) {
    console.error('Error fetching goat:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goat' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid goat ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    console.log('Received update data:', body)
    
    const { name, breed, age, weight, price, description, imageUrl, imageUrls, isAvailable, gender, color, healthStatus } = body

    // Validate required fields
    if (!name || !breed || !age || !weight || !price || !gender) {
      console.log('Validation failed:', { name, breed, age, weight, price, gender })
      return NextResponse.json(
        { error: 'Name, breed, age, weight, price, and gender are required' },
        { status: 400 }
      )
    }

    // Get current goat data to compare images for cleanup
    const currentGoat = await prisma.goat.findUnique({
      where: { id },
      select: { imageUrl: true, description: true }
    })

    if (!currentGoat) {
      return NextResponse.json(
        { error: 'Goat not found' },
        { status: 404 }
      )
    }

    // Extract current image URLs
    const { extractAllImageUrls, deleteMultipleImageFiles } = await import('@/utils/fileUtils')
    const currentImageUrls = extractAllImageUrls(currentGoat)

    // Temporary solution: Store multiple images in description as JSON
    let finalImageUrl = imageUrl
    let finalDescription = description || null
    let newImageUrls: string[] = []
    
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      const validImages = imageUrls.filter(url => url && url.trim() !== '')
      if (validImages.length > 0) {
        finalImageUrl = validImages[0] // First image as main
        newImageUrls = validImages
        
        // Store all images in description as JSON if there are multiple
        if (validImages.length > 1) {
          const imageData = {
            description: description || '',
            additionalImages: validImages.slice(1) // Store additional images
          }
          finalDescription = JSON.stringify(imageData)
        }
      }
    }

    // Update goat
    const goat = await prisma.goat.update({
      where: { id },
      data: {
        name,
        breed,
        age,
        weight,
        price: parseFloat(price),
        description: finalDescription,
        imageUrl: finalImageUrl || null,
        isAvailable: isAvailable ?? true,
        gender,
        color: color || null,
        healthStatus: healthStatus || 'Healthy',
      },
    })

    // Clean up removed image files
    const imagesToDelete = currentImageUrls.filter(url => !newImageUrls.includes(url))
    if (imagesToDelete.length > 0) {
      const deletedCount = await deleteMultipleImageFiles(imagesToDelete)
      console.log(`Deleted ${deletedCount} out of ${imagesToDelete.length} removed image files for goat ID ${id}`)
    }

    return NextResponse.json(goat)
  } catch (error) {
    console.error('Error updating goat:', error)
    return NextResponse.json(
      { error: 'Failed to update goat' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid goat ID' },
        { status: 400 }
      )
    }

    // First, get the goat data to extract image URLs
    const goat = await prisma.goat.findUnique({
      where: { id },
      select: { imageUrl: true, description: true }
    })

    if (!goat) {
      return NextResponse.json(
        { error: 'Goat not found' },
        { status: 404 }
      )
    }

    // Extract all image URLs associated with this goat
    const { extractAllImageUrls, deleteMultipleImageFiles } = await import('@/utils/fileUtils')
    const imageUrls = extractAllImageUrls(goat)
    
    // Delete the goat from database
    await prisma.goat.delete({
      where: { id }
    })

    // Delete associated image files
    if (imageUrls.length > 0) {
      const deletedCount = await deleteMultipleImageFiles(imageUrls)
      console.log(`Deleted ${deletedCount} out of ${imageUrls.length} image files for goat ID ${id}`)
    }

    return NextResponse.json({ 
      message: 'Goat deleted successfully',
      deletedFiles: imageUrls.length 
    })
  } catch (error) {
    console.error('Error deleting goat:', error)
    return NextResponse.json(
      { error: 'Failed to delete goat' },
      { status: 500 }
    )
  }
}
