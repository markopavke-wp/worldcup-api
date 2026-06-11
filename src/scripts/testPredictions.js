/**
 * Lokalni test bodovanja i zaključavanja prognoza.
 *
 * npm run test:predictions          — oba testa
 * npm run test:predictions -- lock  — samo zaključavanje
 * npm run test:predictions -- score — samo bodovanje
 */
import { prisma } from '../lib/prisma.js';
import { canEditPrediction, calculatePoints } from '../lib/outcome.js';
import { scoreMatch } from '../services/scoringService.js';

const mode = process.argv[2] || 'all';
const TEST_EMAIL = 'demo@worldcup.local';

async function getTestMatch() {
  return prisma.match.findFirst({
    where: { groupName: { not: null } },
    orderBy: { kickoffAt: 'asc' },
  });
}

async function testLock(match) {
  console.log('\n=== TEST ZAKLJUČAVANJA (1h pre utakmice) ===\n');
  console.log(`Utakmica: ${match.homeTeam} vs ${match.awayTeam}`);
  console.log(`Početak:  ${match.kickoffAt.toISOString()}`);
  console.log(`Zaključava: ${match.predictionsLockedAt.toISOString()}`);

  const now = new Date();
  const naturallyLocked = !canEditPrediction(match);
  console.log(`\nSada (${now.toISOString()}):`);
  console.log(`  canEdit = ${!naturallyLocked} (prirodno stanje iz baze)`);

  const lockedSnapshot = {
    ...match,
    status: 'SCHEDULED',
    predictionsLockedAt: new Date(now.getTime() - 60_000),
  };
  const openSnapshot = {
    ...match,
    status: 'SCHEDULED',
    kickoffAt: new Date(now.getTime() + 2 * 60 * 60_000),
    predictionsLockedAt: new Date(now.getTime() + 60 * 60_000),
  };

  console.log('\nSimulacija (bez izmene baze):');
  console.log(`  Zaključano (lock u prošlosti):  canEdit = ${canEditPrediction(lockedSnapshot)}`);
  console.log(`  Otvoreno (lock za 1h):           canEdit = ${canEditPrediction(openSnapshot)}`);
  console.log(`  LIVE utakmica:                   canEdit = ${canEditPrediction({ ...match, status: 'LIVE' })}`);
  console.log(`  Završena utakmica:               canEdit = ${canEditPrediction({ ...match, status: 'FINISHED' })}`);
}

async function testScoring(match) {
  console.log('\n=== TEST BODOVANJA ===\n');

  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (!user) {
    console.log(`Nema korisnika ${TEST_EMAIL} — registruj se u aplikaciji pa pokreni ponovo.`);
    return;
  }

  const scenarios = [
    { label: 'Samo ishod (pogodjen)', outcome: '1', home: null, away: null, actual: [2, 1], expected: 1 },
    { label: 'Samo ishod (promašen)', outcome: 'X', home: null, away: null, actual: [2, 1], expected: 0 },
    { label: 'Ishod + tačan rezultat (oba)', outcome: '1', home: 2, away: 1, actual: [2, 1], expected: 3 },
    { label: 'Ishod da, rezultat ne', outcome: '1', home: 3, away: 0, actual: [2, 1], expected: 1 },
    { label: 'Rezultat da, ishod ne (nemoguće ako se slažu)', outcome: 'X', home: 2, away: 1, actual: [2, 1], expected: 0 },
  ];

  console.log('Pravila: ishod = 1p, tačan rezultat = +2p, ukupno do 3p\n');
  for (const s of scenarios) {
    const pts = calculatePoints(s.outcome, s.home, s.away, s.actual[0], s.actual[1]);
    const ok = pts === s.expected ? '✓' : '✗';
    console.log(`${ok} ${s.label}: ${pts} poena (očekivano ${s.expected})`);
  }

  console.log('\n--- Živi test u bazi (privremeno) ---\n');

  const backup = {
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
  };

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId: user.id, matchId: match.id } },
    create: {
      userId: user.id,
      matchId: match.id,
      outcomePred: '1',
      homeScorePred: 2,
      awayScorePred: 1,
    },
    update: {
      outcomePred: '1',
      homeScorePred: 2,
      awayScorePred: 1,
      pointsAwarded: null,
    },
  });

  await prisma.match.update({
    where: { id: match.id },
    data: { status: 'FINISHED', homeScore: 2, awayScore: 1 },
  });

  const { scored } = await scoreMatch(match.id);
  const prediction = await prisma.prediction.findUnique({
    where: { userId_matchId: { userId: user.id, matchId: match.id } },
  });

  console.log(`Utakmica: ${match.homeTeam} vs ${match.awayTeam} → 2:1`);
  console.log(`Prognoza demo korisnika: ishod 1, rezultat 2:1`);
  console.log(`Obodovano prognoza: ${scored}`);
  console.log(`Dodeljeni poeni: ${prediction?.pointsAwarded} (očekivano 3)`);

  await prisma.match.update({
    where: { id: match.id },
    data: backup,
  });
  await prisma.prediction.update({
    where: { userId_matchId: { userId: user.id, matchId: match.id } },
    data: { pointsAwarded: null },
  });

  console.log('\nUtakmica vraćena u prethodno stanje.');
  console.log('Osveži frontend i proveri Profil / Tabelu ako želiš da vidiš poene u UI (ponovi test bez restore).');
}

async function main() {
  const match = await getTestMatch();
  if (!match) {
    console.log('Nema utakmica u bazi. Pokreni: npm run db:seed');
    process.exit(1);
  }

  if (mode === 'lock' || mode === 'all') await testLock(match);
  if (mode === 'score' || mode === 'all') await testScoring(match);

  console.log('\n--- Ručno u aplikaciji ---');
  console.log('1. Uloguj se kao demo@worldcup.local / demo1234');
  console.log('2. Utakmice → unesi prognozu na otvorenoj utakmici');
  console.log('3. Za lock: filtriraj "Otvorene" — zaključane nestaju iz filtera');
  console.log('4. Za poene: u bazi postavi utakmicu na FINISHED + rezultat, pa: node -e "import(...)"');
  console.log('   ili pokreni: npm run test:predictions -- score\n');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
