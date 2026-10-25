import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  getDocFromServer,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import {
  ApplicationRecord,
  InstitutionRecord,
  StatutoryDoc,
  MatrixRowData,
  AdjudicationRecord,
  AuditLogRecord,
  AppUser,
  DocumentOcrResult,
  ExtractedField,
} from '../types';
import { MATRIX_DATA } from '../data/mockData';

// Mandatory connection test per Skill guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted.');
      return false;
    }
    // getDocFromServer on non-existent document will throw or return empty, which is fine
    return true;
  }
}

// Demo Institutions
export const DEMO_INSTITUTIONS: InstitutionRecord[] = [
  {
    id: 'inst-vitm',
    name: 'Vishweshwaraya Institute of Technology & Management',
    pid: '1-93821094',
    region: 'South-Western Region',
    state: 'Karnataka',
    applicantUid: 'demo-applicant-vitm',
    isDemo: true,
  },
  {
    id: 'inst-nit',
    name: 'National Institute of Technology Karnataka (NITK Surathkal)',
    pid: '1-10928341',
    region: 'South-Western Region',
    state: 'Karnataka',
    applicantUid: 'demo-applicant-nit',
    isDemo: true,
  },
  {
    id: 'inst-pes',
    name: 'PES Academy of Technology & Research',
    pid: '1-55829104',
    region: 'South-Western Region',
    state: 'Karnataka',
    applicantUid: 'demo-applicant-pes',
    isDemo: true,
  },
];

// Demo Applications
export const DEMO_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'app-vitm-2025',
    institutionId: 'inst-vitm',
    institutionName: 'Vishweshwaraya Institute of Technology & Management',
    pid: '1-93821094',
    dossierRef: 'AICTE/2025/SWR-10492',
    session: 'Academic Session 2025–26 (EoA)',
    region: 'Bengaluru, Karnataka • South-Western Region',
    status: 'flagged',
    riskScore: 74,
    assignedOfficerName: 'A. Verma (Reg. IV Gazette Officer)',
    acknowledged: true,
    updatedAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'app-nit-2025',
    institutionId: 'inst-nit',
    institutionName: 'National Institute of Technology Karnataka (NITK Surathkal)',
    pid: '1-10928341',
    dossierRef: 'AICTE/2025/NIT-084',
    session: 'Academic Session 2025–26 (EoA)',
    region: 'Surathkal, Karnataka • South-Western Region',
    status: 'approved',
    riskScore: 12,
    assignedOfficerName: 'A. Verma (Reg. IV Gazette Officer)',
    acknowledged: true,
    updatedAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'app-pes-2025',
    institutionId: 'inst-pes',
    institutionName: 'PES Academy of Technology & Research',
    pid: '1-55829104',
    dossierRef: 'AICTE/2025/PES-1102',
    session: 'Academic Session 2025–26 (EoA)',
    region: 'Shivamogga, Karnataka • South-Western Region',
    status: 'under_scrutiny',
    riskScore: 48,
    assignedOfficerName: 'Dr. K. S. Iyengar',
    acknowledged: false,
    updatedAt: new Date().toISOString(),
    isDemo: true,
  },
];

