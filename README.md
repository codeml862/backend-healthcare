# Backend Healthcare

This repository contains the backend code for the Healthcare application.

## Technologies Used
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL

## Getting Started
1. Install dependencies: 
pm install
2. Set up environment variables (see .env.example)
3. Run database migrations: 
px prisma migrate dev
4. Run the development server: 
pm run dev

## Project Structure
- pi/ - API routes
- integrations/ - Database and service integrations
- lib/ - Utility libraries
- prisma/ - Prisma schema and migrations

## API Endpoints
- /api/tablets - Tablet management endpoints
- /api/health - Health check endpoint

## Deployment
This backend can be deployed to any Node.js hosting service like Vercel, Heroku, or AWS.
