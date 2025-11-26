# NewsFlow — News Dashboard & API

NewsFlow is a full-stack Next.js application that provides a global news aggregator with a dashboard and a developer-friendly API. It supports Firebase authentication, Firestore-backed storage for articles, usage/reporting from API keys, and a minimal news scraping utility.

---

## Key Features

- User dashboard with authentication (Firebase Auth) and article viewing
- API key management UI for creating and revoking keys
- API endpoints for fetching and searching news
- Per-key rate limiting and usage logs
- Firestore-backed storage of news articles (scrape or ingest via scripts)
- Admin CLI Python scripts to manage keys and scrape feeds
- Ready for local development and Vercel-style deployments

---

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Firebase (Auth, Firestore) & firebase-admin (server-side)
- Tailwind CSS + Radix UI + custom components
- Python scripts for scraping and Firebase admin utilities

---

## Quick Start (Local Development)

1. Install dependencies with your package manager (pnpm recommended):

```powershell
# Using pnpm
pnpm install
pnpm dev

# or using npm
npm install
npm run dev
```

2. Open your browser to `http://localhost:3000`.

3. Login/Sign up via the Firebase authentication UI at `/login` to access the dashboard.

---

## Environment Variables

Create a `.env.local` file in the project root with these variables (example values):

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"

# The server-side service account JSON as a string (stringified JSON) for firebase-admin
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

Notes:
- The `FIREBASE_SERVICE_ACCOUNT_KEY` needs to be a single-quoted JSON string in `.env.local` (the app reads it and calls `JSON.parse`).
- Never commit your private keys or secrets to your repository.

---

## Python Scripts (Utilities)

There are a couple of helpful Python utilities under `scripts/`:

- `scripts/news_scraper.py` — CLI RSS scraper to fetch news and output JSON.
- `scripts/firebase_manager.py` — CLI utility to manage Firebase API keys (create_key, revoke_key, validate_key, list_keys, usage_stats).

Install required Python packages (if you want to run the scripts locally):

```powershell
python -m venv venv
venv\Scripts\Activate
pip install feedparser python-dateutil
```

Examples:

```powershell
# Scrape tech news from the US and save to a file
python scripts/news_scraper.py --country us --category technology --limit 50 --output out.json

# Create an API key in Firestore (requires FIREBASE_SERVICE_ACCOUNT_KEY)
python scripts/firebase_manager.py --action create_key --user-id user-uid --email user@example.com --name "Demo Key" --expires 365 --rate-limit 1000

# Get usage statistics for an API key
python scripts/firebase_manager.py --action usage_stats --key-id YOUR_KEY_ID
```

---

## Project Structure (Overview)

This is a brief overview of the important folders and files:

- `app/` — Next.js App Router pages, API routes, and layouts
  - `app/api` — Server API routes (news endpoints, key management)
  - `app/login` — Login page
  - `app/api-keys` — Dashboard page for API keys management
- `components/` — React UI components used by the app
- `lib/` — Backend helpers (Firebase, scraping, API key manager, types)
- `contexts/` — Authentication provider and hooks
- `scripts/` — CLI utilities for scraping and Firebase management (Python)
- `public/` — Static assets

---

## Helpful Commands

```powershell
# Development
pnpm dev
pnpm build
pnpm start

# Lint
pnpm lint

# Python utilities (example)
python scripts/news_scraper.py --help
python scripts/firebase_manager.py --help
```

---

## API Endpoints (Summary)

The API routes are under `app/api`. Most endpoints return JSON in the format below:

```json
{ "success": true|false, "data": {...}, "meta": {...} }
```

1) GET /api/news
- Purpose: Fetch news articles with optional filters.
- Optional query params: `country`, `category`, `language` (default `en`), `q` or `search`, `from`, `to`, `source`.
- Authentication: Provide `x-api-key` header with a valid API key or add `x-internal-request: true` header for internal dashboard calls.

Example cURL:

```bash
curl -X GET "http://localhost:3000/api/news?country=us&category=technology" \
  -H "x-api-key: YOUR_API_KEY"
```

2) GET /api/news/search
- Purpose: Full-text search across articles.
- Required query param: `q`.
- Optional: `country`, `category`, `from`, `to`.

3) GET /api/news/categories
- Purpose: Returns available categories, countries, and languages.

4) API Key Management: `/api/keys`
- POST `/api/keys` — Create a new API key (body: `userId`, `userEmail`, `name`, optional `description`, `expiresInDays`, `rateLimit`)
- GET `/api/keys?userId={userId}` — List keys for a user
- DELETE `/api/keys?keyId={id}&action=revoke|delete` — Revoke or delete a key
- GET `/api/keys/usage?apiKeyId={id}` — Get usage logs for a key

---

## Security Notes

- API keys are hashed with SHA-256 and stored as `keyHash` in Firestore. The raw key is only returned once on creation and must be stored by the user.
- Rate limiting is implemented per key; consider an upgrade for better day-based/rolling window enforcement for production.
- Restrict Firebase security rules and Cloud Functions (if used) to protect Firestore access.
- In production, store secrets using your hosting provider's secret manager (Vercel/Netlify/Azure Key Vault, etc.).

---

## Testing & Debugging

- The app uses `next dev` for local development.
- To test CLI scripts, run the Python scripts directly (requires `FIREBASE_SERVICE_ACCOUNT_KEY` env var or `service_account.json` path for `firebase_manager.py`).

---

## Deployment

- Vercel is a natural fit (Next.js), but any provider that supports Node/Next.js will work.
- Make sure to set the runtime environment variables on the hosting provider.
- For server-side Firebase admin usage, make sure `FIREBASE_SERVICE_ACCOUNT_KEY` (stringified JSON) is set as a secret.

---

## Contributing

- Bug reports and PRs are welcome — please follow standard GitHub PR workflow.
- If you'd like to propose a feature or discuss architecture changes, open an issue first.

---

## Contact

If you have questions or want assistance, create a GitHub issue or reach out to me.

---

Happy Coding!
