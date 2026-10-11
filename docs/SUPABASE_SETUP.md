Haan, best hobe ekdom **complete ready-to-paste `SUPABASE_SETUP.md`** dile. Tumi `docs/SUPABASE_SETUP.md` file-er pura content delete kore nicher ta exactly paste korte paro.

````md
# ThiKorben Supabase Development Setup

ThiKorben uses Supabase as the shared backend platform for:

- PostgreSQL Database
- Authentication
- Row Level Security (RLS)
- Realtime
- Storage
- Future AI/vector search
- Future geospatial/location features

All team members should use the same shared development project while developing the application.

---

## Shared Development Project

Project Name:

```text
thikorben-dev
````

Project Reference:

```text
mfyyduyaskzofbxswxvr
```

Region:

```text
Southeast Asia (Singapore)
```

---

# 1. Install Project Dependencies

After cloning or pulling the latest project:

```bash
npm install
```

Do not use:

```bash
npm audit fix --force
```

without reviewing the dependency changes first.

Using `--force` may install incompatible versions of Expo, Expo Router, React Native, or other project dependencies.

---

# 2. Connect the App to Supabase

Each developer needs a private `.env.local` file.

The `.env.local` file contains the Supabase connection information used by the Expo application.

From the project root, run:

```bash
cp .env.example .env.local
```

Open the file:

```bash
code .env.local
```

You will see something similar to:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Open the Supabase Dashboard and select:

```text
thikorben-dev
```

Then open:

```text
Connect
```

or:

```text
Project Settings
→ API Keys
```

Copy only:

```text
Project URL
Publishable Key
```

Update `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://mfyyduyaskzofbxswxvr.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=PASTE_THE_REAL_PUBLISHABLE_KEY_HERE
```

Save the file.

---

# 3. Verify Environment File Security

Run:

```bash
git check-ignore .env.local
```

Expected output:

```text
.env.local
```

The file must NOT appear in:

```bash
git status
```

`.env.local` is private and must never be committed.

The repository contains:

```text
.env.example
```

only as a template for developers.

---

# 4. Important Security Rules

The mobile application may use:

```text
Supabase Project URL
Supabase Publishable Key
```

Never put any of the following inside the Expo application or GitHub repository:

```text
Supabase Secret Key
service_role Key
Database Password
Supabase Personal Access Token
```

Never create an Expo variable such as:

```text
EXPO_PUBLIC_SERVICE_ROLE_KEY
```

or:

```text
EXPO_PUBLIC_SUPABASE_SECRET_KEY
```

These credentials must never be exposed to the client application.

Database authorization must be protected using Row Level Security (RLS).

---

# 5. Supabase Client

The shared Supabase client is located at:

```text
lib/supabase.ts
```

Use this client throughout the application.

Example:

```ts
import { supabase } from '../lib/supabase';
```

Do not create separate Supabase clients inside individual screens or features unless there is a specific architectural reason.

Example database query:

```ts
const { data, error } = await supabase
  .from('products')
  .select('*');
```

---

# 6. Generated Database Types

Generated Supabase TypeScript types are stored at:

```text
types/database.types.ts
```

The shared Supabase client uses these types so database queries can be type-safe.

After any database schema change, regenerate the types:

```bash
npx supabase gen types typescript \
  --linked \
  --schema public \
  > types/database.types.ts
