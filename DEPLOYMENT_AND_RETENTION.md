# CMRG Data Collect - Deployment & Retention Architecture Guide

## 1. Vercel Cloud Deployment Configuration

This project is configured as a production-grade Vite React Single Page Application (SPA).

### `vercel.json` Specification:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 2. Resolving Vercel's Warning: *"Remove the public framework prefix to keep this value private"*

### Why Vercel Displays This Message:
Vercel detects environment variable keys that begin with framework prefixes such as `VITE_` or `NEXT_PUBLIC_`. It warns that variables with these prefixes will be exposed directly in client-side JavaScript bundles downloaded by user browsers.

### Why It Is 100% Safe and Necessary for Supabase:
- In Vite, client applications **only read variables starting with `VITE_`** via `import.meta.env.VITE_*`.
- Supabase's **Anon Public Key** is designed from the ground up to be safe in public browsers. Data security is enforced on the database level via **Row Level Security (RLS)**.
- If you remove the `VITE_` prefix, Vite will compile the app with `undefined` in place of the key, resulting in "Invalid API Key" during runtime.

### Required Vercel Project Environment Variables:
1. **`VITE_SUPABASE_URL`**:
   ```
   https://kmwzmyupvqjitugpckzp.supabase.co
   ```
2. **`VITE_SUPABASE_ANON_KEY`**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttd3pteXVwdnFqaXR1Z3Bja3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MjQyODAsImV4cCI6MjEwODIwMDI4MH0.ql6hFTANRa4xPlYQ1lUaclTWP3fhr81ciDoUaurFvxc
   ```

*Note: In `src/lib/supabase.ts`, we also implemented automated self-healing fallback logic that protects against missing or malformed environment variables.*

---

## 3. Configuring Vercel Deployment Retention & Build Cache

### In Vercel Project Settings:
1. Go to **Vercel Dashboard** > **cmrg-data-collect** > **Settings** > **Data Cache & Deployments**.
2. **Deployment Retention**:
   - **Production Deployments**: Set to **Unlimited / Retain Indefinitely**. This ensures production builds cannot be accidentally pruned and allows one-click instant rollbacks to any release.
   - **Preview Deployments**: Set to **30 Days** (or 90 Days) to auto-prune inactive feature branch deployments.
3. **Build Cache ("Use existing Build Cache")**:
   - Keep enabled. This reuses previous build caches, reducing build times from ~120s down to ~35s.

---

## 4. CMRG Enterprise Field Survey Deployment & Data Retention

The in-app **Deployments & Retention** dashboard provides:
1. **Field Deployment Management**:
   - Create and schedule field survey waves (name, target quota, dates, enumerators, and region).
   - Assign custom data retention windows (`30_days`, `90_days`, `180_days`, `1_year`, `3_years`, `5_years`, or `permanent`).
2. **Regulatory Data Retention Engine**:
   - **Survey Submissions**: 1 Year active in primary DB, followed by cold storage archival (ISO/IEC 27001).
   - **Audio Quality Audits**: 90 Days post-audit audio pruning to conserve media storage while retaining survey response text.
   - **PII & GPS Masking**: Automatic de-identification of phone numbers and coordinate truncation after 180 days (NDPR & GDPR Article 5(1)(e)).
   - **Speeding / Rejected Records**: 30-day review grace period before permanent purge.
   - **Audit Trail**: Every retention execution is logged immutably in the System Audit Trail.
