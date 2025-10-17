import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../prismaClient';

// This endpoint should only be accessible in development or with proper authentication
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check for a secret key to prevent unauthorized access
  const authHeader = req.headers.authorization;
  const expectedKey = process.env.MIGRATION_SECRET_KEY;
  
  if (!expectedKey) {
    return res.status(500).json({ 
      error: 'Migration secret key not configured' 
    });
  }
  
  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return res.status(401).json({ 
      error: 'Unauthorized' 
    });
  }
  
  try {
    // Run migrations
    // Check if the Tablet table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Tablet" LIMIT 1`;
      // If we get here, the table exists
      await prisma.$disconnect();
      return res.status(200).json({ 
        message: 'Database schema is already up to date' 
      });
    } catch (tableError: any) {
      // Table doesn't exist, create it
      if (tableError.code === 'P2021' || tableError.message?.includes('does not exist')) {
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Tablet" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "genericName" TEXT NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Tablet_pkey" PRIMARY KEY ("id")
        );`;
        
        await prisma.$disconnect();
        
        return res.status(200).json({ 
          message: 'Database migration completed successfully' 
        });
      } else {
        throw tableError;
      }
    }
  } catch (error: any) {
    console.error('Migration error:', error);
    await prisma.$disconnect();
    res.status(500).json({ 
      error: 'Migration failed',
      details: error.message || 'Unknown error occurred'
    });
  }
}