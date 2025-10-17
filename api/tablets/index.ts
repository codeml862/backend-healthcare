import { VercelRequest, VercelResponse } from '@vercel/node';
import { getTabletsHandler, createTabletHandler } from '../../integrations/api/tablets.js';
import { prisma } from '../../prismaClient.js';

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
} else {
  console.log('DATABASE_URL is set');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        const getResponse = await getTabletsHandler();
        await prisma.$disconnect();
        res.status(getResponse.status).json(getResponse.body);
        break;
        
      case 'POST':
        const createResponse = await createTabletHandler(req.body);
        await prisma.$disconnect();
        res.status(createResponse.status).json(createResponse.body);
        break;
        
      default:
        await prisma.$disconnect();
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error in tablets index handler:', error);
    await prisma.$disconnect();
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message || 'Unknown error occurred'
    });
  }
}