export const DEMO_DOCS_VITM: StatutoryDoc[] = [
  {
    id: 'doc-1',
    applicationId: 'app-vitm-2025',
    number: '01.',
    title: 'Trust/Society Registration Certificate',
    type: 'PDF',
    size: '2.4 MB',
    authority: 'Sub-Registrar Blr-South',
    status: 'verified',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    confidence: '99.2%',
    uploadedAt: '2026-10-18T10:14:00Z',
  },
  {
    id: 'doc-2',
    applicationId: 'app-vitm-2025',
    number: '02.',
    title: 'Land Registered Sale Deed / 30-Yr Lease',
    type: 'PDF',
    size: '14.8 MB',
    authority: 'String Discrepancy',
    status: 'flawed',
    note: 'String Discrepancy',
    sha256Hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    confidence: '94.2%',
    uploadedAt: '2026-10-18T10:15:30Z',
  },
  {
    id: 'doc-3',
    applicationId: 'app-vitm-2025',
    number: '03.',
    title: 'State Fire & Rescue Safety NOC',
    type: 'PDF',
    size: '1.1 MB',
    authority: 'Expired 12 Mar 2024',
    status: 'deficient',
    note: 'Expired 12 Mar 2024',
    sha256Hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    confidence: '99.0%',
    uploadedAt: '2026-10-18T10:16:12Z',
  },
  {
    id: 'doc-4',
    applicationId: 'app-vitm-2025',
    number: '04.',
    title: 'Approved Building Plan & Occupancy',
    type: 'OCR Scan',
    size: 'Clause 5.2 Geometric Audit',
    authority: 'Town Planning Authority',
    status: 'scanning',
    scanProgress: 68,
    note: 'OCR Scan · Clause 5.2 Geometric Audit',
    sha256Hash: 'fb8e20fc2e4c3f248c60c39bd652f3c1347298ab97b8b80d6ae6522c7104b281',
    confidence: '97.8%',
    uploadedAt: '2026-10-18T10:18:00Z',
  },
  {
    id: 'doc-5',
    applicationId: 'app-vitm-2025',
    number: '05.',
    title: 'AICTE Faculty Cadre Ratio & Form 16',
    type: 'PDF',
    size: 'Pending Submission',
    authority: 'Awaiting upload of certified payroll schedules',
    status: 'pending',
    note: 'Awaiting upload of certified payroll schedules',
    confidence: '0%',
    uploadedAt: '2026-10-18T10:20:00Z',
  },
];

// Seed Firestore with demonstration data
export async function seedDemonstrationDatabase(force = false): Promise<void> {
  try {
    const appsSnap = await getDocs(collection(db, 'applications'));
    if (!force && !appsSnap.empty) {
      return; // Already seeded
    }

    // Seed Institutions
    for (const inst of DEMO_INSTITUTIONS) {
      await setDoc(doc(db, 'institutions', inst.id), inst);
    }

    // Seed Applications & Subcollections
    for (const app of DEMO_APPLICATIONS) {
      await setDoc(doc(db, 'applications', app.id), app);

      // Seed documents for VITM
      if (app.id === 'app-vitm-2025') {
        for (const d of DEMO_DOCS_VITM) {
          await setDoc(doc(db, 'applications', app.id, 'documents', d.id), d);
        }

        // Seed Consistency Matrix
        for (const [key, row] of Object.entries(MATRIX_DATA)) {
          await setDoc(
            doc(db, 'applications', app.id, 'consistency_checks', `check-${key}`),
            {
              ...row,
              applicationId: app.id,
              isDemo: true,
            }
          );
        }

        // Seed initial Adjudication
        await setDoc(doc(db, 'applications', app.id, 'adjudications', 'adj-initial'), {
          id: 'adj-initial',
          applicationId: app.id,
          officerUid: 'demo-officer-verma',
          officerName: 'A. Verma (Reg. IV Gazette Officer)',
          decision: 'show-cause',
          notes:
            'Deed #3892/BK-I provides evidence for solely 2.40 Acres against declared 4.20 Acres. Discrepancy violates Chapter IV Minimum Contiguous Land requirement for Metro Classification. Issue immediate show-cause notice before Executive Council review.',
          timestamp: '2024-10-14T16:42:09Z',
          proofHash: '0x9f4a18ce84d2b2719cfa082104192b0018a12c81',
          isDemo: true,
        });
      } else {
        // Seed default compliant docs for other institutions
        const defaultDoc: StatutoryDoc = {
          id: 'doc-1',
          applicationId: app.id,
          number: '01.',
          title: 'Trust/Society Registration Certificate',
          type: 'PDF',
          size: '3.1 MB',
          authority: 'State Registrar',
          status: 'verified',
          sha256Hash: 'd5b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b111',
          confidence: '99.5%',
          uploadedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'applications', app.id, 'documents', defaultDoc.id), defaultDoc);
      }
    }

    // Seed Audit Log
    const initialLog: AuditLogRecord = {
      id: `log-seed-${Date.now()}`,
      applicationId: 'app-vitm-2025',
      actorUid: 'system',
      actorRole: 'admin',
      action: 'SYSTEM_INITIALIZATION',
      details: 'Demonstration dataset initialized with statutory AICTE rules v3.2.',
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'audit_logs', initialLog.id), initialLog);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, 'seedDatabase');
    } catch (e) {
      console.warn('Seed database deferred:', e);
    }
  }
}

