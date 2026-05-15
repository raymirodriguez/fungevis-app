# FUNGEVIS — Sistema de Gestión de Salud

Fundación Gerontológica Vida y Salud  
Urb. Daniel Carías, calle 2 entre 2 y 3, Av. la mata, Cabudare.  
Teléfonos: 0251 263 20 72 | fungevis@gmail.com

---

## Stack

- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Hosting**: Netlify (static SPA)

---

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. In the **SQL Editor**, paste and run the entire contents of `supabase/migration.sql`
3. In **Authentication → Users**, click **Invite user** and create:
   - Email: `admin@fungevis.app` (or any email you prefer)
   - Password: set a secure password
4. Copy your **Project URL** and **anon key** from Settings → API

### 2. Configure environment variables

```bash
cp client/.env.example client/.env
# Edit client/.env with your Supabase URL and anon key
```

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run locally

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploy to Netlify

### Option A — Netlify UI (easiest)

1. Push this repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
3. Select your repo
4. Build settings are auto-detected from `netlify.toml`:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
5. Add environment variables in **Site settings → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**

### Option B — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set VITE_SUPABASE_URL "https://xxx.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-key"
netlify deploy --prod
```

---

## Modules

1. **Servicio de Salud Total** — Register health service contracts (pólizas)
2. **Servicio Atención al Paciente** — Look up affiliated patients
3. **Beneficiarios** — Register beneficiaries linked to policy holders
4. **Centros de Atención Aliadas** — Manage allied healthcare centers
5. **Cobranzas** — Track payment collections for policies
6. **Personal de Salud Fungevis** — Manage in-house health staff
7. **Reportes y Listas de Precios** — Read-only price tables and plan benefits

---

## Notes

- All UI is in Spanish
- Currency: US Dollars ($)
- CI (Cédula de Identidad): accepts `V-12345678` or `E-12345678` format
- Vigencia shows `#¡VALOR!` when dates are missing
- The `server/` folder is kept for reference (local SQLite version) but is **not used** in production
