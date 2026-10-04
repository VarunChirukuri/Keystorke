# Keystroke

A focused typing-practice web app built with React, TypeScript, and Vite. It runs entirely in the browser and has no backend or database.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Choose a 15, 30, or 60 second test, then type the displayed passage. WPM and accuracy update as you go; restart at any time to try again.

## Production build

```sh
npm run build
npm run preview
```

The production site is the static `dist/` directory and can be hosted by any static file host. The runtime does not need an application server. The app uses no remote assets, API calls, or stored user data.