import { StatutoryDoc, Finding, MatrixRowData } from '../types';

export const INITIAL_STATUTORY_DOCS: StatutoryDoc[] = [
  {
    id: 'doc-1',
    number: '01.',
    title: 'Trust/Society Registration Certificate',
    type: 'PDF',
    size: '2.4 MB',
    authority: 'Sub-Registrar Blr-South',
    status: 'verified',
  },
  {
    id: 'doc-2',
    number: '02.',
    title: 'Land Registered Sale Deed / 30-Yr Lease',
    type: 'PDF',
    size: '14.8 MB',
    authority: 'String Discrepancy',
    status: 'flawed',
    note: 'String Discrepancy',
  },
  {
    id: 'doc-3',
    number: '03.',
    title: 'State Fire & Rescue Safety NOC',
    type: 'PDF',
    size: '1.1 MB',
    authority: 'Expired 12 Mar 2024',
    status: 'deficient',
    note: 'Expired 12 Mar 2024',
  },
  {
    id: 'doc-4',
    number: '04.',
    title: 'Approved Building Plan & Occupancy',
    type: 'OCR Scan',
    size: 'Clause 5.2 Geometric Audit',
    authority: 'Town Planning Authority',
    status: 'scanning',
    scanProgress: 68,
    note: 'OCR Scan · Clause 5.2 Geometric Audit',
  },
  {
    id: 'doc-5',
    number: '05.',
    title: 'AICTE Faculty Cadre Ratio & Form 16',
    type: 'PDF',
    size: 'Pending Submission',
    authority: 'Awaiting upload of certified payroll schedules',
    status: 'pending',
    note: 'Awaiting upload of certified payroll schedules',
  },
];

export const SCRUTINY_FINDINGS: Finding[] = [
  {
    id: 'find-1',
    code: '01.1',
    title: 'Clause 4.1 Land Area Variance',
    severity: 'high',
    description:
      'Land area mismatch: 2.40 acres on Registered Deed vs 4.20 acres declared on AICTE Web Portal. Deficit of 1.80 acres below mandatory zonal quota.',
    statuteRef: 'APH Cl. 4.14(B)',
    docCode: 'Doc #KA-BLR-892',
    activeFlags: 2,
    confidence: '94.2%',
    icon: 'domain',
  },
  {
    id: 'find-2',
    code: '01.2',
    title: 'Statutory Fire Safety NOC',
    severity: 'high',
    description:
      'Fire Safety clearance certificate expired prior to academic term commencement (Valid till 12 Mar 2024; required validity through May 2026).',
    statuteRef: 'APH Cl. 6.3',
    docCode: 'Cert #DFS-10842',
    activeFlags: 1,
    confidence: '99.0%',
    icon: 'local_fire_department',
  },
  {
    id: 'find-3',
    code: '01.3',
    title: 'Forensic Document Integrity',
    severity: 'high',
    description:
      'Suspected digital signature splice detected on Revenue Officer Khata Extract (Page 3). Compression artifact variance > 38%.',
    statuteRef: 'Forensic ELA',
    docCode: 'Doc #KA-REV-412',
    activeFlags: 1,
    confidence: '89.6%',
    icon: 'fingerprint',
  },
  {
    id: 'find-4',
    code: '01.4',
    title: 'Trust Deed Continuation',
    severity: 'moderate',
    description:
      'Society registration certificate renewed past statutory cut-off without an attached registered condonation deed.',
    statuteRef: 'Societies Reg. Act Sec. 13',
    docCode: 'Reg #SOC-4410',
    activeFlags: 1,
    confidence: '91.5%',
    icon: 'verified',
  },
  {
    id: 'find-5',
    code: '01.5',
    title: 'Faculty Cadre Ratio (CSE)',
    severity: 'moderate',
    description:
      'Cadre ratio deficiency in Computer Science & Engg Dept: Professor cadre verified at 0 versus 2 mandated under Section 7.4.',
    statuteRef: 'APH Sec 7.4',
    docCode: 'Payroll #FY-24-CSE',
    activeFlags: 1,
    confidence: '96.2%',
    icon: 'school',
  },
];

export const INSTITUTIONAL_INSTRUMENTS = [
  {
    id: 'inst-1',
    title: 'Land Deed (Sale)',
    docNumber: 'Doc #KA-BLR-892',
    confidence: '94.2%',
    statusBadge: 'CRITICAL',
    badgeClass: 'bg-error-container text-on-error-container font-semibold',
    icon: 'domain',
    flagsCount: 2,
    flagLabel: '2 Active Flags',
    flagClass: 'text-error',
    reviewPage: 'P. 02',
  },
  {
    id: 'inst-2',
    title: 'Fire Safety NOC',
    docNumber: 'Cert #DFS-10842',
    confidence: '99.0%',
    statusBadge: 'NON-COMP',
    badgeClass: 'bg-error-container text-on-error-container font-semibold',
    icon: 'local_fire_department',
    flagsCount: 1,
    flagLabel: '1 Active Flag',
    flagClass: 'text-error',
    reviewPage: 'P. 01',
  },
  {
    id: 'inst-3',
    title: 'Society Cert',
    docNumber: 'Reg #SOC-4410',
    confidence: '91.5%',
    statusBadge: 'WARNING',
    badgeClass: 'bg-secondary-container text-on-secondary-container font-semibold',
    icon: 'verified',
    flagsCount: 1,
    flagLabel: '1 Active Flag',
    flagClass: 'text-on-secondary-container',
    reviewPage: 'P. 03',
  },
  {
    id: 'inst-4',
    title: 'Building Blueprint',
    docNumber: 'Plan #BBMP-A84',
    confidence: '97.8%',
    statusBadge: '✓ COMPLIANT',
    badgeClass: 'bg-primary-fixed text-on-primary-fixed-variant font-semibold',
    icon: 'architecture',
    flagsCount: 0,
    flagLabel: '0 Flags',
    flagClass: 'text-primary',
    reviewPage: 'P. 04',
  },
];

