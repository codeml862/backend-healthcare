import { prisma } from '../../prismaClient.ts';

// Define a type for our response structure
type ApiResponse = {
  status: number;
  body: any;
};

// GET /api/tablets - Get all tablets
export async function getTabletsHandler(): Promise<ApiResponse> {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const tablets = await prisma.tablet.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // In serverless environments, we should disconnect after each request
    // But we'll let the API route handler manage this to avoid multiple disconnects
    return { status: 200, body: { tablets } };
  } catch (error: any) {
    console.error('API Error in getTabletsHandler:', error);
    
    // Provide more specific error information
    if (error.code === 'P1001') {
      return { status: 500, body: { error: 'Database Connection Error', details: 'Cannot connect to database. Check your DATABASE_URL environment variable.' } };
    } else if (error.code === 'P2021' || (typeof error.message === 'string' && error.message.includes('does not exist'))) {
      // Auto-create the Tablet table in production-like environments to avoid hard failures
      try {
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Tablet" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "genericName" TEXT NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Tablet_pkey" PRIMARY KEY ("id")
        )`;
        // After ensuring table exists, return empty list (fresh DB)
        return { status: 200, body: { tablets: [] } };
      } catch (createErr: any) {
        console.error('Failed to auto-create Tablet table:', createErr);
        return { status: 500, body: { error: 'Database Error', details: 'Table does not exist and could not be created automatically. Run migrations.' } };
      }
    } else if (error.code === 'P2002') {
      return { status: 500, body: { error: 'Database Error', details: 'Unique constraint failed.' } };
    } else if (error.code === 'P2003') {
      return { status: 500, body: { error: 'Database Error', details: 'Foreign key constraint failed.' } };
    } else if (error.code === 'P2005') {
      return { status: 500, body: { error: 'Database Error', details: 'Value violates field constraint.' } };
    }
    
    return { status: 500, body: { error: 'Internal Server Error', details: error.message || 'Unknown error occurred' } };
  }
}

// GET /api/tablets/:id - Get tablet by ID
export async function getTabletByIdHandler(id: string): Promise<ApiResponse> {
  try {
    if (!id) {
      return { status: 400, body: { error: 'Missing tablet ID' } };
    }

    const tablet = await prisma.tablet.findUnique({
      where: { id },
    });

    if (!tablet) {
      return { status: 404, body: { error: 'Tablet not found' } };
    }

    return { status: 200, body: { tablet } };
  } catch (error: any) {
    console.error('API Error in getTabletByIdHandler:', error);
    return { status: 500, body: { error: 'Internal Server Error', details: error.message || 'Unknown error occurred' } };
  }
}

// POST /api/tablets - Create new tablet
export async function createTabletHandler(data: any): Promise<ApiResponse> {
  try {
    const { name, genericName, price, description } = data;

    if (!name || !genericName || price == null) {
      return { status: 400, body: { error: 'Missing required fields' } };
    }

    const tablet = await prisma.tablet.create({
      data: {
        name,
        genericName,
        price: parseFloat(price),
        description: description || '',
      },
    });

    return { status: 201, body: { tablet } };
  } catch (error: any) {
    console.error('API Error in createTabletHandler:', error);
    if (error.code === 'P2002') {
      return { status: 400, body: { error: 'Duplicate Entry', details: 'A tablet with this name already exists.' } };
    }
    return { status: 500, body: { error: 'Internal Server Error', details: error.message || 'Unknown error occurred' } };
  }
}

// PUT /api/tablets/:id - Update existing tablet
export async function updateTabletHandler(id: string, data: any): Promise<ApiResponse> {
  try {
    if (!id) {
      return { status: 400, body: { error: 'Invalid tablet ID' } };
    }

    const { name, genericName, price, description } = data;

    const tablet = await prisma.tablet.update({
      where: { id },
      data: {
        name,
        genericName,
        price: price ? parseFloat(price) : undefined,
        description,
      },
    });

    return { status: 200, body: { tablet } };
  } catch (error: any) {
    console.error('API Error in updateTabletHandler:', error);
    if (error.code === 'P2025') {
      return { status: 404, body: { error: 'Tablet not found' } };
    } else if (error.code === 'P2002') {
      return { status: 400, body: { error: 'Duplicate Entry', details: 'A tablet with this name already exists.' } };
    }
    return { status: 500, body: { error: 'Internal Server Error', details: error.message || 'Unknown error occurred' } };
  }
}

// DELETE /api/tablets/:id - Delete tablet
export async function deleteTabletHandler(id: string): Promise<ApiResponse> {
  try {
    if (!id) {
      return { status: 400, body: { error: 'Invalid tablet ID' } };
    }

    await prisma.tablet.delete({ where: { id } });
    return { status: 204, body: {} };
  } catch (error: any) {
    console.error('API Error in deleteTabletHandler:', error);
    if (error.code === 'P2025') {
      return { status: 404, body: { error: 'Tablet not found' } };
    }
    return { status: 500, body: { error: 'Internal Server Error', details: error.message || 'Unknown error occurred' } };
  }
}
