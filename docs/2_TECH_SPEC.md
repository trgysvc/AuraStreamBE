# Sonaraura v3.6 Technical Specifications
**Reference:** Sonaraura Implementation Plan.pdf

## 1. Architecture Overview
**Project:** Sonaraura v3.4 (Enterprise Grade)
**Stack:** Next.js 14 Monorepo, Supabase (Normalized), AWS SQS/Lambda, Web Audio API

### Critical Architecture Decisions
**ORM Prohibition (No-Prisma Rule):**
*   **Decision:** NO ORM tools (Prisma, Drizzle, etc.) allowed.
*   **Reason:** Cold Start issues in serverless, risk of bypassing Supabase RLS.
*   **Standard:** Native Supabase Client (`@supabase/ssr`) only. TypeScript types generated via `supabase gen types`.

### 1.1 Project Structure (Monorepo)
```
/src
├── app/
│   ├── (auth)/          # Login, Signup
│   ├── (venue)/         # B2B App (Player, Schedule, Legal) Next.js PWA
│   ├── (creator)/       # B2C App (Store, Library, Dispute Center) Next.js
│   ├── (admin)/         # Admin (QC, Upload, Analytics) Next.js
│   └── api/             # Backend Routes
│       ├── queue/       # SQS Job Triggers
│       ├── webhooks/    # Suno/Stripe Callbacks
│       ├── stream/      # Signed URL Generator
│       ├── search/      # Meilisearch Proxy & Analytics
│       └── health/      # System Status Check
├── components/          # Shared Components
│   ├── player/
│   ├── venue/
│   └── shared/
├── lib/
│   ├── audio/           # Audio Engine (Web Audio API)
│   ├── queue/           # AWS SQS Client
│   ├── services/        # S3, Suno, PDF Service
│   ├── logic/           # OfflineManager (IndexedDB)
│   ├── search/          # Meilisearch Client
│   └── monitoring/      # Sentry
└── packages/            # Shared Packages (if using TurboRepo structure)
```

## 2. Database Schema (Normalized)
**Rule:** No lazy JSONB unless specified. Strict normalization.

### 2.1 Core Tables
*   **profiles:** `id` (PK, references auth.users), `role` (venue, creator, admin), `subscription_tier`, `stripe_customer_id`, `email`.
*   **venues:** `id` (PK), `owner_id` (FK profiles), `business_name`, `address` (structured), `verification_status`.
*   **tracks:**
    *   `id` (UUID, PK)
    *   `title`, `bpm`, `duration_sec`, `is_instrumental`
    *   `status` (enum: pending_qc, processing, active, rejected)
    *   `ai_metadata` (JSONB: Prompt, Model, Seed - for legal audit)
    *   `popularity_score` (0-1 float)
    *   `created_at`, `updated_at`
*   **track_files:**
    *   `id` (PK), `track_id` (FK tracks)
    *   `file_type` (enum: raw, stream_aac, stream_flac)
    *   `tuning` (enum: 440hz, 432hz)
    *   `s3_key`, `lufs_value`
*   **track_reviews:** `track_id`, `reviewer_id`, `decision`, `notes`, `reviewed_at`.
*   **licenses:**
    *   `id` (PK), `license_key` (QR Hash)
    *   `user_id` (FK profiles), `track_id` (FK tracks)
    *   `project_name`, `usage_type`
    *   `watermark_hash` (Steganographic signature)
    *   `created_at`, `expires_at`
*   **playback_sessions:** `venue_id`, `track_id`, `played_at`, `duration_listened`, `skipped`.
*   **custom_requests:** `id`, `user_id`, `status` (pending, processing, review, completed), `specs` (JSONB), `delivery_track_id`, `price_paid`.
*   **saved_searches:** `id`, `user_id`, `name`, `query_params` (JSONB), `notify_on_match`.
*   **search_logs:** `id`, `query_text`, `filters_used` (JSONB), `result_count`, `latency_ms`.

### 2.2 RLS Policies (Critical)
*   **Profiles:** Users view own; Admins view all.
*   **Tracks:** Public view 'active'; Creators view own; Admins view all.
*   **Venues:** Owners view own; Admins view all.
*   **Licenses:** Users view own; Service role manages updates.

## 3. Infrastructure & Services
### 3.1 Search Engine (Meilisearch)
*   **Index:** `tracks_production`
*   **Searchable:** title, genre, mood_tags, instruments
*   **Filterable:** bpm (range), duration, key, tuning, is_instrumental
*   **Sync:** Real-time via Supabase webhooks -> Sync Service.

### 3.2 File Storage (S3)
*   **Raw Bucket:** Encrypted, Admin only (Uploads/Suno output).
*   **Processed Bucket:** Transcoded assets, private.
*   **Public/CDN:** CloudFront protected access (Signed URLs).

