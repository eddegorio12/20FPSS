# Progression Plan: Teacher Scheduling System

## Goal Overview
A centralized web application dedicated to easing the workflow between **Schedulers** (Admins) and **Teachers**. Schedulers log in, input schedule assignments, and the system automatically notifies Teachers by syncing these schedules directly to their **Google Calendar**.

---

## Phase 1: Foundation Setup (✅ Completed)
- Initialize Next.js 15+ (App Router) environment.
- Setup PostgreSQL database schema with Prisma ORM (Entities: User, Schedule, Section, Topic).
- Implement NextAuth.js (Auth.js v5) with Google OAuth for both Admins and Teachers.
- Configure Server stability (JWT Session Strategy, Prisma connection pool constraints).

## Phase 2: Core Scheduling & Automation (✅ Finalizing Now)
- Build the Scheduler Dashboard (`/admin/schedules`).
- Create a streamlined **"New Schedule" Form** prioritizing free-text input with autocomplete (no rigid dropdowns) to speed up scheduler data entry.
- Implement `findOrCreate` backend logic so Schedulers never have to pre-register Sections, Topics, or Teachers—the system creates them automatically.
- **Google Calendar Sync**:
  - Automatically generate Calendar Events upon schedule creation.
  - Add the assigned Teacher as an `attendee` so they immediately receive an email invite and calendar block.

## Phase 3: Teacher Experience (⏳ Next Step)
- Build out the **Teacher Dashboard** (`/teacher`).
- Allow teachers to view their upcoming read-only schedule in a clean UI format.
- Display the status of their Google Calendar sync.
- Provide Quick Links to Google Calendar or email for communication with the scheduler.

## Phase 4: Advanced Scheduler Tools (Upcoming)
- **Schedule Conflict Detection**: System warns the scheduler if a Teacher or Room is double-booked for the same time slot.
- **Data Management UI**: Build out the `/admin/taxonomy` and `/admin/teachers` pages so Schedulers can rename, merge, or delete misspelled sections/topics/teachers.
- **Edit & Delete Logic**: When a scheduler modifies or deletes a schedule, the system automatically updates or cancels the Google Calendar event for the corresponding teacher.

## Phase 5: Production & Deployment (Final)
- Configure a cloud PostgreSQL database (e.g., Supabase or Neon).
- Deploy the Next.js application to **Vercel**.
- Finalize Google Cloud Console OAuth Consent Screen (move from "Testing" to "Published") so all teachers can log in without "unverified app" warnings.

---
_Note: This plan aligns with the `PROJECT_HANDOVER.md` state file. If you ever clear the chat, share this Progression Plan and the Handover file with the new AI to instantly resume work._
