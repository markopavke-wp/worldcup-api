import { seedFixtures } from '../src/services/seedService.js';
import { prisma } from '../src/lib/prisma.js';

const result = await seedFixtures();
console.log(`Seed završen: ${result.upserted} utakmica`);
await prisma.$disconnect();
