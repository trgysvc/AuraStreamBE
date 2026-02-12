# 🌊 AuraStream - The Software Factory for Sound

AuraStream is an elite, AI-driven audio ecosystem designed for both digital creators and commercial venues. Acting as the "Chief Architect" for sound, it combines a high-performance music catalog with autonomous project management and strategic audio processing.

## 🚀 All Features & Capabilities

### 1. Advanced Search & Discovery
*   **Hybrid Search Engine:** Combines Meilisearch (keyword/faceted) and pgvector (semantic) for lightning-fast results.
*   **Faceted Filtering:** Filter by BPM range, Mood, Genre, Instrument, and Vocal presence.
*   **AI Intent Search:** Natural language search like "uplifting music for a sunny coffee shop morning".
*   **Audio Similarity Engine:** "Find Similar" feature using vector cosine similarity to discover musically related tracks.
*   **Zero-Result AI Recovery:** Suggests alternative tracks when exact keyword matches aren't found.
*   **Context-Aware Suggestions:** Recommends tracks based on the time of day and venue timezone.

### 2. Aura Metadata Factory (Autonomous Analysis)
*   **Python-Powered Ingestion:** Automatic extraction of technical metadata using Librosa and Essentia.
*   **Technical Profiling:** Automatic detection of BPM, Musical Key (e.g., Cm, F#), and Duration.
*   **Vibe & Energy Analysis:** RMS Energy level calculation and AI-based mood tagging.
*   **Aura Score:** A proprietary popularity and quality scoring system for every asset.
*   **Cloud Processing:** Automated pipeline from S3 upload to database enrichment.

### 3. Professional Venue Player (B2B)
*   **Epidemic Sound Style UI:** Premium, high-performance dashboard for corporate environments.
*   **Scientific Audio Tuning:** Real-time 432Hz and 528Hz DSP frequency shifting.
*   **Venue Scheduling:** Visual calendar for automated energy level changes throughout the day.
*   **Offline Mode:** Robust playback support via IndexedDB and encrypted local storage.
*   **Multi-Zone Support:** Manage different playlists for different areas of a physical venue.
*   **Brand Voice Integration:** Insert custom audio branding and ads between tracks.

### 4. Creator Store & Licensing (B2C)
*   **Interactive Waveforms:** High-fidelity, mirrored waveform visualizations with hover-seek.
*   **License Wizard:** Dynamic PDF license generation for YouTube, Films, and Social Media.
*   **Stripe Checkout:** Secure global payment processing for single tracks or subscriptions.
*   **Elite Analytics:** Track playback stats and popular trends within the creator community.
*   **Library Management:** Personal folders for saved tracks and licensed assets.

### 5. Admin & Infrastructure
*   **QC Interface:** Dedicated dashboard for track approval and quality control.
*   **Real-time Sync:** Database webhooks automatically syncing Supabase changes to Meilisearch.
*   **Automatic Backup:** Multi-region S3 storage with versioning.
*   **Role-Based Access Control (RBAC):** Granular permissions for Admins, Venues, and Creators via Supabase RLS.

## 🛠 Complete Technology Stack

### Frontend Ecosystem
*   **[Next.js 14](https://nextjs.org/docs):** Server-Side Rendering & App Router.
*   **[React 18](https://react.dev/):** UI Component architecture.
*   **[Tailwind CSS 3.4](https://tailwindcss.com/docs):** Atomic CSS styling.
*   **[Lucide React](https://lucide.dev/docs):** SVG Icon system.
*   **[Framer Motion](https://www.framer.com/motion/):** Advanced UI animations.
*   **[React InstantSearch](https://www.meilisearch.com/docs/learn/relevance/instant_search):** Search UI hooks.

### Backend & Cloud Infrastructure
*   **[Supabase](https://supabase.com/docs):** Postgres Database, Auth, and Edge Functions.
*   **[pgvector](https://github.com/pgvector/pgvector):** Vector database for semantic search.
*   **[Amazon S3](https://docs.aws.amazon.com/s3/):** Binary object storage.
*   **[Amazon SQS](https://aws.amazon.com/sqs/):** Distributed job queue.
*   **[Meilisearch](https://www.meilisearch.com/docs):** Dedicated search engine.
*   **[Stripe API](https://docs.stripe.com/):** Subscription and payment logic.

### Audio Processing & AI
*   **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API):** Real-time DSP in the browser.
*   **[Librosa (Python 3.9)](https://librosa.org/):** Music and audio analysis library.
*   **[FFmpeg](https://ffmpeg.org/):** Audio transcoding and duration probing.
*   **[OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings):** Powering the semantic vector search.
*   **[Soundfile](https://pysoundfile.readthedocs.io/):** Python audio reading/writing.

### Dev Tools & Utilities
*   **[TypeScript](https://www.typescriptlang.org/):** Static type checking.
*   **[ESLint](https://eslint.org/):** Code linting.
*   **[Prettier](https://prettier.io/):** Code formatting.
*   **[PostCSS](https://postcss.org/):** CSS transformations.
*   **[Node.js 24](https://nodejs.org/):** Modern JavaScript runtime.

## 📈 Development Progress

See the [PROGRESS.md](./PROGRESS.md) file for a detailed roadmap.

---
*Built with strategic depth by Aura - Your Digital Twin.*
