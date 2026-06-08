# Professional Personal Portfolio

A premium, state-of-the-art developer portfolio built using Next.js 16 (App Router), styled with vanilla CSS, and integrated with a Firebase CMS. Deployed on Cloudflare Pages using the **OpenNext Cloudflare adapter** for server-side rendering (SSR) at the Edge.

---

## 🚀 Key Features

* **Edge SSR Integration**: Fully optimized for speed and dynamic content using Next.js 16 App Router on Cloudflare Pages.
* **Firebase CMS**: Dynamic content delivery powered by Firestore (Hero, Projects, Services, Contact, etc.) with secure Firebase Auth Admin Dashboard.
* **Stunning Design Aesthetics**: Harmonies of dark glassmorphism, HSL-tailored premium color palettes, subtle micro-animations, and custom transitions.
* **Polished UX**:
  * Complete removal of layout shifts (CLS) and screen flickering during React hydration.
  * Native smooth scroll spy navigation with IntersectionObserver.
  * Browser scrollbars hidden globally while fully preserving mouse-wheel, touch, trackpad, and keyboard scrolling.

---

## 🛠️ Technology Stack

* **Framework**: Next.js 16.0.3 (Turbopack)
* **Hosting / Runtime**: Cloudflare Pages + Cloudflare Workers (via OpenNext)
* **Adapter**: `@opennextjs/cloudflare`
* **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid)
* **Database & Authentication**: Firebase Firestore & Firebase Auth

---

## 💻 Local Development

### 1. Environment Configuration
Create a `.env.local` file at the root of the project and populate it with your Firebase config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Run the Development Server
Install dependencies and run Next.js locally:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ☁️ Production Build & Cloudflare Deployment

The application compiles into an Edge-compatible worker bundle using **OpenNext**. The build script automatically packages the server and generates a `_routes.json` file so that Cloudflare's CDN serves static assets directly while routing dynamic page requests to the Edge worker.

### 1. Build Commands
To build the project locally for Pages/Workers validation:

```bash
# Build the Next.js app and package it for Cloudflare Pages
npm run build && npm run pages:build
```

This generates:
* `.open-next/assets/_worker.js`: The routing worker.
* `.open-next/assets/_routes.json`: Instructs Cloudflare CDN to handle static files directly (improves page speed).

### 2. Cloudflare Pages Setup
When configuring the deployment dashboard in Cloudflare Pages:

1. **Build Command**: `npm run build && npm run pages:build`
2. **Build Output Directory**: `.open-next/assets`
3. **Compatibility Date**: Set to `2024-09-23` (or newer)
4. **Compatibility Flags**: Add `nodejs_compat`
5. **Environment Variables**: Make sure to add all your `NEXT_PUBLIC_FIREBASE_` environment variables directly into the Cloudflare Pages settings (Settings -> Environment variables -> Production & Preview).
