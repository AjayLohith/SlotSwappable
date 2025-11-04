# SlotSwapper

SlotSwapper is a peer-to-peer time-slot scheduling application. Users mark busy events as swappable, browse others' swappable slots, and request swaps. Accepting a request swaps ownership of the two events.

## Tech
- Frontend: React (Vite, JS), React Router, React Query, Axios, Zustand
- Backend: Node.js + Express (ESM), MongoDB (Mongoose), JWT auth, CORS, dotenv

## Features
- JWT authentication (signup/login)
- Events CRUD (title, startTime, endTime, status: BUSY/SWAPPABLE/SWAP_PENDING)
- Marketplace of other users' swappable slots
- Swap requests with accept/reject; on accept, owners are exchanged, statuses set to BUSY
- Minimal UI with light theme and Space Grotesk typography
- Calendar day picker for creating and filtering events by day; separate time inputs

## Quick Start

### Prereqs
- Node 18+
- MongoDB (Atlas URI recommended)

### Backend
```
cd backend
npm install
```
Create `.env`:
```
PORT=4000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=change_me
CLIENT_ORIGIN=http://localhost:5173
```
Run:
```
npm run dev
```
Health check: `http://localhost:4000/api/health`

### Frontend
```
cd ../frontend
npm install
```
Create `.env`:
```
VITE_API_URL=http://localhost:4000/api
```
Run:
```
npm run dev
```
Open `http://localhost:5173`.

## API Endpoints
- Auth
  - POST `/api/auth/signup` { name, email, password }
  - POST `/api/auth/login` { email, password }
- Events (auth required)
  - GET `/api/events`
  - POST `/api/events` { title, startTime, endTime }
  - PATCH `/api/events/:id` { title?, startTime?, endTime?, status? }
  - DELETE `/api/events/:id`
- Swap (auth required)
  - GET `/api/swappable-slots`
  - POST `/api/swap-request` { mySlotId, theirSlotId }
  - GET `/api/swap-requests` (incoming/outgoing)
  - POST `/api/swap-response/:id` { accept: boolean }

## Assumptions
- Event overlap validation is out of scope for this challenge
- SWAP_PENDING blocks events from multiple concurrent swaps until resolved
- Simplified error handling and logging for clarity

## Docker (Backend)
Build and run the backend with Docker:
```
cd backend
# create a production .env or pass env vars at run
docker build -t slotswapper-backend .
docker run --name slotswapper-api -p 4000:4000 --env-file .env slotswapper-backend
```

`.env` must include at least `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`.

## Design Choices
- Split swap into request/response to keep transactional logic server-side
- Ownership swap performed atomically with a Mongo session
- React Query for simple cache invalidation and instant UI updates

## Notes
- Do not commit `.env` files. Use environment variables in CI/CD.