// Fetch all applications
export async function getApplications(user?: AppUser | null): Promise<ApplicationRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'applications'));
    const list: ApplicationRecord[] = [];
    snap.forEach((d) => list.push(d.data() as ApplicationRecord));

    if (list.length === 0) {
      return DEMO_APPLICATIONS;
    }

    // If user is applicant, restrict to their institution
    if (user && user.role === 'applicant' && user.institutionId) {
      return list.filter((a) => a.institutionId === user.institutionId);
    }

    return list;
  } catch (error) {
    console.warn('Falling back to local demo applications:', error);
    if (user && user.role === 'applicant' && user.institutionId) {
      return DEMO_APPLICATIONS.filter((a) => a.institutionId === user.institutionId);
    }
    return DEMO_APPLICATIONS;
  }
}

// Fetch single application
export async function getApplicationById(appId: string): Promise<ApplicationRecord | null> {
  try {
    const snap = await getDoc(doc(db, 'applications', appId));
    if (!snap.exists()) {
      return DEMO_APPLICATIONS.find((a) => a.id === appId) || null;
    }
    return snap.data() as ApplicationRecord;
  } catch (error) {
    console.warn('Falling back to local demo application:', error);
    return DEMO_APPLICATIONS.find((a) => a.id === appId) || null;
  }
}

// Fetch documents for application
export async function getDocuments(appId: string): Promise<StatutoryDoc[]> {
  try {
    const snap = await getDocs(collection(db, 'applications', appId, 'documents'));
    const list: StatutoryDoc[] = [];
    snap.forEach((d) => list.push(d.data() as StatutoryDoc));
    if (list.length === 0) {
      return appId === 'app-vitm-2025' ? DEMO_DOCS_VITM : [];
    }
    return list.sort((a, b) => a.number.localeCompare(b.number));
  } catch (error) {
    console.warn('Falling back to local demo documents for', appId, error);
    return appId === 'app-vitm-2025' ? DEMO_DOCS_VITM : [];
  }
}

// Upload or replace document
export async function saveDocument(appId: string, statutoryDoc: StatutoryDoc): Promise<void> {
  try {
    await setDoc(doc(db, 'applications', appId, 'documents', statutoryDoc.id), statutoryDoc);
    await logAuditEvent(
      appId,
      auth.currentUser?.uid || 'guest',
      'applicant',
      'DOCUMENT_UPLOAD',
      `Uploaded ${statutoryDoc.title} [SHA-256: ${statutoryDoc.sha256Hash || 'verified'}]`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `applications/${appId}/documents/${statutoryDoc.id}`);
  }
}

