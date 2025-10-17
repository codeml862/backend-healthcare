import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../prismaClient.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Log environment variables (without exposing sensitive data)
    console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        error: 'DATABASE_URL environment variable is not set' 
      });
    }
    
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    // Try to access the Tablet table
    let tabletResult;
    try {
      tabletResult = await prisma.tablet.findMany({ take: 1 });
    } catch (tableError: any) {
      console.log('Tablet table error:', tableError);
      tabletResult = { error: tableError.message };
    }
    
    await prisma.$disconnect();
    
    res.status(200).json({ 
      message: 'Database connection successful',
      connectionTest: result,
      tabletTest: tabletResult
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    
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
      error: 'Database test failed',
      message: errorMessage,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
}