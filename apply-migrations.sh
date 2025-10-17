#!/bin/bash
# This script helps apply Prisma migrations to the Vercel database
# Make sure your DATABASE_URL environment variable is set correctly

echo "Applying Prisma migrations to Vercel database..."
npx prisma migrate deploy
echo "Migration completed!"