// Update single document status (e.g. after affidavit or review)
export async function updateDocumentStatus(
  appId: string,
  docId: string,
  status: StatutoryDoc['status'],
  note?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'applications', appId, 'documents', docId);
    await updateDoc(docRef, {
      status,
      ...(note ? { note } : {}),
      updatedAt: new Date().toISOString(),
    });
    await logAuditEvent(
      appId,
      auth.currentUser?.uid || 'officer',
      'officer',
      'DOCUMENT_STATUS_UPDATE',
      `Document ${docId} status modified to ${status}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `applications/${appId}/documents/${docId}`);
  }
}

// Fetch Consistency Matrix
export async function getConsistencyMatrix(appId: string): Promise<Record<number, MatrixRowData>> {
  try {
    const snap = await getDocs(collection(db, 'applications', appId, 'consistency_checks'));
    if (snap.empty) {
      return MATRIX_DATA;
    }
    const result: Record<number, MatrixRowData> = {};
    snap.forEach((d) => {
      const data = d.data() as MatrixRowData;
      result[data.id] = data;
    });
    return result;
  } catch (error) {
    console.warn('Falling back to local matrix data:', error);
    return MATRIX_DATA;
  }
}

// Fetch Adjudication
export async function getLatestAdjudication(appId: string): Promise<AdjudicationRecord | null> {
  try {
    const snap = await getDocs(collection(db, 'applications', appId, 'adjudications'));
    if (snap.empty) return null;
    const records = snap.docs.map((d) => d.data() as AdjudicationRecord);
    return records[records.length - 1];
  } catch (error) {
    console.warn('Falling back to local adjudication state:', error);
    return null;
  }
}

// Save Adjudication
export async function saveAdjudication(
  appId: string,
  record: Omit<AdjudicationRecord, 'id' | 'timestamp'>
): Promise<void> {
  try {
    const adjId = `adj-${Date.now()}`;
    const fullRecord: AdjudicationRecord = {
      ...record,
      id: adjId,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'applications', appId, 'adjudications', adjId), fullRecord);

    // Update application status
    let appStatus: ApplicationRecord['status'] = 'under_scrutiny';
    if (record.decision === 'show-cause') appStatus = 'flagged';
    if (record.decision === 'accepted') appStatus = 'approved';
    if (record.decision === 'overridden') appStatus = 'under_scrutiny';

    await updateDoc(doc(db, 'applications', appId), {
      status: appStatus,
      updatedAt: new Date().toISOString(),
    });

    await logAuditEvent(
      appId,
      record.officerUid,
      'officer',
      'OFFICER_ADJUDICATION',
      `Officer recorded decision: ${record.decision.toUpperCase()}. Proof Hash: ${record.proofHash}`
    );
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, `applications/${appId}/adjudications`);
    } catch (e) {
      console.warn('Adjudication write caught:', e);
    }
  }
}

// Log audit event
export async function logAuditEvent(
  applicationId: string,
  actorUid: string,
  actorRole: string,
  action: string,
  details: string
): Promise<void> {
  try {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const record: AuditLogRecord = {
      id: logId,
      applicationId,
      actorUid,
      actorRole,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'audit_logs', logId), record);
  } catch (error) {
    console.warn('Failed to log audit event:', error);
  }
}

// Fetch all audit logs
export async function getAuditLogs(applicationId?: string): Promise<AuditLogRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'audit_logs'));
    const list: AuditLogRecord[] = [];
    snap.forEach((d) => list.push(d.data() as AuditLogRecord));
    list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (applicationId) {
      return list.filter((l) => l.applicationId === applicationId);
    }
    return list;
  } catch (error) {
    console.warn('Failed to fetch audit logs:', error);
    return [];
  }
}

// Preloaded benchmark OCR results for standard demo documents
export const DEFAULT_DEMO_OCR_RESULTS: Record<string, DocumentOcrResult> = {
  'doc-2': {
    id: 'ocr-doc-2-demo',
    documentId: 'doc-2',
    applicationId: 'app-vitm-2025',
    fileName: 'Land_Sale_Deed_Registered_3892_BK-I.pdf',
    fileSizeBytes: 14800000,
    mimeType: 'application/pdf',
    sha256Hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    pageCount: 4,
    isSearchablePdf: false,
    category: 'land_sale_deed',
    categoryLabel: 'Land Registered Sale Deed / 30-Year Lease',
    categoryConfidence: 97.8,
    status: 'needs_review',
    rawFullText: `GOVERNMENT OF KARNATAKA
DEPARTMENT OF STAMPS AND REGISTRATION
SUB-REGISTRAR OFFICE: BANGALORE SOUTH
REGISTERED DEED OF CONVEYANCE NO: 3892/2014-15 BOOK-I
Execution Date: 14th November 2014
Vendor: M/s Bellandur Agro Estates LLP
Purchaser / Conveyee: Shri Vishweshwaraya Educational Trust (Reg. No: BLR-IV-7489)
Schedule Property Description:
All that piece and parcel of converted non-agricultural educational land comprised in:
Survey No. 142/1: Measuring 1 Acre 20 Guntas
Survey No. 142/2: Measuring 0 Acre 36 Guntas
Total Aggregate Contiguous Extent: 2 Acres 16 Guntas (Equivalent to 2.40 Acres net)
Boundaries:
East by: Sy No. 143 Public Road (60 ft)
West by: Private Property
North by: Sy No. 141 Canal
South by: National Highway 44 Service Road
Encumbrance: 30-Year Absolute Unencumbered Title for Educational Purpose.
Stamp Duty Paid: Rs. 4,20,000 via Challan #e-STAMP-8841-KAVERI`,
    extractedFields: [
      {
        key: 'registration_number',
        label: 'Deed Registration Number',
        rawText: '3892/2014-15 BOOK-I',
        normalizedValue: '3892/BK-I',
        confidence: 99.4,
        pageNumber: 1,
        boundingBox: { x: 12, y: 15, width: 34, height: 4 },
        reviewStatus: 'verified',
      },
      {
        key: 'sub_registrar_office',
        label: 'Sub-Registrar District Office',
        rawText: 'SUB-REGISTRAR OFFICE: BANGALORE SOUTH',
        normalizedValue: 'Bangalore South (Zone IV)',
        confidence: 98.7,
        pageNumber: 1,
        boundingBox: { x: 12, y: 19, width: 45, height: 3.5 },
        reviewStatus: 'verified',
      },
      {
        key: 'execution_date',
        label: 'Date of Deed Execution',
        rawText: '14th November 2014',
        normalizedValue: '2014-11-14',
        confidence: 99.1,
        pageNumber: 1,
        boundingBox: { x: 12, y: 23, width: 28, height: 3.5 },
        reviewStatus: 'verified',
      },
      {
        key: 'purchaser_name',
        label: 'Conveyee / Registered Trust',
        rawText: 'Shri Vishweshwaraya Educational Trust',
        normalizedValue: 'Vishweshwaraya Educational Trust',
        confidence: 97.2,
        pageNumber: 1,
        boundingBox: { x: 12, y: 28, width: 52, height: 4 },
        reviewStatus: 'verified',
        portalDeclaredValue: 'Vishweshwaraya Institute of Technology & Management',
      },
      {
        key: 'cadastral_survey_numbers',
        label: 'Cadastre Survey Numbers',
        rawText: 'Survey No. 142/1 & Survey No. 142/2',
        normalizedValue: 'Sy. No. 142/1, 142/2',
        confidence: 96.5,
        pageNumber: 2,
        boundingBox: { x: 14, y: 42, width: 48, height: 5 },
        reviewStatus: 'verified',
        portalDeclaredValue: 'Sy. No. 142/1, 142/2, 142/3',
      },
      {
        key: 'contiguous_land_area',
        label: 'Contiguous Conveyed Land Area',
        rawText: 'Total Aggregate Contiguous Extent: 2 Acres 16 Guntas (Equivalent to 2.40 Acres net)',
        normalizedValue: '2.40 Acres',
        confidence: 99.6,
        pageNumber: 2,
        boundingBox: { x: 10, y: 55, width: 80, height: 10 },
        reviewStatus: 'mismatch',
        portalDeclaredValue: '4.20 Acres',
        statutoryRuleRef: 'AICTE APH 2024-25 Appx 4 Cl. 4.14(b)',
        anomalyReason: 'Declared 4.20 Acres on AICTE Web Portal, but Title Deed certifies only 2.40 Acres (-1.80 Acres Deficit / 42.8% Shortfall). Violates Metro minimum 4.00 Acre threshold.',
      },
      {
        key: 'encumbrance_status',
        label: 'Title Encumbrance & Term',
        rawText: '30-Year Absolute Unencumbered Title for Educational Purpose',
        normalizedValue: '30-Year Unencumbered',
        confidence: 95.8,
        pageNumber: 3,
        boundingBox: { x: 12, y: 72, width: 65, height: 4.5 },
        reviewStatus: 'verified',
      },
    ],
    processingDurationMs: 840,
    engineUsed: 'Google Gemini 3.8 Flash (Multimodal OCR Engine)',
    preprocessed: {
      deskewApplied: true,
      rotationDegrees: 0,
      contrastEnhanced: true,
    },
    createdAt: '2026-10-18T10:15:35Z',
    updatedAt: '2026-10-18T10:15:35Z',
  },
  'doc-1': {
    id: 'ocr-doc-1-demo',
    documentId: 'doc-1',
    applicationId: 'app-vitm-2025',
    fileName: 'Trust_Society_Registration_BLR-IV-7489.pdf',
    fileSizeBytes: 2400000,
    mimeType: 'application/pdf',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    pageCount: 3,
    isSearchablePdf: true,
    category: 'trust_registration',
    categoryLabel: 'Trust/Society Registration Certificate',
    categoryConfidence: 99.5,
    status: 'completed',
    rawFullText: `GOVERNMENT OF KARNATAKA
OFFICE OF THE REGISTRAR OF SOCIETIES & TRUSTS
CERTIFICATE OF REGISTRATION UNDER SOCIETIES REGISTRATION ACT 1960
Registration No: BLR-IV-7489/1998-99
Date: 12th August 1998
Name of Society: Shri Vishweshwaraya Educational Trust
Registered Address: #42 Vidya Soudha, Outer Ring Road, Bengaluru - 560103
Objects: Establishment and management of technical and professional collegiate institutions.`,
    extractedFields: [
      {
        key: 'trust_registration_no',
        label: 'Society / Trust Registration No.',
        rawText: 'Registration No: BLR-IV-7489/1998-99',
        normalizedValue: 'BLR-IV-7489',
        confidence: 99.7,
        pageNumber: 1,
        boundingBox: { x: 15, y: 22, width: 45, height: 4 },
        reviewStatus: 'verified',
      },
      {
        key: 'trust_name',
        label: 'Registered Trust Legal Name',
        rawText: 'Shri Vishweshwaraya Educational Trust',
        normalizedValue: 'Shri Vishweshwaraya Educational Trust',
        confidence: 99.4,
        pageNumber: 1,
        boundingBox: { x: 15, y: 32, width: 55, height: 4.5 },
        reviewStatus: 'verified',
      },
    ],
    processingDurationMs: 620,
    engineUsed: 'Google Gemini 3.8 Flash (Multimodal OCR Engine)',
    preprocessed: {
      deskewApplied: false,
      rotationDegrees: 0,
      contrastEnhanced: true,
    },
    createdAt: '2026-10-18T10:14:05Z',
    updatedAt: '2026-10-18T10:14:05Z',
  },
  'doc-3': {
    id: 'ocr-doc-3-demo',
    documentId: 'doc-3',
    applicationId: 'app-vitm-2025',
    fileName: 'Karnataka_Fire_Services_NOC_2023.pdf',
    fileSizeBytes: 1100000,
    mimeType: 'application/pdf',
    sha256Hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    pageCount: 2,
    isSearchablePdf: true,
    category: 'fire_safety_noc',
    categoryLabel: 'State Fire & Rescue Safety NOC',
    categoryConfidence: 98.9,
    status: 'needs_review',
    rawFullText: `KARNATAKA STATE FIRE AND RESCUE SERVICES DEPARTMENT
OFFICE OF THE CHIEF FIRE OFFICER, BENGALURU ZONE
NO: C-NOC/KSFRS/BLR/2023/1049
Validity Period: Valid for ONE YEAR ONLY from date of issue, expiring on: 31st March 2024.`,
    extractedFields: [
      {
        key: 'noc_number',
        label: 'Fire NOC Certificate Number',
        rawText: 'NO: C-NOC/KSFRS/BLR/2023/1049',
        normalizedValue: 'C-NOC/KSFRS/BLR/2023/1049',
        confidence: 99.2,
        pageNumber: 1,
        boundingBox: { x: 15, y: 18, width: 45, height: 4 },
        reviewStatus: 'verified',
      },
      {
        key: 'expiry_date',
        label: 'Fire Safety NOC Expiry Date',
        rawText: 'expiring on: 31st March 2024',
        normalizedValue: '2024-03-31',
        confidence: 99.8,
        pageNumber: 1,
        boundingBox: { x: 12, y: 62, width: 55, height: 6 },
        reviewStatus: 'mismatch',
        portalDeclaredValue: 'Valid through 2026 Academic Session',
        statutoryRuleRef: 'AICTE APH 2024-25 Cl. 6.3',
        anomalyReason: 'Certificate expired on 31 March 2024. Non-compliant with statutory life-safety mandate.',
      },
    ],
    processingDurationMs: 510,
    engineUsed: 'Google Gemini 3.8 Flash (Multimodal OCR Engine)',
    preprocessed: {
      deskewApplied: false,
      rotationDegrees: 0,
      contrastEnhanced: true,
    },
    createdAt: '2026-10-18T10:16:15Z',
    updatedAt: '2026-10-18T10:16:15Z',
  },
};

