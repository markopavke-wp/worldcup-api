/**
 * Briše test korisnike i vraća utakmice u početno stanje.
 * npm run cleanup
 */
import { prisma } from '../lib/prisma.js';

const KEEP_EMAILS = (process.env.KEEP_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, displayName: true },
  });

  const toDelete = KEEP_EMAILS.length
    ? users.filter((u) => !KEEP_EMAILS.includes(u.email.toLowerCase()))
    : users;

  if (toDelete.length === 0) {
    console.log('Nema korisnika za brisanje.');
  } else {
    const result = await prisma.user.deleteMany({
      where: { id: { in: toDelete.map((u) => u.id) } },
    });
    console.log(`Obrisano korisnika: ${result.count}`);
    toDelete.forEach((u) => console.log(`  - ${u.displayName} (${u.email})`));
  }

  const matches = await prisma.match.updateMany({
    where: { status: { not: 'SCHEDULED' } },
    data: {
      status: 'SCHEDULED',
      homeScore: null,
      awayScore: null,
    },
  });
  console.log(`Utakmice vraćene na SCHEDULED: ${matches.count}`);

  const predictions = await prisma.prediction.deleteMany();
  console.log(`Obrisane prognoze: ${predictions.count}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
