import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Test database connection
export async function GET() {
  try {
    // Try to connect and run a simple query
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    // Check tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connected successfully!',
      test: result,
      tables: tables,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...'
      }
    })
  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        code: error.code,
        env: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          nodeEnv: process.env.NODE_ENV
        }
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