export const MATRIX_DATA: Record<number, MatrixRowData> = {
  1: {
    id: 1,
    parameter: '01. Trust / Society Name',
    portalDeclaration: {
      title: 'Vishweshwaraya Education Trust',
      subtext: 'AFFIDAVIT DECLARED',
      badge: 'AFFIDAVIT DECLARED',
    },
    landDeed: {
      title: 'Shri Vishweshwaraya Edu Trust',
      subtext: '88% Fuzzy Match',
    },
    trustCert: {
      title: 'Vishweshwaraya Education Trust',
      subtext: '■ EXACT MATCH',
    },
    fireNoc: {
      title: 'VITM Campus',
      subtext: 'Campus Entity Alias',
    },
    sanction: {
      title: '-- Not Appended --',
      subtext: '',
    },
    inspector: {
      title: 'Parameter 01: Trust Entity Nomenclature Resolution',
      badgeText: 'MINOR DISCREPANCY',
      badgeClass: 'bg-secondary/10 text-secondary',
      sourceAField: 'Trust Title Registered',
      sourceAVal: 'Vishweshwaraya Education Trust',
      sourceADesc: 'Submitted in AICTE Institutional Portal Self-Assessment Affidavit.',
      sourceBField: 'Land Conveyance Deed Title',
      sourceBVal: 'Shri Vishweshwaraya Edu Trust',
      sourceBDesc: "Registered title deed uses abbreviation 'Edu' and prefix honorific 'Shri'.",
      analysis:
        'Fuzzy semantic distance is within institutional tolerance threshold (Levenshtein distance 0.88). Recommended resolution: Procure supplementary amendment endorsement from registrar of societies to avoid nominal variance.',
      statusText: 'Status: Informational Clarification',
      statusColor: 'secondary',
    },
  },
  2: {
    id: 2,
    parameter: '02. Campus Land Area',
    portalDeclaration: {
      title: '4.20 Acres',
      subtext: '17,000 sq.m',
    },
    landDeed: {
      title: '2.40 Acres',
      subtext: '-1.80 ACRE DEFICIT',
      hasDeficit: true,
    },
    trustCert: {
      title: '-- Not Specified --',
      subtext: '',
    },
    fireNoc: {
      title: '9,712 sq.m (2.40 Ac)',
      subtext: 'Authority Certified',
    },
    sanction: {
      title: '2.40 Acres (Sanctioned)',
      subtext: 'Discrepancy with Form',
      isDiscrepancy: true,
    },
    inspector: {
      title: 'Parameter 02: Campus Land Area Variance',
      badgeText: 'DEFICIT -42.8%',
      badgeClass: 'bg-error/10 text-error',
      sourceAField: 'Total Contiguous Land',
      sourceAVal: '4.20 Acres (182,952 sq.ft)',
      sourceADesc: '"We confirm our institution holds clear uninterrupted ownership of 4.20 Acres at Survey 142/1 & 142/2."',
      sourceBField: "Schedule 'A' Excerpt",
      sourceBVal: '2 Acres 16 Guntas (2.40 Acres)',
      sourceBDesc: '"All that piece and parcel measuring exactly 2.40 Acres bearing Sy. 142/1 bounded by East Canal road."',
      analysis:
        'Institutional declaration asserts 4.20 Acres, but instrument doc #DEED-1998-KA and Municipal Sanction #BMP-SAN-44 certify title ownership of exclusively 2.40 Acres. AICTE Regulation Section 3.2.1 mandates a minimum of 3.50 Acres for non-metro engineering faculties.',
      statusText: 'Status: Statutory Non-Compliance',
      statusColor: 'error',
    },
  },
  3: {
    id: 3,
    parameter: '03. Survey / Khasra No.',
    portalDeclaration: {
      title: 'Sy. No. 142/1, 142/2',
      subtext: 'Revenue Cadastre',
    },
    landDeed: {
      title: 'Sy. No. 142/1, 142/2',
      subtext: '■ BOUNDARY PARALLEL',
    },
    trustCert: {
      title: '-- Not Applicable --',
      subtext: '',
    },
    fireNoc: {
      title: 'Sy. No. 142/1, 142/2',
      subtext: 'Site Inspected',
    },
    sanction: {
      title: 'Sy. No. 142/1',
      subtext: 'Sub-plot 142/2 Absent',
      isDiscrepancy: true,
    },
    inspector: {
      title: 'Parameter 03: Cadastral Survey Division Alignment',
      badgeText: 'PARTIAL OMISSIONS',
      badgeClass: 'bg-secondary/10 text-secondary',
      sourceAField: 'Declared Revenue Plot',
      sourceAVal: 'Sy. No. 142/1 and 142/2',
      sourceADesc: 'Both contiguous revenue survey units declared under campus perimeter map.',
      sourceBField: 'Sanction Blueprint Reference',
      sourceBVal: 'Sy. No. 142/1 Exclusively',
      sourceBDesc: 'Municipal endorsement #BMP-SAN-44 lists Sy. 142/1 without reference to 142/2.',
      analysis:
        'Sub-plot 142/2 represents 0.85 Acres. While accounted in the land purchase instrument, municipal zoning authorization lacks endorsement for parcel 142/2. Potential hazard for structural occupancy.',
      statusText: 'Status: Documentation Pending',
      statusColor: 'secondary',
    },
  },
  4: {
    id: 4,
    parameter: '04. Authorized Signatory',
    portalDeclaration: {
      title: 'Dr. K. S. Ramanathan',
      subtext: 'Chairman & Trustee',
    },
    landDeed: {
      title: 'Late Shri V. Ramanathan',
      subtext: 'Succession Deed Needed',
    },
    trustCert: {
      title: 'Dr. K. S. Ramanathan',
      subtext: '■ RESOLUTION CONFIRMED',
    },
    fireNoc: {
      title: 'Dr. K. S. Ramanathan',
      subtext: 'Verified by CFO',
    },
    sanction: {
      title: 'Trustee Body',
      subtext: 'Corporate Execution',
    },
    inspector: {
      title: 'Parameter 04: Signatory Execution Chain-of-Title',
      badgeText: 'SUCCESSION ATTESTATION',
      badgeClass: 'bg-secondary/10 text-secondary',
      sourceAField: 'Active Statutory Signee',
      sourceAVal: 'Dr. K. S. Ramanathan',
      sourceADesc: 'Designated as Managing Trustee and Chairman in 2024 institutional filing.',
      sourceBField: '1998 Registered Title Instrument',
      sourceBVal: 'Late Shri V. Ramanathan',
      sourceBDesc: 'Executed as Founder-Trustee in original registered conveyance instruments.',
      analysis:
        'Lineage between original signatory (Late Shri V. Ramanathan) and currently declared head (Dr. K. S. Ramanathan) is corroborated by 2018 Trust Resolution #12, but probate or formal mutation decree is absent.',
      statusText: 'Status: Ancillary Document Required',
      statusColor: 'secondary',
    },
  },
};

