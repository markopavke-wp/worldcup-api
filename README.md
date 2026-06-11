# World Cup API

Backend za aplikaciju prognoza FIFA Svetskog prvenstva 2026.

## Podaci — API-Football

Koristi [API-Football](https://www.api-football.com/) (`league=1`, `season=2026`):

- raspored svih 104 utakmica
- live rezultati i status
- tabele svih 12 grupa

Besplatan plan: **100 zahteva/dan** — dovoljno za sync svakih 15–30 min.

1. Registruj se: https://dashboard.api-football.com/register
2. Kopiraj API ključ u `.env`

## Pokretanje lokalno

```bash
cp .env.example .env
# popuni DATABASE_URL i API_FOOTBALL_KEY

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
   - `API_FOOTBALL_KEY` = opciono, za live rezultate i tabele grupa
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
