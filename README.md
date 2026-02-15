# 🌊 SONARAURA - The AI-Driven Audio Ecosystem

SONARAURA is an elite, AI-driven audio ecosystem designed for both digital creators and commercial venues. Acting as the "Chief Architect" for sound, it combines a high-performance music catalog with autonomous project management and strategic audio processing.

---

## 🚀 Project Overview

SONARAURA goes beyond traditional streaming. It leverages **Frequency Engineering**, **Weather-Aware AI**, and **Signal-Level Steganography** to provide a scientifically optimized and legally secure audio environment.

### 💎 Unique Value Propositions (USP)
- **Frekans Mühendisliği:** Dynamic, real-time shifting between 440Hz, 432Hz (Healing), and 528Hz (Awakening) with BPM preservation.
- **Aura Karaoke Engine:** Word-level synchronized lyrics with real-time highlighting (Glow/Scale effect) for a premium singing experience.
- **Interactive Waveforms:** Animated discovery lists where each track's waveform reacts to playback with click-to-seek functionality.
- **Weather-Aware AI:** Automatic atmosphere adjustment based on live GPS location and weather data (e.g., rain triggers calming 432Hz flow).
- **Smart Flow:** Autonomous music director for B2B venues with visual 24h schedule management.
- **Steganographic Watermarking:** Signal-level UUID embedding (LSB V1) for bulletproof copyright protection and traceablity.
- **YouTube Dispute Center:** Instant legal claim resolution for creators with automated, license-backed evidence generation.
- **Elite Analytics (ROI Layer):** Strategic search and interaction telemetry for infrastructure ROI and production gap analysis.
- **Churn Prediction Heartbeat:** Intelligent monitoring of user session health to proactively manage retention.
- **Ingest Engine:** Bulk upload with autonomous metadata extraction (ID3, BPM, Key, Lyrics, Cover Art).

---

## 🛠️ Technical Stack & Frameworks

### Core Architecture
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, RSC)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Vanilla Tailwind CSS 3.4
- **State Management:** Zustand & React Context API

### Backend & Cloud Infrastructure
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, RLS, Edge Functions, pgvector)
- **Storage:** [AWS S3](https://aws.amazon.com/s3/) (Automated post-process purge to optimize storage costs)
- **Compute:** AWS Lambda & **JIT Cloud Renderer** (Just-In-Time high-fidelity audio rendering on demand)
- **Queue System:** AWS SQS (Job orchestration for sonic analysis and JIT triggers)
- **CDN:** AWS CloudFront (Secure delivery with 3600s Signed URLs)

### Audio & AI Processing
- **Audio Engine:** Web Audio API (Auto-play, Shuffle, Repeat, Mute, Volume, Real-time Visualizer)
- **Analysis:** Python (Librosa + SciPy) for BPM, Key, Energy, and Waveform extraction
- **Karaoke System:** JSON-based Word-Level Timeline parser
- **Steganography:** Custom LSB (Least Significant Bit) encoding for digital signatures
- **Search:** [Meilisearch](https://www.meilisearch.com/) (Hybrid Vector + Keyword Search with deep taxonomy)

---

```text
/src
├── app/         # Admin, Creator, Venue dashboards and SSR flows
├── components/  # Shared Atomic UI & Feature modules
├── context/     # Global State (Player, Smart Flow, Location)
├── lib/         # Core logic and service wrappers
└── types/       # TypeScript Schema & Admin Definitions
```

---

## 📖 Internal Documentation

1.  **[Project Vision](./docs/1_PROJECT_VISION.md):** The "Digital Twin" strategy.
2.  **[Technical Specs](./docs/2_TECH_SPEC.md):** Database normalization, RLS, and **Automation Scripts Reference**.
3.  **[Design System](./docs/3_DESIGN_SYSTEM.md):** Sonaraura Premium Dark UI principles.
4.  **[Progress Tracker](./PROGRESS.md):** Live feature roadmap status.
5.  **[Ad Copy](./ADVERT.md):** Marketing USPs and technical advantages.

---

🌊 **SONARAURA: The Architecture of Intelligence in Sound.**
