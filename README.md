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

## Project structure

```text
.
├── index.html
├── src/
│   ├── api/                 # Local persistence adapter for the exported Base44 flows
│   ├── components/          # Shared UI primitives and admin components
│   ├── lib/                # Site content and formatting helpers
│   ├── pages/               # Customiser, booking, and owner dashboard screens
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── base44/                  # Preserved entity schemas and server function export
├── docs/source-export.md    # Original source export from the repository
├── package.json
└── vite.config.js
```

The browser build uses local storage through `src/api/base44Client.js`, so the UI works without a backend during development. The preserved `base44/` files document the original entity and server-function contracts and can be connected to a hosted data service later.