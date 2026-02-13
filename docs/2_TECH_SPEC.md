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

### 3.3 Audio Processing (AWS Lambda/FFmpeg)
*   **Pipeline:** Norm (-14 LUFS) -> Transcode (AAC/FLAC) -> Freq Shift (432Hz) -> Watermark.

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
