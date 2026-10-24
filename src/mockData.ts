import { Project, Questionnaire, Submission, Enumerator, AuditLog, FieldDeployment, RetentionPolicy, CloudDeploymentRecord } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    code: 'CMRG-CPI-2026-Q3',
    title: 'National Consumer Goods Price Index & Inflation Tracker Q3',
    client: 'Federal Ministry of Trade & Investment / Central Bank Partner',
    sector: 'FMCG',
    status: 'Active',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    targetInterviews: 5000,
    completedInterviews: 3842,
    rejectedInterviews: 128,
    regions: ['Lagos', 'Kano', 'Rivers', 'Oyo', 'Enugu', 'Kaduna', 'FCT Abuja'],
    assignedEnumeratorsCount: 85,
    questionnaireId: 'quest-1',
    description: 'High-frequency retail pricing audit across 24 open markets and supermarkets covering 120 staple consumer product categories.'
  },
  {
    id: 'proj-2',
    code: 'CMRG-POT-LAG-02',
    title: 'Lagos Metropolitan Public Opinion & Governance Tracker',
    client: 'Lagos State Bureau of Statistics',
    sector: 'Public Opinion',
    status: 'Active',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    targetInterviews: 2500,
    completedInterviews: 2150,
    rejectedInterviews: 45,
    regions: ['Ikeja', 'Lagos Island', 'Alimosho', 'Surulere', 'Eti-Osa', 'Ikorodu', 'Badagry'],
    assignedEnumeratorsCount: 50,
    questionnaireId: 'quest-2',
    description: 'Household survey evaluating citizen satisfaction with public transport, infrastructure, waste management, and digital e-governance initiatives.'
  },
  {
    id: 'proj-3',
    code: 'CMRG-FMCG-BHU-09',
    title: 'FMCG Brand Health, Penetration & Usage Survey Nigeria',
    client: 'Multinational Beverage & Confectionery Corp',
    sector: 'FMCG',
    status: 'Active',
    startDate: '2026-09-15',
    endDate: '2026-11-15',
    targetInterviews: 4000,
    completedInterviews: 3120,
    rejectedInterviews: 92,
    regions: ['Kano', 'Kaduna', 'Oyo', 'Rivers', 'Anambra', 'Edo', 'FCT Abuja'],
    assignedEnumeratorsCount: 65,
    questionnaireId: 'quest-3',
    description: 'In-home consumer usage habits, brand recall, price sensitivity, and retail channel preference analysis for leading household goods.'
  },
  {
    id: 'proj-4',
    code: 'CMRG-RHS-KATS-04',
    title: 'North-West Rural Healthcare Access & Immunization Audit',
    client: 'Global Health Philanthropy & WHO Nigeria',
    sector: 'Healthcare',
    status: 'Paused',
    startDate: '2026-08-01',
    endDate: '2026-10-15',
    targetInterviews: 1800,
    completedInterviews: 1780,
    rejectedInterviews: 12,
    regions: ['Katsina', 'Sokoto', 'Zamfara', 'Kebbi'],
    assignedEnumeratorsCount: 30,
    questionnaireId: 'quest-4',
    description: 'Primary healthcare center capacity assessment, vaccine cold-chain verification, and maternal health access interviews in remote rural settlements.'
  },
  {
    id: 'proj-5',
    code: 'CMRG-FIN-LIT-05',
    title: 'Digital Financial Services & Agency Banking Adoption Index',
    client: 'Nigerian FinTech Council & Apex Bank',
    sector: 'Financial Services',
    status: 'Draft',
    startDate: '2026-11-01',
    endDate: '2026-12-20',
    targetInterviews: 3000,
    completedInterviews: 0,
    rejectedInterviews: 0,
    regions: ['Lagos', 'Ogun', 'Rivers', 'Abuja', 'Enugu', 'Kano'],
    assignedEnumeratorsCount: 0,
    questionnaireId: 'quest-5',
    description: 'Evaluating POS terminal reliability, POS agent liquidity bottlenecks, fraud experiences, and USSD vs Mobile App preference among micro-merchants.'
  }
];

