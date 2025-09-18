# Stellar Todo — static front-end + serverless AI proxy

This repository contains a single-page, feature‑rich to‑do app (static) and an optional serverless proxy (`/api/ai.js`) for safe OpenAI integration.

## Features (front-end)
- Add tasks with title, description, due date, priority, tags, subtasks.
- LocalStorage persistence.
- Search, filter by priority, sort.
- Drag-and-drop reordering (simple HTML5 implementation).
- Export / Import JSON.
- Dark mode + keyboard shortcuts.
- AI Assistant hooks (works with direct key or with the serverless proxy).

## Quick local test
1. Download the ZIP and unzip.
2. Open `index.html` in your browser (static features work immediately).
3. To enable AI using direct key (unsafe), paste your OpenAI key into the UI (not recommended for production).

## Deploying a public URL (recommended: Vercel)
1. Create a GitHub repo with these files (or push the contents).
2. Sign up at https://vercel.com and import the repo.
3. In Vercel dashboard, set Environment Variable `OPENAI_API_KEY` (for the serverless proxy to work).
4. Deploy — Vercel will provide a public URL (e.g., `https://stellar-todo-yourname.vercel.app`).

## Using the AI Assistant
- The front-end will POST to `/api/ai` (serverless function) if you switch to "Use serverless proxy" (recommended).
- The serverless function proxies your prompt to OpenAI using `OPENAI_API_KEY` set in deployment environment.

## Notes & extension ideas
- Replace the client-side call with a real backend that handles user authentication for multi-device sync.
- Add calendar integration, push notifications, recurring tasks, and offline sync using IndexedDB.
- Swap in a UI framework (React + Vite) for easier extension.

Enjoy — tweak and style the UI to match your portfolio. If you want, I can also (1) create a GitHub repo and push this code, or (2) create a Vercel-ready project and walk you through exact `git` + `vercel` CLI commands.
