# Teacher Scheduling System - Project State & Handover

## Overview
This document serves as the persistent state for the Teacher Scheduling System. If a new AI session or chat is started, **read this file first** to understand the project architecture, goals, and current progress.

## Business Goal
To build a web-based scheduling application where an Admin (scheduler) can assign class schedules to Teachers. When a schedule is created, it automatically triggers a Google Calendar invite to the assigned Teacher's email address.

## Technology Stack
- **Framework**: Next.js 15+ (App Router, Turbopack)
- **Database**: PostgreSQL (via internal/external URL)
- **ORM**: Prisma (v7+ with `@prisma/adapter-pg` and `pg.Pool` for better connection management)
- **Authentication**: NextAuth.js (Auth.js v5) with Google Provider
- **Integrations**: Google Calendar API (googleapis) for syncing events

## Core Architecture Decisions
1. **Authentication Strategy**: We use the **JWT** session strategy instead of the database strategy. This prevents the system from doing a DB lookup on every single page load, which previously caused `pg.Pool` connection exhaustion and timeouts during the Next.js dev server hot-reloads.
2. **Database Connection**: We strictly define `connection_limit=5` in the `DATABASE_URL` and `max: 5` in `src/lib/prisma.ts` to prevent overwhelming the local Prisma Dev Proxy.
3. **Writable Inputs**: For Schedule Creation (`/admin/schedules/new`), the inputs for Teacher Email, Section Name, and Topic Name are **free-text `<input>` fields** with `<datalist>` autocomplete suggestions. The user specifically requested *not* to use strict dropdowns.
4. **Auto-Creation API (`findOrCreate`)**: The `POST /api/schedules` endpoint accepts strings (not IDs). It queries the database for matching names/emails and automatically creates the Teacher, Section, or Topic if they do not exist.
5. **Google Calendar Sync**:
   - Authorized via the Admin's Google OAuth token (requested during login).
   - Events are created on the Admin's calendar, but the Teacher is added as an `attendee`, triggering an email invitation to their inbox.
   - Timezones are explicit (`Asia/Manila` defaults, removing raw 'Z' UTC markers on creation).

## Current Status & Completed Testing Letdown
As of March 2026, the following issues have been resolved:
- **[FIXED] Prisma Connection Timeouts**: Transitioned from concurrent `Promise.all` DB queries to sequential queries where possible, aligned connection pool limits, and switched NextAuth to JWT.
- **[FIXED] Next.js Typescript Errors ("4 Issues" Dev Overlay)**: Added `src/types/next-auth.d.ts` to type the extended JWT token (`token.id`, `token.role`), removed `@ts-ignore` comments, and updated route handlers (`/api/schedules/[id]`) to correctly `await params` as required by Next.js 15+.
- **[FIXED] 404 Pages**: Added placeholder UI for taxonomy and teacher admin pages.

**Current State**: The system compiles cleanly with 0 TypeScript errors. The dev server boots cleanly on port 3000.

## How to Test End-to-End
1. **Terminals**: Ensure two processes are running:
   - `npx prisma dev` (Must be running for DB proxy, default ports 51213-51215)
   - `npm run dev` (Next.js server on port 3000)
2. **Login**: Go to `http://localhost:3000`. Click "Sign in with Google" and authenticate. The page will redirect to the Admin Dashboard (`/admin`).
3. **Create Schedule**: Navigate to `/admin/schedules/new`. 
4. **Verify Calendar**: After submit, check the sync status in the table (should say `SYNCED`). Open Google Calendar to verify the event exists.

## Future / Pending Work
- fully implement the UI for managing Sections, Topics, and Teachers directly, rather than just the placeholders.
- add pagination to the Schedules table if the data grows too large.
