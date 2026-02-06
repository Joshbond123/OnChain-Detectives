# Replit Agent Guide

## Overview

This is a landing page website for **OnChain Detectives**, a cryptocurrency asset recovery and blockchain forensics service. It's a full-stack TypeScript application with a React frontend and Express backend. The site features a single-page marketing layout with sections for services, process, FAQ, and a contact inquiry form that saves submissions to a PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses a three-directory monorepo pattern:
- **`client/`** — React SPA frontend
- **`server/`** — Express API backend
- **`shared/`** — Code shared between client and server (schema, route definitions)

### Frontend (`client/src/`)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Animations**: Framer Motion for scroll reveals and interactions
- **Forms**: React Hook Form with Zod validation via `@hookform/resolvers`
- **Styling**: Tailwind CSS with CSS custom properties for theming (dark theme by default — deep obsidian with electric blue/teal accents)
- **Fonts**: Space Grotesk (display), Plus Jakarta Sans (body), loaded via CSS custom properties `--font-display` and `--font-body`
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (`server/`)
- **Framework**: Express 5 on Node.js, wrapped in a standard HTTP server
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Route Definitions**: Centralized in `shared/routes.ts` — defines paths, HTTP methods, input schemas, and response schemas. Both client and server import from here for type safety.
- **Development**: Vite dev server middleware with HMR served through the Express server
- **Production**: Client built to `dist/public/`, server bundled with esbuild to `dist/index.cjs`

### Database
- **Database**: PostgreSQL (required, via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` — single source of truth for both DB schema and Zod validation schemas
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization
- **Connection**: `pg` Pool in `server/db.ts`

### Current Schema
- **`inquiries`** table: `id` (serial PK), `name` (text), `contactInfo` (text — email or phone), `message` (text), `createdAt` (timestamp)

### API Endpoints
- **`POST /api/inquiries`** — Creates a new inquiry. Input validated with Zod. Returns 201 with the created inquiry or 400 for validation errors.

### Storage Layer
- `server/storage.ts` defines an `IStorage` interface with a `DatabaseStorage` implementation. This pattern allows swapping storage backends if needed.

### Build System
- **Dev**: `tsx server/index.ts` — runs the Express server which sets up Vite middleware for the frontend
- **Build**: Custom `script/build.ts` that runs Vite build for client and esbuild for server, with selective bundling of server dependencies
- **Production**: `node dist/index.cjs` serves static files from `dist/public/`

## External Dependencies

### Required Services
- **PostgreSQL**: Required. Must set `DATABASE_URL` environment variable. Used for storing inquiry form submissions.

### Key NPM Packages
- **UI**: Full shadcn/ui component library (Radix UI primitives, Tailwind CSS, class-variance-authority, lucide-react icons)
- **Animation**: framer-motion
- **Data**: @tanstack/react-query, drizzle-orm, drizzle-zod, pg
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **Routing**: wouter (client), express (server)
- **Build Tools**: vite, esbuild, tsx, typescript

### Third-Party Integrations
- **WhatsApp**: Floating WhatsApp button linking to `wa.me/15550123456` (placeholder number)
- **Google Fonts**: Space Grotesk, Plus Jakarta Sans, DM Sans, Fira Code, Geist Mono, Architects Daughter (loaded via Google Fonts CDN)
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner (development only)