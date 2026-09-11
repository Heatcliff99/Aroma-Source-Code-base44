# Aroma Flowers Corner

Production-ready Vite + React storefront for composing bespoke flowers, collecting bookings, and managing shop inventory.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
npm run preview
```

## Deploy to Vercel

Import `https://github.com/Heatcliff99/Aroma-Source-Code` into Vercel. The repository includes `vercel.json`, so Vercel will install with `npm ci`, run `npm run build`, and serve the generated `dist/` directory.

## Project structure

```text
.
├── index.html
├── src/
│   ├── api/                 # Local persistence and submission adapter
│   ├── components/          # Shared UI primitives and admin components
│   ├── lib/                # Site content and formatting helpers
│   ├── pages/               # Customiser, booking, and owner dashboard screens
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

The browser build uses local storage through `src/api/store.js`, so the UI works without a backend during development. The adapter exposes neutral entity, upload, and submission methods that can be replaced with a hosted API without changing the page components.