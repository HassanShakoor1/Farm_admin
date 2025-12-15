import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const goats = await prisma.goat.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(goats)
  } catch (error) {
    console.error('Error fetching goats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goats' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received goat data:', body)
    
    const { name, breed, age, weight, price, description, imageUrl, imageUrls, isAvailable, gender, color, healthStatus } = body

    // Validate required fields
    if (!name || !breed || !age || !weight || !price || !gender) {
      console.log('Validation failed:', { name, breed, age, weight, price, gender })
      return NextResponse.json(
        { error: 'Name, breed, age, weight, price, and gender are required' },
        { status: 400 }
      )
    }

    // Temporary solution: Store multiple images in description as JSON
    // This allows multiple images without database migration
    let finalImageUrl = imageUrl
    let finalDescription = description || null
    
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      const validImages = imageUrls.filter(url => url && url.trim() !== '')
      if (validImages.length > 0) {
        finalImageUrl = validImages[0] // First image as main
        
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

    // Create goat with current schema
    const goat = await prisma.goat.create({
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

    return NextResponse.json(goat, { status: 201 })
  } catch (error) {
    console.error('Error creating goat:', error)
    return NextResponse.json(
      { error: 'Failed to create goat' },
      { status: 500 }
    )
  }
}
