# World Cup API

Backend za aplikaciju prognoza FIFA Svetskog prvenstva 2026.

## Podaci — football-data.org (preporučeno)

Koristi [football-data.org](https://www.football-data.org/) (`competition=WC`, `season=2026`):

- live rezultati i status utakmica
- tabele grupa
- besplatan plan: **10 zahteva/min**

1. Registruj se: https://www.football-data.org/client/register
2. Kopiraj token u `.env` kao `FOOTBALL_DATA_TOKEN`

Raspored (104 utakmice) dolazi iz seed-a; sync ažurira rezultate i status u odnosu na timove i datum.

Opciono: [API-Football](https://www.api-football.com/) — besplatan plan **ne** podržava sezonu 2026.

## Pokretanje lokalno

```bash
cp .env.example .env
# popuni DATABASE_URL i FOOTBALL_DATA_TOKEN

npm install
docker compose up -d
npx prisma migrate dev
npm run db:seed
npm run dev
```

API: http://localhost:3001

Ručna sinhronizacija utakmica:

```bash
npm run sync
```

## Deploy na Render

1. Pushuj repo na GitHub
2. Render → **New** → **Blueprint** → izaberi `worldcup-api` repo
3. `render.yaml` automatski kreira:
   - PostgreSQL bazu (`worldcup-db`)
   - Web servis sa migracijama i seed-om (104 utakmice)
4. Ručno dodaj u dashboardu:
   - `CORS_ORIGIN` = URL frontenda (npr. `https://worldcup-web.onrender.com`)
   - `FOOTBALL_DATA_TOKEN` = za live rezultate i tabele grupa
5. Frontend (`worldcup-web`) deployuj posebno; u `VITE_API_URL` stavi URL API-ja

## Endpointi

| Metoda | Ruta | Opis |
|--------|------|------|
| POST | `/api/auth/register` | Registracija |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Profil |
| GET | `/api/matches` | Raspored + moja prognoza |
| PUT | `/api/predictions/:matchId` | Sačuvaj prognozu |
| GET | `/api/leaderboard` | Tabela takmičara |
| GET | `/api/standings` | Tabele grupa |
| POST | `/api/admin/sync` | Ručna sinhronizacija |

## Bodovanje

- Tačan ishod (1/X/2): **1 poen**
- Tačan rezultat: **2 poena**
- Oba pogodjena: **3 poena** (1 + 2)
- Tačan rezultat mora da odgovara izabranom ishodu (npr. X → nerešen rezultat)
- Prognoze se zaključavaju **1 sat pre početka** utakmice