```

Commit the updated type file together with the migration.

---

# 7. Supabase CLI Login

The Supabase CLI is installed as a project development dependency.

Use:

```bash
npx supabase
```

instead of depending on a globally installed CLI.

Login:

```bash
npx supabase login
```

A browser window may open.

Each developer should preferably use their own Supabase account.

Do not share Supabase CLI access tokens.

---

# 8. Link the Repository to the Shared Project

Run:

```bash
npx supabase link --project-ref mfyyduyaskzofbxswxvr
```

After linking, verify:

```bash
npx supabase projects list
```

The `thikorben-dev` project should appear as linked.

---

# 9. Check Migration Status

Run:

```bash
npx supabase migration list
```

The local and remote migration versions should match.

Example:

```text
Local            | Remote
-----------------|-----------------
20260919083301   | 20260919083301
20260919084344   | 20260919084344
```

If the migration histories do not match, do not randomly push or edit migrations.

First investigate the difference.

---

# 10. Database Migration Workflow

All application database changes must be tracked using migration files.

Do not randomly create or modify application tables directly from the Supabase Dashboard.

Create a new migration:

```bash
npx supabase migration new descriptive_migration_name
```

Example:

```bash
npx supabase migration new create_products_table
```

A new file will be generated inside:

```text
supabase/migrations/
```

Example:

```text
supabase/migrations/20260919120000_create_products_table.sql
```

Write the required SQL inside that migration file.

---

# 11. Preview a Migration Before Applying It

Always preview remote database changes first:

```bash
npx supabase db push --dry-run
```

Review the output carefully.

If everything is correct, apply the migration:

```bash
npx supabase db push
```

Confirm when prompted.

After applying:

```bash
npx supabase migration list
```

Local and remote migration versions should match.

---

# 12. Never Modify an Applied Migration

After a migration has already been applied to the shared remote database:

```text
DO NOT edit that migration to make a new database change.
```

Instead create another migration:

```bash
npx supabase migration new fix_or_update_name
```

This keeps migration history predictable for every developer.

---

# 13. Existing Foundation Extensions

ThiKorben currently enables the following PostgreSQL extensions.

## pg_trgm

Used for:

```text
Typo-tolerant search
Fuzzy search
Product name matching
Bangla/Banglish/local spelling support
```

## vector / pgvector

Used for future:

```text
AI embeddings
Semantic search
Product recommendations
Meaning-based matching
```

## PostGIS

Used for future:

```text
Worker locations
Nearby workers
Nearby jobs
Distance queries
Geospatial filtering
Service-area matching
```

PostGIS is installed in the:

```text
gis
```

schema.

Example future geography column:

```sql
location gis.geography(Point, 4326)
```

This is SQL syntax.

Do not run that line directly as a Bash terminal command.

---

# 14. Row Level Security

All application tables must use Row Level Security.

The project already includes a database mechanism that automatically enables RLS for newly created tables in the `public` schema.

However:

```text
RLS enabled
```

does NOT automatically mean:

```text
correct access policies exist
```

Every feature must still define proper policies.

For example:

```text
Customer can access own jobs
Worker can access permitted jobs
Users can access conversations they belong to
Worker cannot modify another worker's proposal
Customer cannot access another customer's private information
```

Never depend only on frontend checks for security.

---

# 15. Database Access Rules

Before exposing a table to the mobile application, review:

```text
RLS
SELECT permissions
INSERT permissions
UPDATE permissions
DELETE permissions
Ownership rules
Role-specific policies
```

Frontend UI restrictions are not sufficient security.

Security must be enforced by PostgreSQL/Supabase policies.

---

# 16. Local Docker Requirement

Some Supabase CLI workflows require Docker.

Check Docker:

```bash
docker info
```

If Docker Desktop is not running:

```bash
docker desktop start
```

Check status:

```bash
docker desktop status
```

Expected:

```text
Status running
```

---

# 17. Pulling Remote Database Schema

Normally, database development should happen through Git migrations.

If the remote database has changes that are not represented locally, investigate first.

For an authorized schema baseline/pull:

```bash
npx supabase db pull
```

This may use Docker to create a shadow database.

Do not repeatedly run `db pull` as the normal development workflow.

New application changes should normally be created using:

```bash
npx supabase migration new ...
```

---

# 18. Team Workflow for Database Changes

Recommended workflow:

```text
1. Pull latest dev branch
2. Create your feature branch
3. Create a new migration
4. Write/review SQL
5. Run dry-run
6. Apply migration to shared development DB when coordinated
7. Regenerate database.types.ts
8. Run TypeScript checks
9. Review Git diff
10. Commit migration + types + feature code
11. Push branch
12. Create PR to dev
```

Avoid multiple developers making unrelated manual schema changes from the Dashboard at the same time.

---

# 19. Before Starting Development

After cloning the project, a developer can follow this quick setup:

```bash
npm install
```

Create local environment file:

```bash
cp .env.example .env.local
```

Add the real shared Supabase Project URL and Publishable Key to:

```text
.env.local
```

Login:

```bash
npx supabase login
```

Link:

```bash
npx supabase link --project-ref mfyyduyaskzofbxswxvr
```

Check migrations:

```bash
npx supabase migration list
```

Check TypeScript:

```bash
npx tsc --noEmit
```

Then start Expo:

```bash
npx expo start
```

---

# 20. Quick Daily Workflow

Before starting work:

```bash
git checkout dev
git pull origin dev
```

Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

Install dependency updates if necessary:

```bash
npm install
```

Check database migration status:

```bash
npx supabase migration list
```

Develop the feature.

Before committing:

```bash
npx tsc --noEmit
```

Review:

```bash
git status
git diff
```

Stage only intended files.

Avoid blindly using:

```bash
git add .
```

when unrelated files may exist.

---

# 21. After Creating or Changing Database Tables

Run:

```bash
npx supabase db push --dry-run
```

Then, after review:

```bash
npx supabase db push
```

Regenerate TypeScript types:

```bash
npx supabase gen types typescript \
  --linked \
  --schema public \
  > types/database.types.ts