// In-memory cache for fast responsive lookups and offline fallback
const localOcrCache: Record<string, DocumentOcrResult> = { ...DEFAULT_DEMO_OCR_RESULTS };

// Fetch OCR result for a document
export async function getDocumentOcrResult(
  appId: string,
  docId: string
): Promise<DocumentOcrResult | null> {
  const cacheKey = `${appId}_${docId}`;
  if (localOcrCache[cacheKey]) {
    return localOcrCache[cacheKey];
  }
  if (localOcrCache[docId]) {
    return localOcrCache[docId];
  }

  try {
    const docRef = doc(db, 'applications', appId, 'documents', docId, 'ocr', 'latest');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as DocumentOcrResult;
      localOcrCache[cacheKey] = data;
      return data;
    }
  } catch (error) {
    console.warn('OCR lookup fallback to demo cache for', docId, error);
  }

  return DEFAULT_DEMO_OCR_RESULTS[docId] || null;
}

// Save OCR result to Firestore and local cache
export async function saveDocumentOcrResult(
  appId: string,
  docId: string,
  result: DocumentOcrResult
): Promise<void> {
  const cacheKey = `${appId}_${docId}`;
  localOcrCache[cacheKey] = result;
  localOcrCache[docId] = result;

  try {
    const docRef = doc(db, 'applications', appId, 'documents', docId, 'ocr', 'latest');
    await setDoc(docRef, result);

    await logAuditEvent(
      appId,
      auth.currentUser?.uid || 'applicant',
      'applicant',
      'OCR_EXTRACTION_COMPLETED',
      `OCR extracted ${result.extractedFields.length} statutory invariants from ${result.fileName} using ${result.engineUsed}. Status: ${result.status}`
    );
  } catch (error) {
    console.warn('Saved OCR result to reactive memory (Firestore write deferred):', error);
  }
}

