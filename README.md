# SeforimTracker

SeforimTracker is a work-centric reading tracker for Jewish texts (seforim), designed as a bilingual, Hebrew-first alternative to Goodreads.

Unlike conventional book trackers, SeforimTracker is built around the realities of rabbinic literature: multiple editions, transliterations, Hebrew/English metadata, and variant titles.

This project was built as my full-stack bootcamp capstone and serves as a proof of concept for a domain-specific bibliographic system.

## Tech Stack
- Frontend: React, Redux
- Backend: Node.js, Express
- Authentication: JWT
- Database: Postgres

## Project Status
Bootcamp final project (MVP)

## Core Features
- JWT-based authentication
- Personal library management (want to read / reading / completed)
- User notes per sefer
- Readign log designed for classical Jewish texts
- Full-text search across English + Hebrew metadata
- Bilingual support (title, author, description fields)
- Normalized data model separating works from user library entries
- Deployed backend with CORS configuration and environment-based origin controls

## Architecture
### Frontend
- React (Vite)
- Redux Toolkit (slices + async thunks)
- TypeScript
- Client-side search + filtering

### Backend
- Node.js + Express
- TypeScript
- RESTful API design
- JWT authentication middleware
- Structured CORS origin handling
- Postgres relational schema

### Database Design
The schema separates:
- seforim (canonical works)
- users
- library_items (user-specific status + notes)

This normalized structure allows:
- Shared canonical works
- User-specific reading states
- Aliases for titles, authors in both English and Hebrew
- Future extensibility (editions, tagging)

## Future Roadmap
- Server-side search optimization
- Admin sefer creation UI
- Pagination and performance tuning
- Public user profiles
