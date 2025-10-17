import { VercelRequest, VercelResponse } from '@vercel/node';
import { getTabletByIdHandler, updateTabletHandler, deleteTabletHandler } from '../../integrations/api/tablets.ts';
import { prisma } from '../../prismaClient.ts';

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
} else {
  console.log('DATABASE_URL is set');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        const getResponse = await getTabletByIdHandler(id as string);
        await prisma.$disconnect();
        res.status(getResponse.status).json(getResponse.body);
        break;
        
      case 'PUT':
        const updateResponse = await updateTabletHandler(id as string, req.body);
        await prisma.$disconnect();
        res.status(updateResponse.status).json(updateResponse.body);
        break;
        
      case 'DELETE':
        const deleteResponse = await deleteTabletHandler(id as string);
        await prisma.$disconnect();
        res.status(deleteResponse.status).json(deleteResponse.body);
        break;
        
      default:
        await prisma.$disconnect();
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error in tablets [id] handler:', error);
    await prisma.$disconnect();
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message || 'Unknown error occurred'
    });
  }
}