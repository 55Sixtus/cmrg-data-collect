export type TabType = 
  | 'dashboard'
  | 'projects'
  | 'builder'
  | 'simulator'
  | 'quality'
  | 'enumerators'
  | 'analytics'
  | 'deployments'
  | 'geolock'
  | 'field'
  | 'settings';

export interface FieldDeployment {
  id: string;
  name: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  targetRegion: string;
  targetInterviews: number;
  completedInterviews: number;
  assignedEnumerators: number;
  startDate: string;
  endDate: string;
  retentionPeriod: '30_days' | '90_days' | '180_days' | '1_year' | '3_years' | '5_years' | 'permanent';
  retentionExpiryDate: string;
  status: 'Active' | 'Scheduled' | 'Completed' | 'Archived';
  deploymentVersion: string;
  supervisorName: string;
  offlineSyncAllowed: boolean;
  notes?: string;
}

export interface RetentionPolicy {
  id: string;
  title: string;
  description: string;
  category: 'Survey Submissions' | 'Audio Recordings' | 'GPS Traces & PII' | 'Flagged & Rejected' | 'Cloud Build Artifacts';
  retentionDurationDays: number;
  retentionLabel: string;
  action: 'Archive to Cold Storage' | 'Anonymize PII' | 'Purge Permanently' | 'Prune Cached Builds';
  enabled: boolean;
  lastExecuted: string;
  affectedCount: number;
  complianceStandard: 'NDPR (Nigeria)' | 'GDPR Art. 5(1)(e)' | 'ISO/IEC 27001' | 'CMRG Ethics Code';
}

export interface CloudDeploymentRecord {
  id: string;
  deploymentUrl: string;
  environment: 'Production' | 'Preview' | 'Staging';
  branch: string;
  commitHash: string;
  commitMessage: string;
  status: 'Ready' | 'Building' | 'Failed';
  createdAt: string;
  retentionStatus: 'Retained (Protected)' | 'Retained (90 Days)' | 'Retained (30 Days)';
  buildDuration: string;
  author: string;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  client: string;
  sector: 'FMCG' | 'Public Opinion' | 'Agriculture' | 'Healthcare' | 'Financial Services' | 'Energy';
  status: 'Active' | 'Draft' | 'Paused' | 'Completed';
  startDate: string;
  endDate: string;
  targetInterviews: number;
  completedInterviews: number;
  rejectedInterviews: number;
  regions: string[];
  assignedEnumeratorsCount: number;
  questionnaireId: string;
  description: string;
}

export type QuestionType = 
  | 'text'
  | 'textarea'
  | 'integer'
  | 'decimal'
  | 'yes_no'
  | 'select_one'
  | 'select_multiple'
  | 'dropdown'
  | 'rating'
  | 'nps'
  | 'matrix'
  | 'ranking'
  | 'semantic_differential'
  | 'constant_sum'
  | 'date'
  | 'time'
  | 'duration'
  | 'calculation'
  | 'image_select'
  | 'photo'
  | 'video'
  | 'audio'
  | 'signature'
  | 'gps'
  | 'barcode'
  | 'repeat_group'
  | 'instruction';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  imageUrl?: string;
}

export interface MatrixRow {
  id: string;
  label: string;
}

export interface MatrixCol {
  id: string;
  label: string;
  value: string;
}

export interface SemanticPair {
  id: string;
  leftLabel: string;
  rightLabel: string;
}

export interface QuestionValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  regexPattern?: string;
  customErrorMessage?: string;
}

export interface Question {
  id: string;
  variableName: string;
  label: string;
  type: QuestionType;
  required: boolean;
  hint?: string;
  section?: string;
  options?: QuestionOption[];
  allowOther?: boolean;
  otherLabel?: string;
  randomizeOptions?: boolean;
  matrixRows?: MatrixRow[];
  matrixCols?: MatrixCol[];
  semanticPairs?: SemanticPair[];
  maxRating?: number;
  ratingLabels?: { min: string; max: string };
  constantSumTotal?: number;
  calculationFormula?: string;
  repeatQuestions?: Question[];
  repeatCountVar?: string;
  repeatMax?: number;
  pipeSourceVar?: string;
  relevantCondition?: string; // e.g. "q3 == '1'" or "age >= 18"
  skipToQuestionId?: string;
  validation?: QuestionValidation;
  screenoutCondition?: string;
  screenoutMessage?: string;
}

export interface QuestionnaireQuota {
  id: string;
  name: string;
  variableName: string;
  targetValue: string;
  maxTarget: number;
  currentCount: number;
}

export interface QuestionnaireVersionRecord {
  version: string;
  timestamp: string;
  author: string;
  changelog: string;
  questionsCount: number;
}

export interface Questionnaire {
  id: string;
  title: string;
  version: string;
  projectId: string;
  updatedAt: string;
  discipline?: string;
  description?: string;
  questions: Question[];
  quotas?: QuestionnaireQuota[];
  randomizeQuestions?: boolean;
  status?: 'draft' | 'published' | 'archived';
  versionsHistory?: QuestionnaireVersionRecord[];
}

export interface Submission {
  id: string;
  projectId: string;
  projectTitle: string;
  enumeratorId: string;
  enumeratorName: string;
  state: string;
  lga: string;
  gps: { lat: number; lng: number; accuracy: number };
  durationSeconds: number;
  submittedAt: string;
  status: 'Approved' | 'Flagged' | 'Pending' | 'Rejected';
  flagReason?: string;
  audioUrl?: string;
  answers: Record<string, any>;
  client_submission_uuid?: string;
  is_offline?: boolean;
}

export interface Enumerator {
  id: string;
  name: string;
  phone: string;
  email: string;
  zone: 'North-West' | 'North-East' | 'North-Central' | 'South-West' | 'South-East' | 'South-South';
  state: string;
  deviceModel: string;
  batteryLevel: number;
  appVersion: string;
  status: 'Active in Field' | 'Idle' | 'Offline' | 'Paused';
  lastSync: string;
  completedToday: number;
  rating: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ip: string;
}

export interface GeofenceZone {
  id: string;
  projectId: string;
  name: string;
  state: string;
  lga: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  driftBufferMeters: number;
  targetInterviews?: number;
  assignedEnumerator?: string;
  active: boolean;
  createdAt?: string;
  boundaryCoords?: { lat: number; lng: number }[];
}
