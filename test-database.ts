import { prisma } from './server/prismaClient.ts';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Test if Tablet table exists
    try {
      const count = await prisma.tablet.count();
      console.log(`✅ Tablet table exists with ${count} records`);
    } catch (error) {
      console.log('❌ Tablet table error:', error.message);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testDatabaseConnection();