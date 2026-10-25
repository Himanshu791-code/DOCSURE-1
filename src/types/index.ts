export type NavTab = 'overview' | 'upload' | 'summary' | 'review' | 'matrix';

export type UserRole = 'admin' | 'officer' | 'applicant';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  institutionId?: string;
  isDemoUser?: boolean;
}

export interface InstitutionRecord {
  id: string;
  name: string;
  pid: string;
  region: string;
  state: string;
  applicantUid?: string;
  isDemo?: boolean;
}

export type ApplicationStatus = 'draft' | 'submitted' | 'under_scrutiny' | 'flagged' | 'approved' | 'rejected';

export interface ApplicationRecord {
  id: string;
  institutionId: string;
  institutionName: string;
  pid: string;
  dossierRef: string;
  session: string;
  region: string;
  status: ApplicationStatus;
  riskScore: number;
  assignedOfficerName?: string;
  acknowledged?: boolean;
  updatedAt: string;
  isDemo?: boolean;
}

export interface StatutoryDoc {
  id: string;
  applicationId?: string;
  number: string;
  title: string;
  type: string;
  size: string;
  authority: string;
  status: 'verified' | 'flawed' | 'deficient' | 'scanning' | 'pending';
  scanProgress?: number;
  sha256Hash?: string;
  confidence?: string;
  note?: string;
  uploadedAt?: string;
}

export interface Finding {
  id: string;
  code: string;
  title: string;
  severity: 'high' | 'moderate' | 'low';
  description: string;
  statuteRef?: string;
  activeFlags?: number;
  confidence?: string;
  docCode?: string;
  icon?: string;
}

export interface MatrixRowData {
  id: number;
  applicationId?: string;
  parameter: string;
  portalDeclaration: {
    title: string;
    subtext: string;
    badge?: string;
  };
  landDeed: {
    title: string;
    subtext: string;
    badge?: string;
    hasDeficit?: boolean;
  };
  trustCert: {
    title: string;
    subtext: string;
  };
  fireNoc: {
    title: string;
    subtext: string;
  };
  sanction: {
    title: string;
    subtext: string;
    isDiscrepancy?: boolean;
  };
  inspector: {
    title: string;
    badgeText: string;
    badgeClass: string;
    sourceAField: string;
    sourceAVal: string;
    sourceADesc: string;
    sourceBField: string;
    sourceBVal: string;
    sourceBDesc: string;
    analysis: string;
    statusText: string;
    statusColor: 'error' | 'secondary' | 'primary';
  };
}

export interface AdjudicationRecord {
  id: string;
  applicationId: string;
  officerUid: string;
  officerName: string;
  decision: 'pending' | 'show-cause' | 'overridden' | 'accepted';
  notes: string;
  timestamp: string;
  proofHash: string;
}

export interface AuditLogRecord {
  id: string;
  applicationId: string;
  actorUid: string;
  actorRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
}

export type OcrFieldReviewStatus = 'verified' | 'needs_review' | 'mismatch' | 'corrected';

export interface ExtractedField {
  key: string;
  label: string;
  rawText: string;
  normalizedValue: string;
  confidence: number; // 0 - 100
  pageNumber: number;
  boundingBox?: BoundingBox;
  reviewStatus: OcrFieldReviewStatus;
  anomalyReason?: string;
  statutoryRuleRef?: string;
  portalDeclaredValue?: string;
  // Immutable correction tracking
  correctedValue?: string;
  correctionReason?: string;
  correctedBy?: string;
  correctedAt?: string;
}

export type DocumentCategory =
  | 'trust_registration'
  | 'land_sale_deed'
  | 'fire_safety_noc'
  | 'building_sanction_plan'
  | 'portal_land_declaration'
  | 'faculty_cadre_schedule'
  | 'unclassified_statutory';

export type OcrProcessingStatus = 'queued' | 'processing' | 'completed' | 'needs_review' | 'failed';

export interface DocumentOcrResult {
  id: string;
  documentId: string;
  applicationId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  pageCount: number;
  isSearchablePdf: boolean;
  category: DocumentCategory;
  categoryLabel: string;
  categoryConfidence: number;
  status: OcrProcessingStatus;
  rawFullText: string;
  extractedFields: ExtractedField[];
  processingDurationMs: number;
  engineUsed: string;
  preprocessed: {
    deskewApplied: boolean;
    rotationDegrees: number;
    contrastEnhanced: boolean;
  };
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

