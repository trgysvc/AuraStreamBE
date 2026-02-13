# 🌊 Sonaraura - The AI-Driven Audio Ecosystem

Sonaraura is an elite, AI-driven audio ecosystem designed for both digital creators and commercial venues. Acting as the "Chief Architect" for sound, it combines a high-performance music catalog with autonomous project management and strategic audio processing.

---

## 🚀 Project Overview

Sonaraura goes beyond traditional streaming. It leverages **Frequency Engineering** and **Weather-Aware AI** to scientifically optimize environments. Whether it's a high-end commercial venue seeking the perfect biorhythm-aligned atmosphere or a creator needing bulletproof copyright protection, Sonaraura provides a unified, intelligent solution.

### 💎 Unique Value Propositions (USP)
- **Frekans Mühendisliği:** Real-time shifting between 440Hz, 432Hz (Healing), and 528Hz (Awakening).
- **Weather-Aware AI:** Automatic atmosphere adjustment based on live local weather data (e.g., rain triggers calming frequencies).
- **Smart Flow:** Otonom music director that manages venue transitions (Morning -> Evening) without human intervention.
- **YouTube Dispute Center:** Instant legal claim resolution with automated license verification.

---

## 🛠️ Technical Stack & Frameworks

### Core Architecture
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, RSC)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Vanilla Tailwind CSS 3.4
- **State Management:** Zustand & React Context API

### Backend & Cloud Infrastructure
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, RLS, Edge Functions)
- **Storage:** [AWS S3](https://aws.amazon.com/s3/) (Raw ingest, processed assets, CDN public storage)
- **Compute:** AWS Lambda (Audio processing) & Node.js Server Actions
- **Queue System:** AWS SQS (Job orchestration for audio analysis)
- **CDN:** AWS CloudFront (Secure delivery with Signed URLs)

### Audio & AI Processing
- **Audio Engine:** Web Audio API (Client-side DSP, visualization, and crossfading)
- **Analysis:** Python (Librosa) for BPM, Key, and Energy extraction
- **Processing:** FFmpeg (Transcoding, Normalization -14 LUFS, Metadata Watermarking)
- **Search:** [Meilisearch](https://www.meilisearch.com/) (Hybrid Vector + Keyword Search)

---

## 📦 Key Packages & Dependencies

### Frontend UI/UX
- `lucide-react`: Modern icon set
- `framer-motion`: High-performance animations
- `clsx` & `tailwind-merge`: Dynamic styling utilities

### Audio & Visualization
- `music-tempo`: Client-side BPM detection during upload
- `waveform-data`: Advanced amplitude mapping
- `canvas`: Real-time frequency spectrum visualizer

### Utilities & Services
- `@supabase/ssr`: Secure server-side supabase integration
- `stripe`: Global payment and subscription orchestration
- `pdf-lib`: Dynamic PDF license generation
- `qrcode`: Verification link generation for certificates

---

## 📂 Project Structure

```text
/src
├── app/
│   ├── (admin)/         # Admin Factory (QC, User Intel, Catalog, Requests)
│   ├── (auth)/          # Authentication Flow (Login, Signup)
│   ├── (creator)/       # B2C Store and Personal Library
│   ├── (venue)/         # B2B Dashboard and Smart Flow Management
│   ├── account/         # User & Business Settings
│   └── api/             # Backend Webhooks (Stripe, SQS)
├── components/          # Shared Component Library
│   ├── dashboard/       # Internal layout components
│   ├── feature/         # Feature-specific modules (Player, Licensing)
│   └── shared/          # Atomic UI components (Buttons, Inputs)
├── context/             # Global Context (Player, Smart Flow)
├── lib/                 # Core logic and service wrappers
│   ├── audio/           # Web Audio API Engine
│   ├── logic/           # Biorhythm & Cache Management
│   └── services/        # Third-party integrations (S3, Weather)
└── types/               # TypeScript Schema & Definitions
```

---

## 📖 Internal Documentation

Detailed technical and strategic guides can be found in the `/docs` folder:
1.  **[Project Vision](./docs/1_PROJECT_VISION.md):** Deep dive into the "Digital Twin" concept and business model.
2.  **[Technical Specs](./docs/2_TECH_SPEC.md):** Infrastructure, database schema, and RLS policies.
3.  **[Design System](./docs/3_DESIGN_SYSTEM.md):** UI/UX principles, typography, and premium aesthetic guidelines.
4.  **[Progress Tracker](./PROGRESS.md):** Live status of features and roadmap phases.
5.  **[Ad Copy](./ADVERT.md):** Marketing highlights and unique selling points.

---

## ⚙️ Environment Configuration

To run Sonaraura locally or in production, the following keys are required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
- `STRIPE_SECRET_KEY`
- `MEILISEARCH_HOST` / `MEILISEARCH_API_KEY`

---

## 🏛️ Development Philosophy
**Sonaraura** operates as a **"Software Factory"**. Every code change must respect the core architecture: No ORMs (Native Supabase only), High-Fidelity Audio Standards, and AI-First workflow.

🌊 **Sonaraura: The Future of Sound.**
