export type TabType = 
  | 'dashboard'
  | 'projects'
  | 'builder'
  | 'simulator'
  | 'quality'
  | 'enumerators'
  | 'analytics'
  | 'settings';

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
  | 'integer'
  | 'decimal'
  | 'select_one'
  | 'select_multiple'
  | 'gps'
  | 'photo'
  | 'audio'
  | 'barcode'
  | 'date'
  | 'matrix';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  variableName: string;
  label: string;
  type: QuestionType;
  required: boolean;
  hint?: string;
  options?: QuestionOption[];
  relevantCondition?: string; // e.g. "q3 == '1'"
}

export interface Questionnaire {
  id: string;
  title: string;
  version: string;
  projectId: string;
  updatedAt: string;
  questions: Question[];
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
