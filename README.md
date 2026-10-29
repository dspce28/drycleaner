# Aspen Cleaners website

React + Vite site for Aspen Cleaners, Ahmedabad. Animation is built with Framer Motion, and Lenis handles smooth scrolling.

```bash
npm install
npm run dev            # local dev server
npm run build          # production build -> dist/ (upload this folder to any static host)
npm run build:preview  # single self-contained HTML file -> dist-preview/
```

- Content (services, process steps, care guide, phone numbers, address) lives in `src/data.js`.
- Photos in `src/assets/` are frames from the studio walkthrough video, plus the garment from the launch poster.
- The pickup form does not need a backend. It writes the request into a WhatsApp message to +91 98249 22655.
