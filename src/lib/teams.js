const TEAMS = {
  Mexico: { code: 'MEX', iso: 'mx' },
  'South Africa': { code: 'RSA', iso: 'za' },
  'Korea Republic': { code: 'KOR', iso: 'kr' },
  Czechia: { code: 'CZE', iso: 'cz' },
  Canada: { code: 'CAN', iso: 'ca' },
  'Bosnia and Herzegovina': { code: 'BIH', iso: 'ba' },
  'United States': { code: 'USA', iso: 'us' },
  Paraguay: { code: 'PAR', iso: 'py' },
  Haiti: { code: 'HAI', iso: 'ht' },
  Scotland: { code: 'SCO', iso: 'gb-sct' },
  Australia: { code: 'AUS', iso: 'au' },
  Türkiye: { code: 'TUR', iso: 'tr' },
  Brazil: { code: 'BRA', iso: 'br' },
  Morocco: { code: 'MAR', iso: 'ma' },
  Qatar: { code: 'QAT', iso: 'qa' },
  Switzerland: { code: 'SUI', iso: 'ch' },
  "Côte d'Ivoire": { code: 'CIV', iso: 'ci' },
  Ecuador: { code: 'ECU', iso: 'ec' },
  Germany: { code: 'GER', iso: 'de' },
  Curaçao: { code: 'CUW', iso: 'cw' },
  Netherlands: { code: 'NED', iso: 'nl' },
  Japan: { code: 'JPN', iso: 'jp' },
  Sweden: { code: 'SWE', iso: 'se' },
  Tunisia: { code: 'TUN', iso: 'tn' },
  'Saudi Arabia': { code: 'KSA', iso: 'sa' },
  Uruguay: { code: 'URU', iso: 'uy' },
  Spain: { code: 'ESP', iso: 'es' },
  'Cabo Verde': { code: 'CPV', iso: 'cv' },
  'IR Iran': { code: 'IRN', iso: 'ir' },
  'New Zealand': { code: 'NZL', iso: 'nz' },
  Belgium: { code: 'BEL', iso: 'be' },
  Egypt: { code: 'EGY', iso: 'eg' },
  France: { code: 'FRA', iso: 'fr' },
  Senegal: { code: 'SEN', iso: 'sn' },
  Iraq: { code: 'IRQ', iso: 'iq' },
  Norway: { code: 'NOR', iso: 'no' },
  Argentina: { code: 'ARG', iso: 'ar' },
  Algeria: { code: 'ALG', iso: 'dz' },
  Austria: { code: 'AUT', iso: 'at' },
  Jordan: { code: 'JOR', iso: 'jo' },
  Ghana: { code: 'GHA', iso: 'gh' },
  Panama: { code: 'PAN', iso: 'pa' },
  England: { code: 'ENG', iso: 'gb-eng' },
  Croatia: { code: 'CRO', iso: 'hr' },
  Portugal: { code: 'POR', iso: 'pt' },
  'Congo DR': { code: 'COD', iso: 'cd' },
  Uzbekistan: { code: 'UZB', iso: 'uz' },
  Colombia: { code: 'COL', iso: 'co' },
};

export function getTeamInfo(name) {
  const info = TEAMS[name];
  if (!info) {
    return {
      name,
      code: name.slice(0, 3).toUpperCase(),
      flagUrl: null,
    };
  }
  return {
    name,
    code: info.code,
    flagUrl: `https://flagcdn.com/w40/${info.iso}.png`,
  };
}

export function enrichTeam(name, logo = null) {
  const info = getTeamInfo(name);
  return {
    name: info.name,
    code: info.code,
    flagUrl: logo || info.flagUrl,
  };
}