export const AICTE_REGULATORY_INDEX = [
  {
    clause: 'APH Cl. 4.14(b)',
    title: 'Contiguous Land Area Thresholds for Mega & Metro Institutions',
    summary:
      'Institutions offering Under Graduate Degree programmes in Engineering & Technology in Mega/Metro cities must possess minimum contiguous land of 4.00 Acres (3.50 Acres in Urban, 7.50 Acres in Rural). Land must be unencumbered and registered in the name of the Applicant Society/Trust.',
    penalty: 'Strict withholding of Extension of Approval (EoA) or reduction of approved intake by 50%.',
    severity: 'High',
  },
  {
    clause: 'APH Cl. 6.3',
    title: 'Statutory Fire & Life Safety Clearance Continuity',
    summary:
      'A valid Fire NOC issued by the Director General of Fire and Emergency Services / Competent State Authority must cover the complete operational period of the academic session.',
    penalty: 'Immediate issuance of Show-Cause Notice; closure of non-compliant infrastructure blocks.',
    severity: 'High',
  },
  {
    clause: 'APH Cl. 7.4',
    title: 'Faculty Cadre Ratio & Cadre Distribution',
    summary:
      'The prescribed faculty-to-student cadre ratio is 1:20 for UG Engineering with cadre distribution of 1 Professor : 2 Associate Professors : 6 Assistant Professors. Institutions cannot run departments with 0 Professors.',
    penalty: 'Non-approval of new courses / reduction in batch division allocations.',
    severity: 'Moderate',
  },
  {
    clause: 'APH Cl. 5.2',
    title: 'Town Planning Building Approval & Occupancy Certificate (OC)',
    summary:
      'Master plan and individual building blueprints must bear seal endorsements of Town Planning Authority with explicit carpet and circulation area earmarks.',
    penalty: 'Physical inspection mandate by Regional Scrutiny Committee.',
    severity: 'Moderate',
  },
  {
    clause: 'APH Cl. 2.8',
    title: 'Name Consistency & Society Resolution Records',
    summary:
      'Discrepancies in the registered name of the Society/Trust across revenue records and portal declaration require a certified gazette affidavit or rectification deed.',
    penalty: 'Query generation in Scrutiny Committee ledger.',
    severity: 'Low',
  },
];