```

Then:

```bash
npx tsc --noEmit
```

Review everything before committing.

---

# 22. Shared Development Database Rules

The shared project:

```text
thikorben-dev
```

is a development database.

Developers should coordinate before:

```text
Dropping tables
Renaming important columns
Deleting data
Changing RLS policies
Changing authentication configuration
Running destructive SQL
Resetting the remote database
```

Never run destructive commands simply to fix a local development problem.

---

# 23. Current Project Structure

Relevant files:

```text
ThiKorben/
│
├── .env.example
├── .env.local                 # local only, never commit
│
├── lib/
│   └── supabase.ts
│
├── types/
│   └── database.types.ts
│
├── supabase/
│   ├── config.toml
│   ├── .gitignore
│   └── migrations/
│       ├── 20260919083301_remote_schema.sql
│       └── 20260919084344_enable_foundation_extensions.sql
│
├── package.json
└── package-lock.json
```

---

# 24. Important Commands

Check linked Supabase project:

```bash
npx supabase projects list
```

Check migrations:

```bash
npx supabase migration list
```

Create migration:

```bash
npx supabase migration new migration_name
```

Preview migration:

```bash
npx supabase db push --dry-run
```

Apply migration:

```bash
npx supabase db push
```

Generate database types:

```bash
npx supabase gen types typescript \
  --linked \
  --schema public \
  > types/database.types.ts
```

TypeScript check:

```bash
npx tsc --noEmit
```

Check Git:

```bash
git status
git diff
```

Start application:

```bash
npx expo start
```

---

# 25. Important Reminder

Use Git migrations as the source of truth for the database.

The expected workflow is:

```text
Migration SQL
      ↓
Git
      ↓
Shared Development Database
      ↓
Generated TypeScript Types
      ↓
Application Code
```

This keeps ThiKorben's database reproducible, reviewable, secure, and easier for the full team to maintain.

````

Ekhon easiest way:

```bash
mkdir -p docs
code docs/SUPABASE_SETUP.md
````

pura content paste kore `Ctrl + S`.

Tarpor verify:

```bash
git status --short --untracked-files=all
```

Ekhon expected files-er moddhe eta-o ashbe:

```text
?? docs/SUPABASE_SETUP.md
```

Eta hole Supabase foundation-ta teammate-friendly documentation-o peye jabe. Tarpor amader next kaaj hobe **selective staging kore final diff review**, then commit/push/PR.
