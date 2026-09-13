# Google OAuth setup for Orbit

Orbit now supports Google login through `/api/auth/google/start` and `/api/auth/google/callback`. The implementation links returning Google users by `googleId`, falls back to matching email addresses, creates a database user on first login, and starts the same secure Orbit session used by the existing Manus auth flow.

## Google Cloud configuration

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Configure the OAuth consent screen. Use `External` while testing with personal accounts and add test users.
3. Create an OAuth Client ID with application type **Web application**.
4. Add the exact callback URL for each environment:

```text
https://YOUR_ORBIT_DOMAIN/api/auth/google/callback
```

For local development, use:

```text
http://localhost:3000/api/auth/google/callback
```

5. Add these server-side environment variables. Never expose the secret through a `VITE_` variable:

```text
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://YOUR_ORBIT_DOMAIN/api/auth/google/callback
```

The preview account panel already shows **Continue with Google**. Once the variables are present, it redirects to Google, links or creates the user, and sends first-time users to the Orbit onboarding flow.

## Database

`prisma/schema.prisma` defines `User`, `Course`, `Task`, and `TimetableEvent` models. The schema has already been synchronized against the configured TiDB database. For future environments run:

```bash
pnpm prisma:generate
pnpm prisma:push
```

TiDB Cloud requires the secure transport parameter used by `server/prisma.ts`.

## What is now persisted

Onboarding saves university, program, year, semester, target CGPA, attendance mandate, preferred study hours, and courses. AI task creation saves the parsed title, course relation, deadline, priority, duration, and rationale to the authenticated user’s task records. Task list queries are scoped to the current user.
