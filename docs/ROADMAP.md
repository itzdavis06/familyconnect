# FamilyConnect — Roadmap / Backlog

Running list of features and improvements identified but not yet built.

## Not yet built

- **Profile pictures** — let users upload a photo for their profile instead of initials.
  - Decision needed: simple disk storage (quick, but won't survive deployment/redeploys) vs. cloud storage like Cloudinary/S3 (more setup, durable long-term).

- **Real message encryption** — messages are currently stored as plain text in the database.
- 
- **Remaining Settings pages** — Privacy & Security, Notifications, Help & Support are still static buttons with no functionality.
- **Transfer admin role** — currently an Admin can't remove themselves from a family; no way to hand off admin to someone else first.
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