# FamilyConnect — Roadmap / Backlog

Running list of features and improvements identified but not yet built.

## Not yet built
. 
- **Remaining Settings pages** — Privacy & Security, Notifications, Help & Support are still static buttons with no functionality.

- **Abandoned account cleanup** — optional: auto-delete accounts that never finish onboarding after some time period.

## Done

- Full auth (register, login, sessions, logout)
- Onboarding with profile fields (DOB validated against future dates)
- Family creation, invitations, member removal (including children)
- Real connected family tree hierarchy (parent-child relationships)
- Child profiles (no login/messaging, permission-gated creation)
- Live family group chat
- Change password, delete account
- Dashboard overview (stats, recent activity, quick actions)
- Full navy/green/amber styling pass across all pages
- Local network (phone) access via Next.js API proxy
- Stronger password requirements (frontend + backend validation)
- 1-to-1 direct messaging alongside family group chat
- Has been deployed to the internet
- Transfer admin role to another family member
- Message encryption done through encryption at rest
- Delete a family entirely (Admin-only, with full cleanup and confirmation)
- Profile photos (Cloudinary) — self-upload, plus admin/member uploads for children and ancestors, shown across all avatars



## Applications used
Hosting & Infrastructure

- Vercel — hosts and deploys the frontend (Next.js)
- Railway — hosts and deploys the backend (Express) and the PostgreSQL database
- GitHub — source code repository (itzdavis06/familyconnect), connected to both Vercel and Railway for automatic deployment on every push

Frontend

- Next.js (React framework) — pages, routing, server-side rendering
- TypeScript — typed JavaScript
- Tailwind CSS — styling

Backend

- Express — web server / API framework
- TypeScript
- Prisma — database ORM (talks to PostgreSQL)
- PostgreSQL — the actual database

Key libraries

- bcryptjs — password hashing
- jsonwebtoken (JWT) — session/login tokens
- cookie-parser — reading session cookies
- cors — cross-origin request handling
- Node's built-in crypto — message encryption at rest

About to add

Cloudinary — image hosting for profile pictures (since Railway's own storage doesn't persist files between deployments)