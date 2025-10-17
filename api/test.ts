// Test API route to verify Vercel serverless function setup
import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../prismaClient';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({ 
      message: 'API route is working correctly',
      database: 'Connected successfully',
      timestamp: new Date().toISOString(),
      path: req.url
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'API route is working but database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      path: req.url
    });
  } finally {
    await prisma.$disconnect();
  }
};