// Officer authorized field correction with immutable audit trail
export async function updateOcrFieldCorrection(
  appId: string,
  docId: string,
  fieldKey: string,
  correction: {
    correctedValue: string;
    correctionReason: string;
    officerName: string;
    officerUid: string;
  }
): Promise<DocumentOcrResult | null> {
  const existing = await getDocumentOcrResult(appId, docId);
  if (!existing) return null;

  const updatedFields = existing.extractedFields.map((field) => {
    if (field.key === fieldKey) {
      return {
        ...field,
        correctedValue: correction.correctedValue,
        correctionReason: correction.correctionReason,
        correctedBy: correction.officerName,
        correctedAt: new Date().toISOString(),
        reviewStatus: 'corrected' as const,
      };
    }
    return field;
  });

  const updatedResult: DocumentOcrResult = {
    ...existing,
    extractedFields: updatedFields,
    updatedAt: new Date().toISOString(),
  };

  await saveDocumentOcrResult(appId, docId, updatedResult);

  await logAuditEvent(
    appId,
    correction.officerUid,
    'officer',
    'OCR_FIELD_CORRECTION',
    `Officer ${correction.officerName} corrected field '${fieldKey}' to '${correction.correctedValue}'. Reason: "${correction.correctionReason}". Original raw OCR text preserved.`
  );

  return updatedResult;
}