export const INITIAL_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 'quest-1',
    title: 'Consumer Goods Price Index Questionnaire v2.4',
    version: '2.4',
    projectId: 'proj-1',
    updatedAt: '2026-10-18',
    questions: [
      { id: 'q1', variableName: 'interviewer_id', label: 'Enumerator ID Code', type: 'text', required: true, hint: 'e.g., CMRG-LOS-104' },
      { id: 'q2', variableName: 'market_name', label: 'Select Market Location', type: 'select_one', required: true, options: [
        { id: 'opt1', label: 'Alaba International Market (Lagos)', value: 'alaba_lagos' },
        { id: 'opt2', label: 'Balogun Market (Lagos Island)', value: 'balogun_lagos' },
        { id: 'opt3', label: 'Dugbe Market (Ibadan)', value: 'dugbe_ibadan' },
        { id: 'opt4', label: 'Kurmi Market (Kano)', value: 'kurmi_kano' },
        { id: 'opt5', label: 'Ariaria International Market (Aba)', value: 'ariaria_aba' }
      ]},
      { id: 'q3', variableName: 'store_type', label: 'Establishment Type', type: 'select_one', required: true, options: [
        { id: 'st1', label: 'Open Air Market Stall', value: 'open_stall' },
        { id: 'st2', label: 'Neighborhood Supermarket', value: 'supermarket' },
        { id: 'st3', label: 'Kiosk / Provision Shop', value: 'kiosk' },
        { id: 'st4', label: 'Wholesale Depot', value: 'wholesale' }
      ]},
      { id: 'q4', variableName: 'item_category', label: 'Product Category Audited', type: 'select_one', required: true, options: [
        { id: 'cat1', label: 'Grains & Cereals (Rice, Beans, Maize)', value: 'grains' },
        { id: 'cat2', label: 'Vegetable Oils & Cooking Fats', value: 'oils' },
        { id: 'cat3', label: 'Beverages (Milk, Tea, Sugar, Cocoa)', value: 'beverages' },
        { id: 'cat4', label: 'Packaged Foods & Noodles', value: 'packaged_foods' }
      ]},
      { id: 'q5', variableName: 'unit_price_ngn', label: 'Current Retail Selling Price (NGN)', type: 'integer', required: true, hint: 'Enter price in Nigerian Naira without commas' },
      { id: 'q6', variableName: 'product_photo', label: 'Capture Product & Price Tag Photo', type: 'photo', required: true },
      { id: 'q7', variableName: 'store_gps', label: 'Capture GPS Audit Coordinate', type: 'gps', required: true }
    ]
  },
  {
    id: 'quest-2',
    title: 'Lagos Governance & Public Infrastructure Survey',
    version: '1.1',
    projectId: 'proj-2',
    updatedAt: '2026-10-19',
    questions: [
      { id: 'p1', variableName: 'respondent_age', label: 'Respondent Age Bracket', type: 'select_one', required: true, options: [
        { id: 'ag1', label: '18 - 25 years', value: '18_25' },
        { id: 'ag2', label: '26 - 35 years', value: '26_35' },
        { id: 'ag3', label: '36 - 50 years', value: '36_50' },
        { id: 'ag4', label: 'Above 50 years', value: '50_plus' }
      ]},
      { id: 'p2', variableName: 'primary_transport', label: 'Primary Means of Daily Commute', type: 'select_one', required: true, options: [
        { id: 'tr1', label: 'Danfo / Commercial Bus', value: 'danfo' },
        { id: 'tr2', label: 'BRT Bus System', value: 'brt' },
        { id: 'tr3', label: 'Private Car', value: 'private_car' },
        { id: 'tr4', label: 'Okada / Tricycle (Keke)', value: 'okada_keke' }
      ]},
      { id: 'p3', variableName: 'satisfaction_score', label: 'Rate Overall State Infrastructure in your LGA (1-10)', type: 'integer', required: true, hint: '1 = Very Poor, 10 = Excellent' },
      { id: 'p4', variableName: 'interview_audio', label: 'Record Interview Audio Consent & Summary', type: 'audio', required: false }
    ]
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-8921',
    projectId: 'proj-1',
    projectTitle: 'National Consumer Goods Price Index Q3',
    enumeratorId: 'ENU-104',
    enumeratorName: 'Oluwaseun Adebayo',
    state: 'Lagos',
    lga: 'Ikeja',
    gps: { lat: 6.6018, lng: 3.3515, accuracy: 3.2 },
    durationSeconds: 312,
    submittedAt: '2026-10-21 14:22:10',
    status: 'Approved',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/market.ogg',
    answers: {
      interviewer_id: 'ENU-104',
      market_name: 'Alaba International Market (Lagos)',
      store_type: 'wholesale',
      item_category: 'grains',
      unit_price_ngn: 78500,
      product_photo: 'https://images.unsplash.com/photo-1586885284437-6077974cfcf0?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'sub-8922',
    projectId: 'proj-1',
    projectTitle: 'National Consumer Goods Price Index Q3',
    enumeratorId: 'ENU-208',
    enumeratorName: 'Fatima Bello',
    state: 'Kano',
    lga: 'Kano Municipal',
    gps: { lat: 12.0022, lng: 8.5920, accuracy: 5.1 },
    durationSeconds: 184,
    submittedAt: '2026-10-21 14:18:45',
    status: 'Flagged',
    flagReason: 'Speeder Alert: Interview completed in under 3 minutes (184s)',
    answers: {
      interviewer_id: 'ENU-208',
      market_name: 'Kurmi Market (Kano)',
      store_type: 'open_stall',
      item_category: 'oils',
      unit_price_ngn: 45000,
      product_photo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'sub-8923',
    projectId: 'proj-2',
    projectTitle: 'Lagos Public Opinion & Governance Tracker',
    enumeratorId: 'ENU-112',
    enumeratorName: 'Chukwudi Okoro',
    state: 'Lagos',
    lga: 'Surulere',
    gps: { lat: 6.5005, lng: 3.3583, accuracy: 2.8 },
    durationSeconds: 420,
    submittedAt: '2026-10-21 13:55:12',
    status: 'Approved',
    answers: {
      respondent_age: '26_35',
      primary_transport: 'brt',
      satisfaction_score: 7
    }
  },
  {
    id: 'sub-8924',
    projectId: 'proj-3',
    projectTitle: 'FMCG Brand Health & Usage Nigeria',
    enumeratorId: 'ENU-305',
    enumeratorName: 'Amina Danjuma',
    state: 'Kaduna',
    lga: 'Kaduna North',
    gps: { lat: 10.5105, lng: 7.4165, accuracy: 6.5 },
    durationSeconds: 610,
    submittedAt: '2026-10-21 13:40:00',
    status: 'Pending',
    answers: {
      respondent_age: '36_50',
      primary_transport: 'private_car',
      satisfaction_score: 8
    }
  },
  {
    id: 'sub-8925',
    projectId: 'proj-1',
    projectTitle: 'National Consumer Goods Price Index Q3',
    enumeratorId: 'ENU-401',
    enumeratorName: 'Emeka Nwachukwu',
    state: 'Rivers',
    lga: 'Port Harcourt',
    gps: { lat: 4.8156, lng: 7.0498, accuracy: 4.0 },
    durationSeconds: 110,
    submittedAt: '2026-10-21 12:05:30',
    status: 'Rejected',
    flagReason: 'GPS Mismatch: Coordinates 45km away from assigned Port Harcourt municipal cluster',
    answers: {
      interviewer_id: 'ENU-401',
      market_name: 'Ariaria International Market (Aba)',
      store_type: 'kiosk',
      item_category: 'beverages',
      unit_price_ngn: 3200,
      product_photo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80'
    }
  }
];

export const INITIAL_ENUMERATORS: Enumerator[] = [
  { id: 'ENU-104', name: 'Oluwaseun Adebayo', phone: '+234 803 456 7890', email: 'o.adebayo@cmrg.org', zone: 'South-West', state: 'Lagos', deviceModel: 'Samsung Galaxy A14 (Android 13)', batteryLevel: 88, appVersion: 'v4.8.2', status: 'Active in Field', lastSync: '2 mins ago', completedToday: 14, rating: 4.9 },
  { id: 'ENU-208', name: 'Fatima Bello', phone: '+234 802 112 3344', email: 'f.bello@cmrg.org', zone: 'North-West', state: 'Kano', deviceModel: 'Tecno Spark 10 (Android 13)', batteryLevel: 64, appVersion: 'v4.8.2', status: 'Active in Field', lastSync: '5 mins ago', completedToday: 11, rating: 4.7 },
  { id: 'ENU-112', name: 'Chukwudi Okoro', phone: '+234 814 998 7654', email: 'c.okoro@cmrg.org', zone: 'South-West', state: 'Lagos', deviceModel: 'Redmi Note 12 (Android 14)', batteryLevel: 92, appVersion: 'v4.8.2', status: 'Active in Field', lastSync: 'Just now', completedToday: 16, rating: 4.9 },
  { id: 'ENU-305', name: 'Amina Danjuma', phone: '+234 809 333 2211', email: 'a.danjuma@cmrg.org', zone: 'North-West', state: 'Kaduna', deviceModel: 'Infinix Hot 30 (Android 13)', batteryLevel: 41, appVersion: 'v4.8.1', status: 'Active in Field', lastSync: '12 mins ago', completedToday: 9, rating: 4.6 },
  { id: 'ENU-401', name: 'Emeka Nwachukwu', phone: '+234 805 777 8899', email: 'e.nwachukwu@cmrg.org', zone: 'South-South', state: 'Rivers', deviceModel: 'Samsung Galaxy A24', batteryLevel: 18, appVersion: 'v4.8.2', status: 'Offline', lastSync: '2 hours ago', completedToday: 5, rating: 4.2 },
  { id: 'ENU-502', name: 'Zainab Mohammed', phone: '+234 806 555 4433', email: 'z.mohammed@cmrg.org', zone: 'North-Central', state: 'FCT Abuja', deviceModel: 'Google Pixel 6a (Android 14)', batteryLevel: 95, appVersion: 'v4.8.2', status: 'Active in Field', lastSync: '1 min ago', completedToday: 18, rating: 5.0 }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-10-21 14:25:00', user: 'Dr. Tunde Fashola (Admin)', action: 'Project Created', details: 'Initialized project CMRG-FIN-LIT-05', ip: '197.210.44.12' },
  { id: 'log-2', timestamp: '2026-10-21 13:10:45', user: 'Hauwa Ibrahim (Supervisor)', action: 'Submission Approved', details: 'Approved submission sub-8921 for Lagos cluster', ip: '105.112.180.5' },
  { id: 'log-3', timestamp: '2026-10-21 11:40:12', user: 'System Quality Engine', action: 'Flagged Submission', details: 'Flagged sub-8922 for potential speeding violation (184s)', ip: '127.0.0.1' },
  { id: 'log-4', timestamp: '2026-10-21 09:15:00', user: 'Dr. Tunde Fashola (Admin)', action: 'Enumerator Assigned', details: 'Assigned ENU-104 to Lagos Retail Hub', ip: '197.210.44.12' }
];

export const INITIAL_FIELD_DEPLOYMENTS: FieldDeployment[] = [
  {
    id: 'dep-1',
    name: 'South-West Mega Retail Audit Wave 1',
    projectId: 'proj-1',
    projectCode: 'CMRG-CPI-2026-Q3',
    projectTitle: 'National Consumer Goods Price Index Q3',
    targetRegion: 'Lagos, Oyo, Ogun',
    targetInterviews: 2800,
    completedInterviews: 2450,
    assignedEnumerators: 42,
    startDate: '2026-09-01',
    endDate: '2026-11-15',
    retentionPeriod: '3_years',
    retentionExpiryDate: '2029-11-15',
    status: 'Active',
    deploymentVersion: 'v2.4-prod',
    supervisorName: 'Hauwa Ibrahim',
    offlineSyncAllowed: true,
    notes: 'High-frequency FMCG audit across Mile 12, Bodija, and Balogun open markets.'
  },
  {
    id: 'dep-2',
    name: 'Kano & Kaduna Urban Consumer Wave',
    projectId: 'proj-3',
    projectCode: 'CMRG-FMCG-BHU-09',
    projectTitle: 'FMCG Brand Health & Usage Survey',
    targetRegion: 'Kano, Kaduna',
    targetInterviews: 2000,
    completedInterviews: 1820,
    assignedEnumerators: 30,
    startDate: '2026-09-15',
    endDate: '2026-11-01',
    retentionPeriod: '1_year',
    retentionExpiryDate: '2027-11-01',
    status: 'Active',
    deploymentVersion: 'v1.8-field',
    supervisorName: 'Musa Garba',
    offlineSyncAllowed: true,
    notes: 'Door-to-door consumer usage interviews with audio audit verification.'
  },
  {
    id: 'dep-3',
    name: 'Lagos Metro Public Opinion Polling Wave 2',
    projectId: 'proj-2',
    projectCode: 'CMRG-POT-LAG-02',
    projectTitle: 'Lagos Metropolitan Public Opinion & Governance',
    targetRegion: 'Lagos Island, Ikeja, Eti-Osa',
    targetInterviews: 2500,
    completedInterviews: 2150,
    assignedEnumerators: 50,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    retentionPeriod: '5_years',
    retentionExpiryDate: '2031-10-31',
    status: 'Active',
    deploymentVersion: 'v2.1',
    supervisorName: 'Bolanle Peters',
    offlineSyncAllowed: true,
    notes: 'Citizen satisfaction interviews with biometric and GPS geofence checks.'
  },
  {
    id: 'dep-4',
    name: 'North-West Health Facility Rapid Assessment',
    projectId: 'proj-4',
    projectCode: 'CMRG-RHS-KATS-04',
    projectTitle: 'Rural Healthcare Access & Immunization Audit',
    targetRegion: 'Katsina, Sokoto, Zamfara',
    targetInterviews: 1800,
    completedInterviews: 1780,
    assignedEnumerators: 28,
    startDate: '2026-08-01',
    endDate: '2026-10-15',
    retentionPeriod: '5_years',
    retentionExpiryDate: '2031-10-15',
    status: 'Completed',
    deploymentVersion: 'v1.4',
    supervisorName: 'Dr. Kabir Sani',
    offlineSyncAllowed: true,
    notes: 'Clinical cold-chain verification dataset; retained under Global Health regulatory archive.'
  }
];

export const INITIAL_RETENTION_POLICIES: RetentionPolicy[] = [
  {
    id: 'ret-1',
    title: 'Standard Research Survey Data Retention',
    description: 'Keep approved market research interviews active in primary database for longitudinal trend analysis, then transfer to cold encrypted storage.',
    category: 'Survey Submissions',
    retentionDurationDays: 365,
    retentionLabel: '1 Year Active (Then Archive)',
    action: 'Archive to Cold Storage',
    enabled: true,
    lastExecuted: '2026-10-20 03:00 UTC',
    affectedCount: 3842,
    complianceStandard: 'ISO/IEC 27001'
  },
  {
    id: 'ret-2',
    title: 'Enumerator Audio Quality Audit Retention',
    description: 'Retain background audio recordings and quality control check audio for 90 days after project sign-off, then permanently prune audio files while preserving interview responses.',
    category: 'Audio Recordings',
    retentionDurationDays: 90,
    retentionLabel: '90 Days Post-Audit',
    action: 'Purge Permanently',
    enabled: true,
    lastExecuted: '2026-10-18 02:30 UTC',
    affectedCount: 512,
    complianceStandard: 'CMRG Ethics Code'
  },
  {
    id: 'ret-3',
    title: 'Respondent PII & Precision GPS De-Identification',
    description: 'Automatically mask telephone numbers, respondent names, and truncate GPS coordinates to 2 decimal places after quality verification to prevent re-identification.',
    category: 'GPS Traces & PII',
    retentionDurationDays: 180,
    retentionLabel: '180 Days (Anonymization)',
    action: 'Anonymize PII',
    enabled: true,
    lastExecuted: '2026-10-15 04:00 UTC',
    affectedCount: 1420,
    complianceStandard: 'NDPR (Nigeria)'
  },
  {
    id: 'ret-4',
    title: 'Flagged, Speeding & Duplicate Submission Purge',
    description: 'Permanently remove rejected submissions, speeding violations (<120s), and fraudulent duplicates after a 30-day review dispute window.',
    category: 'Flagged & Rejected',
    retentionDurationDays: 30,
    retentionLabel: '30 Days Review Grace',
    action: 'Purge Permanently',
    enabled: true,
    lastExecuted: '2026-10-21 00:00 UTC',
    affectedCount: 265,
    complianceStandard: 'GDPR Art. 5(1)(e)'
  },
  {
    id: 'ret-5',
    title: 'Vercel Preview Deployments & Build Cache Retention',
    description: 'Maintain Vercel preview branch deployments for 30 days while locking production deployments indefinitely. Enable Build Cache reuse across deploys.',
    category: 'Cloud Build Artifacts',
    retentionDurationDays: 30,
    retentionLabel: '30 Days (Production Protected)',
    action: 'Prune Cached Builds',
    enabled: true,
    lastExecuted: '2026-10-22 01:15 UTC',
    affectedCount: 18,
    complianceStandard: 'ISO/IEC 27001'
  }
];

export const INITIAL_CLOUD_DEPLOYMENTS: CloudDeploymentRecord[] = [
  {
    id: 'dpl-prod-01',
    deploymentUrl: 'https://cmrg-data-collect.vercel.app',
    environment: 'Production',
    branch: 'main',
    commitHash: '9a8f2e1',
    commitMessage: 'Production release: Offline Queue IndexedDB & Supabase fallback sync',
    status: 'Ready',
    createdAt: '2026-10-22 18:42 UTC',
    retentionStatus: 'Retained (Protected)',
    buildDuration: '42s (Vercel Build Cache Used)',
    author: 'Sixtus Tech Hub'
  },
  {
    id: 'dpl-prev-02',
    deploymentUrl: 'https://cmrg-data-collect-git-preview.vercel.app',
    environment: 'Preview',
    branch: 'feat/field-sync-engine',
    commitHash: '7c3b1d0',
    commitMessage: 'Add background audio audit & GPS geofencing verification',
    status: 'Ready',
    createdAt: '2026-10-21 14:10 UTC',
    retentionStatus: 'Retained (90 Days)',
    buildDuration: '38s (Build Cache Hit)',
    author: 'Sixtus Tech Hub'
  },
  {
    id: 'dpl-prev-03',
    deploymentUrl: 'https://cmrg-data-collect-git-staging.vercel.app',
    environment: 'Staging',
    branch: 'staging',
    commitHash: '5e4d9c2',
    commitMessage: 'Staging environment test: Supabase kmwzmyupvqjitugpckzp integration',
    status: 'Ready',
    createdAt: '2026-10-20 09:30 UTC',
    retentionStatus: 'Retained (30 Days)',
    buildDuration: '45s',
    author: 'Lead Research DevOps'
  }
];
