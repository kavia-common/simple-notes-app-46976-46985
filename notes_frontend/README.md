# Ocean Notes (Slidev)

An interactive, local-first notes app built with Slidev + Vue 3.

## Run locally
- Install: `pnpm install` (or `npm install`)
- Dev: `pnpm dev` (or `npm run dev`)
- Open: http://localhost:3000

The app renders on the first slide, providing a sidebar with search and a right pane editor with basic markdown preview. Notes persist in `localStorage`.

## Features
- Create, edit, delete notes
- Search title and content
- Sort by last updated (desc)
- Basic markdown preview
- Keyboard: N (new), Ctrl/Cmd+S (save in editor UI)
- Smooth transitions, rounded corners, subtle shadows

## Environment variables
This app does not require a backend. It will ignore `VITE_*` URLs if present or empty. No additional env vars are needed; defaults are safe.

## Accessibility
Buttons include aria-labels and focus styles. Inputs use focus ring for visibility.

Learn more about Slidev at the [documentation](https://sli.dev/).
