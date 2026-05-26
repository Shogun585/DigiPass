const { PrismaClient } = require('@prisma/client');

// Prisma inherently manages connection pooling via the Supabase connection string.

const prisma = new PrismaClient();

module.exports = prisma;