### 3.3 Audio Processing (AWS Lambda/FFmpeg/Python)
*   **Pipeline:** Norm (-14 LUFS) -> Transcode (AAC/FLAC) -> Freq Shift (432Hz) -> Watermark.
*   **High-Fidelity Tuning (Rubber Band Library):**
    *   **Algorithm:** Professional-grade "Time-Stretching/Pitch-Shifting" using the Rubber Band Library.
    *   **Key Feature:** **Transient-Aware Processing.** Unlike standard Phase Vocoders, this preserves the sharp attacks of percussion (drums) and the natural phase of vocals while shifting the frequency.
    *   **BPM Integrity:** Tuning changes (432Hz/528Hz) are performed with 0% change in tempo or duration, ensuring the venue's Energy Curve remains mathematically consistent across all frequencies.
    *   **Targets:** 
        - 432Hz: -31.76 cents (Peace/Bio-sync)
        - 528Hz: +4 cents (Vitality/Regeneration)
    *   **Storage:** Processed masters are stored as separate assets in S3 (`processed/{id}/432hz.wav`, `processed/{id}/528hz.wav`) to avoid real-time CPU overhead in the browser.

## 4. Environment Variables
(See Implementation Plan PDF for full list)
*   **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
*   **Meilisearch:** `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`.
*   **AWS:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_RAW`, `AWS_S3_BUCKET_PUBLIC`.
*   **Payment:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
*   **AI:** `SUNO_API_KEY`.

## 5. Build & Deployment
### 5.1 Build Order
1.  `packages/ui-kit`
2.  `packages/database-client`
3.  `lib/services/s3`
4.  `packages/search-client`
5.  `apps/*` (Dependent on packages)

### 5.2 Deployment
*   **Staging:** Vercel (Feature branches).
*   **Production:** Vercel (Main branch), AWS Infra via Terraform.

## 6. Data Ingestion Pipeline
**Goal:** Autonomous metadata extraction and signal-level processing.

### 6.1 Ingestion Flow
1.  **Frontend (Client-Side):**
    *   **Duplicate Check:** Title-based search in `tracks` table.
    *   **Metadata Extraction:** `jsmediatags` extracts ID3 title, artist, genre, BPM, and lyrics.
    *   **Cover Art:** Extract embedded APIC frames to Blobs.
2.  **Storage Transition:**
    *   **Signed URLs:** `getSignedUploadUrl_Action` generates short-lived S3 PUT URLs.
    *   **S3 Ingest:** Files uploaded to `raw/{track_id}/` prefix.
3.  **Database Initialization:**
    *   `createTrackRecord_Action` creates a `pending_qc` record.
    *   **Initial Defaults:** Duration is temporarily set to `180` (overridden by processor).
4.  **Asynchronous Processing (Worker):**
    *   **Trigger:** AWS SQS message sent post-upload.
    *   **Signal Analysis:** Python (librosa) extracts real `duration`, `bpm`, `key`, and `waveform`.
    *   **Steganography:** UUID embedded into signal using Least Significant Bit (LSB) V1.
    *   **Transcoding:** High-fidelity master generated and moved to `processed/` bucket.
    *   **Final Sync:** DB record updated with real analytical data.

## 7. Scripts Reference
Located in `/scripts`, these tools manage the factory's lifecycle.

### 7.1 Core Processing
*   `process-tracks.mjs`: The primary worker. Downloads raw files, runs Python analyzer, uploads watermarked masters, and updates DB.
*   `audio_analyzer.py`: Technical signal analyzer (BPM, Key, Energy, Duration, Waveform, LSB Watermark).
*   `refresh-durations.mjs`: Maintenance tool to synchronize database `duration_sec` with real S3 file lengths.

### 7.2 Synchronization & Search
*   `meili-sync.mjs`: Pushes Supabase track data to Meilisearch for ultra-fast filtering.
*   `check-sync.mjs`: Verifies data consistency between DB and Search Engine.

### 7.3 Data Maintenance
*   `db-surgeon.mjs`: Sells-service precision tool for fixing data drift or corrupt records.
*   `check-db-files.mjs`: Audits S3 to ensure all DB records have physical files.
*   `fix-cors.mjs`: Configures AWS S3 CORS policies for browser-based uploads/playback.

### 7.4 Metadata & AI
*   `aura-autotag.mjs`: AI-driven mood and genre tagging.
*   `metadata-factory.mjs`: Batch metadata generation and normalization.
*   `karaoke-test.mjs`: Injects word-level timestamp data for testing the Sync Lyrics engine.

### 7.5 Migrations
*   `migrate.js`: Legacy migration handler.
*   `run-scheduling-migration.js`: Implements Smart Flow scheduling schema updates.
