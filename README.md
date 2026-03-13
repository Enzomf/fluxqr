# FluxQR

Create QR codes that open WhatsApp and SMS with pre-filled messages — zero friction, zero accounts for scanners.

## Features

- QR code generation for WhatsApp and SMS with pre-filled messages
- Public freemium QR generation (phone-verified, usage-limited)
- Dashboard for managing QR codes (create, edit, deactivate, preview)
- Modal-based QR management with live slug availability check
- Real-time scan count tracking
- Phone verification via Twilio OTP (required for QR creation)
- Admin dashboard for user and QR management
- PWA support — installable, offline fallback page
- Scanner proxy page — zero auth, zero sidebar, minimal JS
- Google OAuth authentication
- Dark-only theme with Tailwind CSS v4

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase (PostgreSQL + RLS + Auth)
- Tailwind CSS v4 + shadcn/ui
- Serwist (PWA service worker)
- Vitest + Testing Library (unit tests)
- Twilio Verify API (phone OTP)
- Deployed on Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (see `CLAUDE.MD` for the full list of required env vars)
4. Start the development server: `pnpm dev`
5. Build for production: `pnpm build` (uses webpack — required by Serwist)
6. Run unit tests: `pnpm test`

## Project Structure

See `CLAUDE.MD` for the detailed directory structure, coding conventions, database schema, and environment variable reference.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Development server (Turbopack) |
| `pnpm build` | Production build (webpack, required for Serwist) |
| `pnpm test` | Run unit tests |
| `pnpm lint` | ESLint |
