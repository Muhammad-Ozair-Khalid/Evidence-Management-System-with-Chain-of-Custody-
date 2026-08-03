# Cloud deploy — copy these variables

I cannot open your Railway/Zeabur dashboard from here. Paste these into **Variables** on your web service, then redeploy.

## Required variables

```
NEXTAUTH_SECRET=066e96c2a898c662bbb007ba2191f3549fda8e3e6584ca788764a16bc053e325
STORAGE_MODE=local
ORGANIZATION_NAME=NCERT Forensic Evidence Unit
```

## DATABASE_URL (do NOT use localhost)

1. In the same project click **+ Add** → **Database** → **PostgreSQL**
2. Open your **web service** → Variables
3. Add `DATABASE_URL` by **referencing** the Postgres variable (Railway UI: Variable Reference → Postgres → `DATABASE_URL`)

It will look similar to:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

(Exact reference name may be `Postgres` / `PostgreSQL` depending on what you named the DB service.)

## NEXTAUTH_URL (do NOT use localhost)

1. Open your web service → **Settings** → **Networking** / **Public Networking** → generate domain
2. Copy the HTTPS URL (example: `https://ems-coc-production.up.railway.app`)
3. Set:

```
NEXTAUTH_URL=https://YOUR-REAL-DOMAIN-HERE
```

No trailing slash.

## Skip these for now

Do **not** add S3 variables while `STORAGE_MODE=local`.

## After variables are saved

1. Redeploy the web service
2. Wait until status is Online
3. Open the public domain
4. Login with `admin@ems.local` / `Password123!`

## What this repo already does for you

- `railway.toml` — build + start with migrate + seed
- `npm run start:prod` — runs `prisma migrate deploy`, seeds demo users, then `next start`
- `tsx` moved to dependencies so seeding works in the cloud
