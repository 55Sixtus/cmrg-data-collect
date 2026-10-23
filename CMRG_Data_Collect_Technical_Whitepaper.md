# CMRG DATA COLLECT: ENTERPRISE TECHNICAL WHITEPAPER & PLATFORM SPECIFICATION
**Communication and Marketing Research Group Limited (CMRG Ltd.)**  
*Tagline: Tech savvy • Data Integrity • Actionable insights*

---

## 1. EXECUTIVE SUMMARY & VALUE PROPOSITION

### 1.1 Introduction
**CMRG Data Collect** is a state-of-the-art enterprise market research, consumer polling, and field data collection platform designed and engineered specifically for **Communication and Marketing Research Group Limited (CMRG Ltd.)**. 

As an advanced, offline-first alternative to global industry standards such as SurveyCTO and ODK Aggregate, CMRG Data Collect bridges the gap between field enumerators operating in remote regions across Nigeria and headquarters research directors in Lagos. The platform ensures absolute data integrity, verifiable GPS audit trails, real-time enumerator telemetry, and instant statistical data exports.

### 1.2 Value Proposition vs. Legacy Tools (SurveyCTO / ODK)
- **Zero Licensing Bottlenecks**: Fully hosted on secure cloud infrastructure with dedicated Supabase PostgreSQL persistence and Row Level Security (RLS).
- **Offline-First Resilience**: Engineered with offline sync IDs (`client_submission_uuid`) to prevent duplicate submissions when field enumerators sync tablets following interviews in remote areas with limited cellular connectivity.
- **Advanced Automated Fraud Detection**: Built-in algorithmic auditing flags speeders (<3 minutes completion time) and GPS location mismatches (>5km from assigned clusters) before data reaches analysts.
- **Unified Enterprise UX**: Inspired by modern SaaS design systems (Linear, Stripe), providing an intuitive, polished interface that reduces training overhead for field staff.

---

## 2. ARCHITECTURAL OVERVIEW & TECHNOLOGY STACK

- **Frontend Interface**: Developed in React 19, TypeScript, and Tailwind CSS v4, optimized for responsive operation across mobile tablets, laptops, and executive terminals.
- **Backend & Persistence**: Powered by Supabase PostgreSQL with automated geo-redundancy and AES-256 encryption.
- **Authentication & Authorization**: Secure email/password login backed by Supabase Auth and granular Role-Based Access Control (`Admin`, `Field Supervisor`, `Data Analyst`, `Enumerator`).
- **Developer Attribution**: Engineered by **SIXTUS TECH HUB** (Contact: `08120678052`).

---

## 3. CORE MODULES & FUNCTIONAL SPECIFICATION

### 3.1 Situation Room (Live Command Center)
- **Purpose**: Provides research directors with real-time operational visibility over ongoing fieldwork across Nigeria.
- **Capabilities**:
  - High-level KPIs tracking total interviews achieved against sampling targets.
  - Interactive Nigeria operations map displaying live GPS pin clusters across geopolitical zones (Lagos, Kano, Abuja, Port Harcourt, Ibadan).
  - Real-time submission ticker streaming incoming field interview payloads.

### 3.2 Field Projects & Research Studies Manager
- **Purpose**: Centralizes the administration of multi-state research projects, client contracts, and regional quotas.
- **Capabilities**:
  - Detailed study tracking by sector (FMCG, Public Opinion, Healthcare, Financial Services, Agriculture, Energy).
  - Quota milestone tracking and automated progress bars.
  - Project creation wizard establishing sampling frames and regional state assignments.

### 3.3 Questionnaire Design Studio (Survey Builder)
- **Purpose**: Empowers research teams to author ODK-compatible digital survey instruments without manual XML coding.
- **Capabilities**:
  - Support for 10+ question types including Text, Integer, Decimal, Select One, Select Multiple, GPS Capture, Photo, Audio Consent, and Date.
  - Instant generation of ODK XForm XML definitions ready for deployment to Android enumeration tablets.

### 3.4 Form Test Drive (Enumerator Tablet Simulator)
- **Purpose**: Allows supervisors and questionnaire designers to test survey flows prior to field deployment.
- **Capabilities**:
  - Interactive ODK Form Simulator rendering a simulated Android tablet interface.
  - Tests validation rules, skip logic branching, and simulated GPS coordinate calibration.

### 3.5 Data Quality Control & Audit Queue
- **Purpose**: Safeguards data integrity by intercepting fraudulent or low-quality submissions.
- **Capabilities**:
  - Automated detection of speeding violations and GPS displacement anomalies.
  - Supervisor review queue with integrated audio audit playback.
  - Action workflow allowing supervisors to **Approve**, **Flag**, or **Reject** submissions with logged review notes.

### 3.6 Field Enumerators & Device Telemetry Roster
- **Purpose**: Manages field personnel and monitors mobile hardware readiness.
- **Capabilities**:
  - Tracks enumerator assignments, phone numbers, and operational status (`Active in Field`, `Offline`).
  - Monitors Android device telemetry including battery levels, app versions, and last sync timestamps.
  - Quick push-dispatch messaging simulation for operational updates.

### 3.7 Analytics, Crosstabs & Dataset Export
- **Purpose**: Accelerates data cleaning, statistical modeling, and client deliverables.
- **Capabilities**:
  - Frequency distribution tables and summary performance indicators (average interview duration, GPS precision compliance).
  - **Export Data Engine**: Generates real downloadable CSV flat files, printable Executive PDF Reports, and simulation support for IBM SPSS (`.sav`) and Stata (`.dta`) datasets.

### 3.8 System Settings, RBAC & Immutable Audit Logs
- **Purpose**: Ensures corporate governance and accountability.
- **Capabilities**:
  - Role-Based Access Control matrix defining permissions per user tier.
  - Immutable system audit trail recording sensitive data modifications, user logins, and IP addresses.

---

## 4. CONCLUSION
CMRG Data Collect establishes Communication and Marketing Research Group Limited as a technology-driven leader in African market research. By combining offline-first tablet data collection, automated fraud detection, and executive real-time monitoring, CMRG Ltd. delivers unmatched data integrity and actionable insights to its international and domestic clients.

***
*Platform Developed by SIXTUS TECH HUB (08120678052)*
