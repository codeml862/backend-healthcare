import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../prismaClient';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'DATABASE_URL environment variable is not set' 
      });
    }

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if Tablet table exists by trying to count records
    const tabletCount = await prisma.tablet.count();
    
    await prisma.$disconnect();
    
    res.status(200).json({ 
      status: 'ok', 
      message: 'Database connection successful',
      tabletCount: tabletCount
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    
    // Always disconnect the Prisma client
    await prisma.$disconnect();
    
    let errorMessage = 'Unknown error';
    if (error.code === 'P1001') {
      errorMessage = 'Cannot connect to database. Check your DATABASE_URL environment variable.';
    } else if (error.code === 'P2021') {
      errorMessage = 'Table does not exist. Run database migrations.';
    } else {
      errorMessage = error.message || 'Database connection failed';
    }
    
    res.status(500).json({ 
      status: 'error', 
      message: errorMessage,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
}