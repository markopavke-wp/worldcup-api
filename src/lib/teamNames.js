// Kanonska imena kao u seed-u; aliasi pokrivaju football-data.org i API-Football varijante.
const ALIASES = {
  'korea republic': 'Korea Republic',
  'south korea': 'Korea Republic',
  'republic of korea': 'Korea Republic',
  'united states': 'United States',
  usa: 'United States',
  'u.s.a.': 'United States',
  iran: 'IR Iran',
  'ir iran': 'IR Iran',
  'ivory coast': "Côte d'Ivoire",
  "cote d'ivoire": "Côte d'Ivoire",
  "côte d'ivoire": "Côte d'Ivoire",
  'cape verde': 'Cabo Verde',
  'cabo verde': 'Cabo Verde',
  'cape verde islands': 'Cabo Verde',
  'dr congo': 'Congo DR',
  'congo dr': 'Congo DR',
  'democratic republic of the congo': 'Congo DR',
  'congo-kinshasa': 'Congo DR',
  turkey: 'Türkiye',
  türkiye: 'Türkiye',
  'bosnia-herzegovina': 'Bosnia and Herzegovina',
  'bosnia and herzegovina': 'Bosnia and Herzegovina',
  'saudi arabia': 'Saudi Arabia',
  'new zealand': 'New Zealand',
  curacao: 'Curaçao',
  curaçao: 'Curaçao',
  'czech republic': 'Czechia',
  czechia: 'Czechia',
};

export function normalizeTeamName(name) {
  if (!name) return '';
  const trimmed = name.trim();
  const key = trimmed.toLowerCase();
  return ALIASES[key] || trimmed;
}

export function teamsMatch(nameA, nameB) {
  return normalizeTeamName(nameA) === normalizeTeamName(nameB);
}
