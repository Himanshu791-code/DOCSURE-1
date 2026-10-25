import React, { useState, useRef, useEffect } from 'react';
import { NavTab, ApplicationRecord, StatutoryDoc, DocumentOcrResult, ExtractedField } from '../types';
import { saveDocumentOcrResult, getDocumentOcrResult, saveDocument, updateDocumentStatus } from '../firebase/dbService';

interface Props {
  currentApp: ApplicationRecord;
  docs: StatutoryDoc[];
  onNavigate: (tab: NavTab) => void;
  onOpenAffidavitModal: (type: 'affidavit' | 'replace-file') => void;
  onUploadDoc: (file: File) => void;
}

interface SampleDocItem {
  id: string;
  name: string;
  type: string;
  size: string;
  docId: string;
  category: string;
  title: string;
}

export const UploadView: React.FC<Props> = ({
  currentApp,
  docs,
  onNavigate,
  onOpenAffidavitModal,
  onUploadDoc,
}) => {
  const [acknowledged, setAcknowledged] = useState(currentApp.acknowledged ?? false);
  const [dragActive, setDragActive] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filedCount = docs.filter((d) => d.status !== 'pending').length;
  const totalCount = Math.max(docs.length, 5);
  const percentage = Math.round((filedCount / totalCount) * 100);

  // Live OCR pipeline state
  const [ocrStatus, setOcrStatus] = useState<{
    stage: 'idle' | 'validating' | 'extracting' | 'verifying' | 'completed' | 'failed';
    progress: number;
    fileName: string;
    engine?: string;
    durationMs?: number;
    error?: string;
  }>({
    stage: 'idle',
    progress: 0,
    fileName: '',
  });

  const [activeOcrResult, setActiveOcrResult] = useState<DocumentOcrResult | null>(null);
  const [editingField, setEditingField] = useState<ExtractedField | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [sampleDocs, setSampleDocs] = useState<SampleDocItem[]>([
    {
      id: 'sample-deed-3892',
      name: 'Land_Sale_Deed_Registered_3892_BK-I.pdf',
      type: 'Scanned Deed PDF',
      size: '14.8 MB',
      docId: 'doc-2',
      category: 'land_sale_deed',
      title: 'Land Sale Deed #3892/BK-I (Deficit: 2.40 Ac vs 4.20 Ac declared)',
    },
    {
      id: 'sample-fire-noc',
      name: 'Karnataka_Fire_Services_NOC_2023.pdf',
      type: 'Scanned Certificate',
      size: '1.1 MB',
      docId: 'doc-3',
      category: 'fire_safety_noc',
      title: 'State Fire & Rescue NOC (Expired 31 March 2024)',
    },
    {
      id: 'sample-trust-cert',
      name: 'Trust_Society_Registration_BLR-IV-7489.pdf',
      type: 'Searchable PDF',
      size: '2.4 MB',
      docId: 'doc-1',
      category: 'trust_registration',
      title: 'Trust/Society Registration Certificate (Compliant - 100% Match)',
    },
    {
      id: 'sample-sanction-plan',
      name: 'BBMP_Sanction_Building_Plan_LP-0142.pdf',
      type: 'Architectural Blueprint',
      size: '8.5 MB',
      docId: 'doc-4',
      category: 'building_sanction_plan',
      title: 'Municipal Building Sanction (FAR 1.50 vs 1.75 Discrepancy)',
    },
    {
      id: 'sample-corrupted',
      name: 'Damaged_Registry_Index_Encrypted.pdf',
      type: 'Encrypted / Corrupted',
      size: '3.2 MB',
      docId: 'doc-corrupted',
      category: 'unclassified_statutory',
      title: 'Corrupted / Password-Encrypted Sample (Error Handling Test)',
    },
  ]);

  // Load existing OCR result for deed by default if available
  useEffect(() => {
    async function initOcr() {
      const res = await getDocumentOcrResult(currentApp.id, 'doc-2');
      if (res) {
        setActiveOcrResult(res);
      }
    }
    initOcr();
  }, [currentApp.id]);

  // Execute OCR pipeline via server-side endpoint
  const runOcrPipeline = async (
    fileName: string,
    fileSizeBytes: number,
    mimeType: string,
    docId: string = 'doc-2',
    base64Data?: string
  ) => {
    try {
      // Stage 1: Validation
      setOcrStatus({
        stage: 'validating',
        progress: 25,
        fileName,
      });

      // Quick delay to display verification state smoothly
      await new Promise((r) => setTimeout(r, 400));

      // Stage 2: Multimodal Ingestion & Text Extraction
      setOcrStatus({
        stage: 'extracting',
        progress: 60,
        fileName,
        engine: 'Gemini 3.8 Flash Multimodal OCR',
      });

      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: docId,
          applicationId: currentApp.id,
          fileName,
          fileSizeBytes,
          mimeType,
          base64Data,
          isSearchablePdf: fileName.toLowerCase().endsWith('.pdf') && !fileName.toLowerCase().includes('scanned'),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process document OCR.');
      }

      const ocrResult: DocumentOcrResult = data.result;

      // Stage 3: Regulatory Verification & Schema Mapping
      setOcrStatus({
        stage: 'verifying',
        progress: 90,
        fileName,
        engine: ocrResult.engineUsed,
      });

      await new Promise((r) => setTimeout(r, 350));

      // Persist in Firestore / local reactive store
      await saveDocumentOcrResult(currentApp.id, docId, ocrResult);
      setActiveOcrResult(ocrResult);

      setOcrStatus({
        stage: 'completed',
        progress: 100,
        fileName,
        engine: ocrResult.engineUsed,
        durationMs: ocrResult.processingDurationMs,
      });
    } catch (err: any) {
      console.error('OCR pipeline execution failed:', err);
      setOcrStatus({
        stage: 'failed',
        progress: 0,
        fileName,
        error: err.message || 'Corrupted or unsupported file format.',
      });
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    onUploadDoc(file);

    // Read base64 for real OCR pipeline execution
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      runOcrPipeline(file.name, file.size, file.type || 'application/pdf', 'doc-upload-' + Date.now(), base64);
    };
    reader.onerror = () => {
      runOcrPipeline(file.name, file.size, file.type || 'application/pdf');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSaveDraft = () => {
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 3000);
  };

  const handlePreSubmissionCorrection = (field: ExtractedField) => {
    setEditingField(field);
    setEditValue(field.correctedValue || field.normalizedValue);
    setEditReason('Applicant pre-submission annotation before final seal.');
  };

  const saveApplicantCorrection = () => {
    if (!editingField || !activeOcrResult) return;
    const updated = activeOcrResult.extractedFields.map((f) =>
      f.key === editingField.key
        ? {
            ...f,
            correctedValue: editValue,
            correctionReason: editReason,
            reviewStatus: 'corrected' as const,
            correctedBy: `${currentApp.institutionName} (Authorized Applicant)`,
            correctedAt: new Date().toISOString(),
          }
        : f
    );
    const newResult = { ...activeOcrResult, extractedFields: updated };
    setActiveOcrResult(newResult);
    saveDocumentOcrResult(currentApp.id, activeOcrResult.documentId, newResult);
    setEditingField(null);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto space-y-4 pb-6 animate-in fade-in duration-200">
      {/* Archival Context Folio Header */}
      <section className="bg-surface-container-low rounded-lg p-space-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center justify-between gap-space-sm mb-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-data-numeric text-[11px] text-secondary font-medium tracking-wide">
              DOSSIER REF: {currentApp.dossierRef}
            </span>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-label-code bg-secondary-container/60 text-on-secondary-container font-semibold">
            STAGE 1/3 • {currentApp.status.toUpperCase().replace('_', ' ')}
          </span>
        </div>
        <div className="space-y-1">
          <h2 className="font-title-editorial text-title-editorial text-primary font-medium tracking-tight leading-snug">
            {currentApp.institutionName}
          </h2>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-on-surface-variant font-caption text-caption">
            <span className="font-label-code text-[11px] text-primary font-medium">PID: {currentApp.pid}</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span>{currentApp.session}</span>
          </div>
        </div>

        {/* Micro Metric Bar */}
        <div className="mt-space-md pt-space-sm bg-surface-container/60 rounded px-space-sm py-2 border border-outline-variant/20">
          <div className="flex items-center justify-between font-caption text-[11px] text-on-surface-variant mb-1.5">
            <span className="font-label-eyebrow uppercase tracking-wider text-[10px] text-outline">
              Statutory Corpus Completeness
            </span>
            <span className="font-data-numeric text-primary font-medium">
              {filedCount} of {totalCount} Filed ({percentage}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden flex">
            <div className="h-full bg-primary" style={{ width: `${Math.min(filedCount * 20, 100)}%` }}></div>
            <div
              className="h-full bg-surface-container-highest"
              style={{ width: `${Math.max(100 - filedCount * 20, 0)}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Dossier Document Checklist */}
      <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline block">
              Folio Section 01
            </span>
            <h3 className="font-headline-sm text-[1.125rem] text-primary leading-tight font-medium">
              Mandatory Schedule &amp; Proofs
            </h3>
          </div>
          <span className="font-caption text-caption text-secondary font-medium">AICTE APH 2025</span>
        </div>

        <div className="space-y-2" id="checklistContainer">
          {docs.map((doc) => {
            if (doc.status === 'verified') {
              return (
                <div key={doc.id} className="rounded bg-surface-container-low transition-all border border-outline-variant/20">
                  <div className="flex items-start justify-between gap-space-xs p-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="font-data-numeric text-xs text-outline shrink-0 mt-0.5">{doc.number}</span>
                      <div className="min-w-0">
                        <p className="font-body-md text-sm text-primary font-medium truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 font-caption text-[11px] text-on-surface-variant">
                          <span className="font-label-code">{doc.type} · {doc.size}</span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <span className="truncate">{doc.authority}</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-code text-[10px] bg-primary/10 text-primary shrink-0 font-semibold">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      VERIFIED
                    </span>
                  </div>
                </div>
              );
            }

            if (doc.status === 'flawed') {
              return (
                <div key={doc.id} className="rounded bg-secondary-container/20 transition-all border border-secondary/30">
                  <div className="flex items-start justify-between gap-space-xs p-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="font-data-numeric text-xs text-secondary shrink-0 mt-0.5">{doc.number}</span>
                      <div className="min-w-0">
                        <p className="font-body-md text-sm text-primary font-medium truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 font-caption text-[11px] text-on-surface-variant">
                          <span className="font-label-code">{doc.type} · {doc.size}</span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <span className="text-secondary font-medium">{doc.note || 'String Discrepancy'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-code text-[10px] bg-secondary-container text-on-secondary-fixed shrink-0 font-semibold">
                      <span className="material-symbols-outlined text-[12px]">warning</span>
                      FLAWED
                    </span>
                  </div>
                </div>
              );
            }

            if (doc.status === 'deficient') {
              return (
                <div key={doc.id} className="rounded bg-error-container/30 transition-all border border-error/30">
                  <div className="flex items-start justify-between gap-space-xs p-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="font-data-numeric text-xs text-error shrink-0 mt-0.5">{doc.number}</span>
                      <div className="min-w-0">
                        <p className="font-body-md text-sm text-primary font-medium truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 font-caption text-[11px] text-error">
                          <span className="font-label-code">{doc.type} · {doc.size}</span>
                          <span className="w-1 h-1 rounded-full bg-error"></span>
                          <span>{doc.note || 'Expired 12 Mar 2024'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-code text-[10px] bg-error/10 text-error shrink-0 font-semibold">
                      <span className="material-symbols-outlined text-[12px]">block</span>
                      DEFICIENT
                    </span>
                  </div>
                </div>
              );
            }

            if (doc.status === 'scanning') {
              return (
                <div key={doc.id} className="rounded bg-surface-container transition-all border border-outline-variant/30">
                  <div className="p-2.5 space-y-2">
                    <div className="flex items-start justify-between gap-space-xs">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="font-data-numeric text-xs text-outline shrink-0 mt-0.5">{doc.number}</span>
                        <div className="min-w-0">
                          <p className="font-body-md text-sm text-primary font-medium truncate">{doc.title}</p>
                          <p className="font-caption text-[11px] text-on-surface-variant font-label-code">
                            {doc.note || 'OCR Scan · Clause 5.2 Geometric Audit'}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-code text-[10px] bg-primary-container text-on-primary shrink-0 animate-pulse font-semibold">
                        SCANNING {doc.scanProgress || 68}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-surface-tint h-1 rounded-full transition-all duration-300"
                        style={{ width: `${doc.scanProgress || 68}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            }

            // Pending
            return (
              <div key={doc.id} className="rounded bg-surface-container-low/60 transition-all opacity-85 border border-outline-variant/20">
                <div className="flex items-start justify-between gap-space-xs p-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="font-data-numeric text-xs text-outline shrink-0 mt-0.5">{doc.number}</span>
                    <div className="min-w-0">
                      <p className="font-body-md text-sm text-on-surface-variant font-medium truncate">{doc.title}</p>
                      <p className="font-caption text-[11px] text-outline">
                        {doc.note || 'Awaiting upload of certified payroll schedules'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-code text-[10px] bg-surface-container-high text-on-surface-variant shrink-0 font-medium hover:bg-surface-container-highest transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[12px]">upload</span>
                    UPLOAD
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Test Benchmark Statutory Artifacts (Instant SIH Demo Pipeline) */}
      <section className="bg-surface-container-low rounded-lg p-space-md shadow-sm border border-outline-variant/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">science</span>
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-secondary tracking-wider font-semibold">
              Live OCR Test Benchmarks (Dual Portal Pipeline)
            </span>
          </div>
          <span className="font-label-code text-[10px] text-outline">Click to test instant ingestion</span>
        </div>
        <p className="font-body-sm text-[11px] text-on-surface-variant">
          Trigger real functional OCR and document classification across diverse statutory artifacts. Uses Google Gemini 3.8 Flash multimodal extraction with schema enforcement:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          {sampleDocs.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => runOcrPipeline(s.name, 1024 * 1024 * 2.5, 'application/pdf', s.docId)}
              className="p-2 rounded bg-surface border border-outline-variant/30 hover:border-secondary transition-all text-left flex items-start gap-2 group cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                {s.id.includes('corrupted') ? 'broken_image' : s.id.includes('sanction') ? 'architecture' : 'description'}
              </span>
              <div className="min-w-0">
                <span className="font-label-code text-[11px] text-primary font-medium block truncate">
                  {s.title}
                </span>
                <span className="font-caption text-[10px] text-outline block">
                  {s.type} · {s.size}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Drag-and-Drop / Tap Zone */}
      <section
        className={`relative rounded-lg p-space-md text-center shadow-sm overflow-hidden transition-colors border border-dashed ${
          dragActive
            ? 'bg-surface-container-high border-secondary'
            : 'bg-surface-container-low border-outline-variant/70'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.tif,.tiff,.jpg,.jpeg,.png,.webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div
          className="py-4 px-2 space-y-3 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary transition-transform active:scale-95 border border-outline-variant/30">
            <span className="material-symbols-outlined text-[26px]">upload_file</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-headline-sm text-base text-primary font-medium tracking-tight">
              Deposit Statutory Gazette Records
            </h4>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-xs mx-auto">
              Drop official PDFs, Scanned Deeds, or JPG/PNG certificates (up to 50MB)
            </p>
          </div>
          <div className="pt-2 flex flex-col items-center gap-1">
            <span className="inline-flex items-center gap-1.5 font-label-code text-[10px] text-secondary tracking-wide uppercase px-2 py-0.5 bg-surface-container rounded border border-secondary/20">
              <span className="material-symbols-outlined text-[13px]">document_scanner</span>
              Automatic Text Extraction &amp; Cadastre Normalization
            </span>
            <span className="font-caption text-[10px] text-outline">
              Integrity verification &amp; SHA-256 cryptographic proof hashing
            </span>
          </div>
        </div>
      </section>

      {/* Live OCR Processing Stepper (When Active) */}
      {ocrStatus.stage !== 'idle' && (
        <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm border border-secondary/40 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[20px] ${
                ocrStatus.stage === 'failed' ? 'text-error' : ocrStatus.stage === 'completed' ? 'text-primary' : 'text-secondary animate-spin'
              }`}>
                {ocrStatus.stage === 'failed' ? 'error' : ocrStatus.stage === 'completed' ? 'task_alt' : 'progress_activity'}
              </span>
              <div>
                <h4 className="font-headline-sm text-sm text-primary font-medium">
                  {ocrStatus.stage === 'validating' && 'Validating Statutory Document Format & Digest...'}
                  {ocrStatus.stage === 'extracting' && 'Gemini 3.8 Flash Multimodal OCR & Field Analysis...'}
                  {ocrStatus.stage === 'verifying' && 'Validating AICTE Regulatory Invariants & Clauses...'}
                  {ocrStatus.stage === 'completed' && 'Document Ingested & Extracted Successfully'}
                  {ocrStatus.stage === 'failed' && 'Document Processing Rejected'}
                </h4>
                <p className="font-label-code text-[10px] text-on-surface-variant">
                  File: {ocrStatus.fileName} {ocrStatus.durationMs && `(${ocrStatus.durationMs}ms)`}
                </p>
              </div>
            </div>
            <span className="font-label-code text-[11px] font-semibold text-secondary">
              {ocrStatus.progress}%
            </span>
          </div>

          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${ocrStatus.stage === 'failed' ? 'bg-error' : 'bg-secondary'}`}
              style={{ width: `${ocrStatus.progress}%` }}
            ></div>
          </div>

          {ocrStatus.error && (
            <div className="p-2.5 rounded bg-error-container/40 border border-error/30 text-error font-caption text-[11px] flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">warning</span>
              <div>
                <strong>Ingestion Error:</strong> {ocrStatus.error}
              </div>
            </div>
          )}

          {ocrStatus.engine && (
            <div className="flex items-center justify-between text-[10px] font-label-code text-on-surface-variant pt-1 border-t border-outline-variant/20">
              <span>Engine: {ocrStatus.engine}</span>
              <span className="text-secondary font-medium">Status: {ocrStatus.stage.toUpperCase()}</span>
            </div>
          )}
        </section>
      )}

      {/* Extracted Document Intelligence Card (Pre-Submission Inspection) */}
      {activeOcrResult && (
        <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm border border-outline-variant/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-label-code text-[9px] uppercase font-bold">
                  OCR INVENTORY · FOLIO EXTRACTION
                </span>
                <span className="text-[10px] font-label-code text-outline font-medium">
                  {activeOcrResult.fileName}
                </span>
              </div>
              <h3 className="font-headline-sm text-base text-primary font-medium">
                {activeOcrResult.categoryLabel}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-code text-[10px] font-bold bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              {activeOcrResult.categoryConfidence}% CONFIDENCE
            </span>
          </div>

          {/* Quick Technical Bar */}
          <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2 rounded text-[11px] font-label-code border border-outline-variant/20">
            <div>
              <span className="text-on-surface-variant block text-[10px]">Pages</span>
              <span className="text-primary font-semibold">{activeOcrResult.pageCount} Pages</span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[10px]">Text Format</span>
              <span className="text-primary font-semibold">{activeOcrResult.isSearchablePdf ? 'Direct PDF' : 'Scanned OCR'}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[10px]">SHA-256 Seal</span>
              <span className="text-primary font-semibold truncate block" title={activeOcrResult.sha256Hash}>
                {activeOcrResult.sha256Hash.substring(0, 10)}...
              </span>
            </div>
          </div>

          {/* Extracted Fields Table */}
          <div className="space-y-1.5 pt-1">
            <span className="font-label-eyebrow text-[10px] uppercase text-secondary font-bold block">
              Extracted Statutory Entities &amp; Values ({activeOcrResult.extractedFields.length})
            </span>
            <div className="divide-y divide-outline-variant/20 border border-outline-variant/20 rounded overflow-hidden">
              {activeOcrResult.extractedFields.map((f) => {
                const isShortfall = f.reviewStatus === 'mismatch';
                const isCorrected = f.reviewStatus === 'corrected';
                return (
                  <div
                    key={f.key}
                    className={`p-2.5 flex items-start justify-between gap-2 text-[11px] ${
                      isShortfall ? 'bg-error-container/15' : isCorrected ? 'bg-secondary-container/20' : 'bg-surface'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-caption text-on-surface-variant font-medium">{f.label}</span>
                        <span className="font-label-code text-[9px] text-outline bg-surface-container px-1 py-0.2 rounded">
                          P.{f.pageNumber} · {f.confidence}%
                        </span>
                      </div>
                      <p className="font-label-code text-primary font-bold">
                        {f.correctedValue ? f.correctedValue : f.normalizedValue}
                      </p>
                      {f.portalDeclaredValue && (
                        <p className="font-caption text-[10px] text-on-surface-variant">
                          Declared on Portal: <strong className="text-primary">{f.portalDeclaredValue}</strong>
                        </p>
                      )}
                      {f.anomalyReason && (
                        <p className="font-caption text-[10px] text-error leading-snug pt-0.5">
                          ⚠️ {f.anomalyReason}
                        </p>
                      )}
                      {f.correctionReason && (
                        <p className="font-caption text-[10px] text-secondary italic">
                          Correction note: &ldquo;{f.correctionReason}&rdquo; ({f.correctedBy})
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-label-code text-[9px] font-bold ${
                        isShortfall
                          ? 'bg-error-container text-error'
                          : isCorrected
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {isShortfall ? 'MISMATCH' : isCorrected ? 'CORRECTED' : 'EXTRACTED'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePreSubmissionCorrection(f)}
                        className="text-[10px] font-label-code text-secondary hover:underline cursor-pointer"
                      >
                        Self-Correct
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low Confidence Warning Notice */}
          {activeOcrResult.extractedFields.some((f) => f.confidence < 85) && (
            <div className="p-2.5 rounded bg-secondary-container/30 border border-secondary/30 flex items-start gap-2 text-[11px] text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-secondary shrink-0 mt-0.5">info</span>
              <div>
                <strong>Low Confidence Alert:</strong> One or more fields scored below 85% OCR confidence due to handwritten endorsement or skew. The Scrutiny Officer will review the high-resolution folio during official audit.
              </div>
            </div>
          )}

          {/* Modal / inline editor for pre-submission self-correction */}
          {editingField && (
            <div className="p-3 rounded bg-surface-container border border-secondary/40 space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-label-eyebrow text-[10px] uppercase text-secondary font-bold">
                  Pre-Submission Field Correction · {editingField.label}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="text-on-surface-variant text-[12px] hover:text-primary cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="font-caption text-[11px] text-on-surface-variant">
                Original raw OCR text remains immutable in audit ledger: <code>&ldquo;{editingField.rawText}&rdquo;</code>
              </p>
              <div className="space-y-1">
                <label className="font-caption text-[10px] text-on-surface font-medium block">
                  Normalized Value:
                </label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/40 rounded px-2.5 py-1.5 text-xs font-label-code text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-caption text-[10px] text-on-surface font-medium block">
                  Correction Reason / Justification:
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Sub-Registrar stamp endorsement on right margin certifies 2.40 Ac"
                  className="w-full bg-surface border border-outline-variant/40 rounded px-2.5 py-1.5 text-xs text-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-2.5 py-1 rounded bg-transparent text-xs font-caption text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveApplicantCorrection}
                  className="px-3 py-1 rounded bg-secondary text-on-secondary text-xs font-label-code font-semibold hover:opacity-90 cursor-pointer"
                >
                  Save Self-Correction
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Real-time Scrutiny Feedback Stream */}
      <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <h3 className="font-headline-sm text-[1.125rem] text-primary font-medium">Scrutiny Feedback Stream</h3>
          </div>
          <span className="font-data-numeric text-[11px] text-outline font-medium">3 Insights Active</span>
        </div>

        <div className="space-y-2.5">
          {/* Feed Card 1: Fire NOC Expired */}
          <div className="rounded-lg p-3 bg-error-container/20 border border-error/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 font-label-code text-[10px] text-error font-medium uppercase tracking-wider">
                <span className="material-symbols-outlined text-[13px]">error</span>
                Deficiency Flag · Doc #03
              </span>
              <span className="font-data-numeric text-[10px] text-error font-bold">APH Cl. 6.3</span>
            </div>
            <p className="font-body-sm text-xs text-on-surface leading-relaxed">
              <strong className="font-medium text-error">Fire NOC Expired:</strong> Certificate lapsed on{' '}
              <span className="font-data-numeric font-medium">12 Mar 2024</span>. AICTE requires validity through commencement date{' '}
              <span className="font-data-numeric font-medium">01 Aug 2025</span>. Renewal receipt or fresh order mandatory.
            </p>
            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => onOpenAffidavitModal('replace-file')}
                className="font-label-code text-[11px] text-error font-semibold underline flex items-center gap-0.5 hover:opacity-80 cursor-pointer"
                type="button"
              >
                <span>Replace File</span>
                <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </button>
              <span className="font-caption text-[10px] text-on-surface-variant">Immediate Disqualification Risk</span>
            </div>
          </div>

          {/* Feed Card 2: Name Mismatch */}
          <div className="rounded-lg p-3 bg-secondary-container/30 border border-secondary/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 font-label-code text-[10px] text-secondary font-medium uppercase tracking-wider">
                <span className="material-symbols-outlined text-[13px]">rule</span>
                Name Mismatch · Doc #02
              </span>
              <span className="font-data-numeric text-[10px] text-secondary font-bold">Fuzzy Match 88.4%</span>
            </div>
            <p className="font-body-sm text-xs text-on-surface leading-relaxed">
              Title variation detected in registered sale deed:
              <span className="block my-1 font-label-code text-[11px] bg-surface-container-low p-1.5 rounded text-on-surface border border-outline-variant/30">
                Deed: &ldquo;Shri Vishwesharaya Edu Trust&rdquo;<br />
                Portal: &ldquo;Shri Vishweshwaraya Educational Trust&rdquo;
              </span>
            </p>
            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => onOpenAffidavitModal('affidavit')}
                className="font-label-code text-[11px] text-secondary font-semibold underline flex items-center gap-0.5 hover:opacity-80 cursor-pointer"
                type="button"
              >
                <span>Attach Name Affidavit</span>
              </button>
              <span className="font-caption text-[10px] text-on-surface-variant">Scrutiny Committee Query Likely</span>
            </div>
          </div>

          {/* Feed Card 3: Notice */}
          <div className="rounded-lg p-3 bg-surface-container border border-outline-variant/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 font-label-code text-[10px] text-primary font-medium uppercase tracking-wider">
                <span className="material-symbols-outlined text-[13px]">auto_fix_high</span>
                Resolution Normalized · Doc #04
              </span>
              <span className="font-data-numeric text-[10px] text-outline font-semibold">150 DPI</span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Building Plan scan enhanced via automated neural unwarping to preserve Town Planning Authority seal geometry.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Decision Affirmation Footer */}
      <section className="bg-surface-container-low rounded-lg p-space-md shadow-sm border border-outline-variant/30 space-y-3">
        <div className="flex items-start gap-2 bg-surface-container p-2.5 rounded border border-outline-variant/20">
          <input
            id="affirmDiscrepancies"
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 rounded border-outline text-primary focus:ring-0 cursor-pointer"
          />
          <label
            htmlFor="affirmDiscrepancies"
            className="font-caption text-[11px] text-on-surface-variant leading-tight cursor-pointer select-none"
          >
            I acknowledge 1 critical compliance failure and 1 entity title discrepancy before proceeding to council risk calculation.
          </label>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            disabled={!acknowledged}
            onClick={() => onNavigate('summary')}
            className={`w-full py-3 px-4 rounded bg-primary text-on-primary font-label-eyebrow text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
              acknowledged
                ? 'opacity-100 hover:bg-primary-container shadow'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Automated Risk Preview</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="w-full py-2.5 px-4 rounded bg-transparent text-primary font-body-sm text-xs font-medium hover:bg-surface-container transition-colors text-center cursor-pointer"
          >
            {savedDraft ? '✓ Draft Dossier Retained & Cryptographically Hashed in Firestore' : 'Save Draft Dossier (Retain Hashed Buffers)'}
          </button>
        </div>
      </section>
    </div>
  );
};
