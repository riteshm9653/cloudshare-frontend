# Cloud Share Frontend

Production-ready frontend for the Cloud Share file-sharing platform, built with **Next.js + TypeScript**.

## Features

- Authentication pages (login and registration)
- File dashboard with:
  - Upload
  - Download
  - Rename
  - Delete
  - Share
- File search and filtering
- Storage usage view
- User profile page
- Responsive UI with reusable layout/components
- Loading states, error handling, and toast notifications
- Environment-based backend API configuration (Spring Boot compatible)

## Tech Stack

- Next.js (App Router)
- TypeScript
- React
- CSS (modular reusable style classes)

## Project Structure

- `src/app` - route pages (`/`, `/login`, `/register`, `/profile`)
- `src/components` - reusable UI/layout components
- `src/lib` - API + auth helpers
- `src/types` - shared TypeScript types

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your backend URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

3. Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build and Run (Production)

```bash
npm run build
npm run start
```

## Backend Integration Notes

The frontend expects the following backend routes (base: `NEXT_PUBLIC_API_BASE_URL`):

- `POST /auth/login`
- `POST /auth/register`
- `GET /users/me`
- `GET /files`
- `GET /files/storage/usage`
- `POST /files/upload`
- `DELETE /files/:id`
- `PATCH /files/:id/rename`
- `POST /files/:id/share`
- `GET /files/:id/download`

These endpoints are designed to map cleanly to a Spring Boot backend.
