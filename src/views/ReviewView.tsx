import React, { useState, useEffect } from 'react';
import { NavTab, ApplicationRecord, StatutoryDoc, DocumentOcrResult, ExtractedField } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  saveAdjudication,
  getLatestAdjudication,
  getDocumentOcrResult,
  updateOcrFieldCorrection,
} from '../firebase/dbService';

interface Props {
  currentApp: ApplicationRecord;
  docs: StatutoryDoc[];
  onNavigate: (tab: NavTab) => void;
  onOpenClauseModal: (clause: string) => void;
  onAdjudicationSaved: () => void;
}

export const ReviewView: React.FC<Props> = ({
  currentApp,
  docs,
  onNavigate,
  onOpenClauseModal,
  onAdjudicationSaved,
}) => {
  const { currentUser } = useAuth();
  const [selectedDocId, setSelectedDocId] = useState<string>(docs[1]?.id || docs[0]?.id || 'doc-2');
  const [activePage, setActivePage] = useState<'P.01' | 'P.02' | 'P.03' | 'P.04'>('P.02');
  const [heatmapOn, setHeatmapOn] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'fields' | 'authenticity' | 'compliance'>('compliance');
  const [viewMode, setViewMode] = useState<'folio' | 'side-by-side' | 'raw-text'>('folio');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredFieldKey, setHoveredFieldKey] = useState<string | null>(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>('contiguous_land_area');

  // OCR Data
  const [ocrData, setOcrData] = useState<DocumentOcrResult | null>(null);

  // Field Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState<ExtractedField | null>(null);
  const [correctionValue, setCorrectionValue] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);

  const [officerNotes, setOfficerNotes] = useState(
    'Deed #3892/BK-I provides evidence for solely 2.40 Acres against the declared 4.20 Acres. Discrepancy violates Chapter IV Minimum Contiguous Land requirement for Metro Classification. Issue immediate show-cause notice before Executive Council review.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [proofHash, setProofHash] = useState('0x9f4a18ce84d2b2719cfa082104192b0018a12c81');

  const isOfficerOrAdmin = currentUser?.role === 'officer' || currentUser?.role === 'admin';

  // Load latest adjudication from database
  useEffect(() => {
    async function loadAdj() {
      const adj = await getLatestAdjudication(currentApp.id);
      if (adj) {
        setOfficerNotes(adj.notes);
        setProofHash(adj.proofHash);
      }
    }
    loadAdj();
  }, [currentApp.id]);

  // Load OCR result for selected document
  useEffect(() => {
    async function fetchOcr() {
      const res = await getDocumentOcrResult(currentApp.id, selectedDocId);
      if (res) {
        setOcrData(res);
      }
    }
    fetchOcr();
  }, [currentApp.id, selectedDocId]);

  const selectedDoc = docs.find((d) => d.id === selectedDocId) || docs[0];

  const handleAction = async (decision: 'show-cause' | 'overridden' | 'accepted') => {
    if (!isOfficerOrAdmin) return;
    setIsSubmitting(true);

    try {
      const newHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}`;
      setProofHash(newHash);

      await saveAdjudication(currentApp.id, {
        applicationId: currentApp.id,
        officerUid: currentUser?.uid || 'officer',
        officerName: currentUser?.displayName || 'A. Verma (Reg. IV Gazette Officer)',
        decision,
        notes: officerNotes,
        proofHash: newHash,
      });

      const label =
        decision === 'show-cause'
          ? 'Show-Cause Notice issued and docket flagged.'
          : decision === 'overridden'
          ? 'Adjudication override recorded with conditional requirements.'
          : 'Clarification accepted and application approved.';

      setActionStatus(`Action Persisted in Database: ${label}`);
      onAdjudicationSaved();
    } catch (e) {
      console.error(e);
      setActionStatus('Failed to record adjudication in database.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setActionStatus(null), 6000);
    }
  };

  const openCorrectionModal = (field: ExtractedField) => {
    if (!isOfficerOrAdmin) return;
    setCorrectionTarget(field);
    setCorrectionValue(field.correctedValue || field.normalizedValue);
    setCorrectionReason('');
  };

  const handleSaveCorrection = async () => {
    if (!correctionTarget || !correctionReason.trim()) return;
    setIsSavingCorrection(true);

    try {
      const updated = await updateOcrFieldCorrection(
        currentApp.id,
        selectedDocId,
        correctionTarget.key,
        {
          correctedValue: correctionValue,
          correctionReason,
          officerName: currentUser?.displayName || 'A. Verma (Reg. IV Gazette Officer)',
          officerUid: currentUser?.uid || 'demo-officer-verma',
        }
      );

      if (updated) {
        setOcrData(updated);
        setActionStatus(`Field '${correctionTarget.label}' corrected with immutable audit trail.`);
      }
      setCorrectionTarget(null);
    } catch (e) {
      console.error('Failed to correct field:', e);
      setActionStatus('Failed to update field correction.');
    } finally {
      setIsSavingCorrection(false);
      setTimeout(() => setActionStatus(null), 5000);
    }
  };

  // Search matches in raw text
  const searchMatches = searchQuery.trim()
    ? (ocrData?.rawFullText || '').toLowerCase().split(searchQuery.toLowerCase()).length - 1
    : 0;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto space-y-4 pb-8 animate-in fade-in duration-200">
      {/* 1. Scrutiny Dossier Header */}
      <div className="bg-surface-container-low rounded p-3.5 shadow-sm border border-outline-variant/30 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-on-surface text-[10px] font-label-code tracking-wider uppercase font-semibold">
              SCRUTINY WORKBENCH
            </span>
            <span className="font-caption text-caption text-on-surface-variant truncate">
              Ref: {currentApp.dossierRef}
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-label-code px-2 py-0.5 rounded font-semibold shrink-0 ${
              currentApp.status === 'flagged'
                ? 'text-error bg-error-container/60'
                : currentApp.status === 'approved'
                ? 'text-primary bg-primary/10'
                : 'text-on-secondary-container bg-secondary-container'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {currentApp.status.toUpperCase().replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2 pt-1">
          <div className="min-w-0">
            <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider text-[10px]">
              Assigned Scrutiny Official
            </p>
            <h2 className="font-title-editorial text-title-editorial text-primary font-medium truncate">
              {currentApp.assignedOfficerName || 'A. Verma (Reg. IV Gazette Officer)'}
            </h2>
          </div>
          <div className="text-right shrink-0">
            <span className="font-data-numeric text-[11px] text-on-surface-variant bg-surface-container px-2 py-1 rounded border border-outline-variant/20 font-medium">
              {docs.length} Documents
            </span>
          </div>
        </div>

        {/* Document Carousel Pill Selectors */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {docs.slice(0, 4).map((doc) => {
            const isSelected = selectedDocId === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-2 rounded flex items-center justify-between border transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-surface border-secondary/40 shadow-xs ring-1 ring-secondary/30'
                    : 'bg-surface-container border-outline-variant/20 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[17px] text-secondary">
                    {doc.type === 'OCR Scan' ? 'architecture' : 'history_edu'}
                  </span>
                  <span className="font-caption text-caption text-on-surface truncate font-medium">
                    {doc.title}
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    doc.status === 'deficient' || doc.status === 'flawed' ? 'text-error' : 'text-primary'
                  }`}
                >
                  {doc.status === 'deficient' || doc.status === 'flawed' ? 'flag' : 'check_circle'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Document Scanned Page Viewer & Interactive OCR Workspace */}
      <div className="bg-surface-container-lowest rounded p-3.5 shadow-sm border border-outline-variant/30 space-y-3">
        {/* Workspace Mode Bar */}
        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
          <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded text-[11px] font-label-code">
            <button
              type="button"
              onClick={() => setViewMode('folio')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                viewMode === 'folio' ? 'bg-surface text-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Folio &amp; Bounding Boxes
            </button>
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                viewMode === 'side-by-side' ? 'bg-surface text-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Side-by-Side Invariants
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw-text')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                viewMode === 'raw-text' ? 'bg-surface text-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Raw OCR Transcript
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Heatmap Toggle Switch */}
            <button
              type="button"
              onClick={() => setHeatmapOn(!heatmapOn)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-label-code font-medium shadow-xs active:scale-95 transition-all cursor-pointer border ${
                heatmapOn
                  ? 'bg-secondary-container text-on-secondary-fixed border-secondary/30'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
              }`}
              title="Forensic pixel tampering overlay"
            >
              <span className="material-symbols-outlined text-[13px]">grain</span>
              <span>{heatmapOn ? 'Heatmap ON' : 'Heatmap OFF'}</span>
            </button>
          </div>
        </div>

        {/* Verbatim Text Search Bar in Document */}
        <div className="flex items-center gap-2 bg-surface-container-low px-2.5 py-1.5 rounded border border-outline-variant/25">
          <span className="material-symbols-outlined text-[16px] text-outline">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verbatim OCR characters (e.g. 'Acres', '3892', 'Kaveri', 'Contiguous')..."
            className="w-full bg-transparent text-xs text-primary placeholder:text-outline focus:outline-hidden font-label-code"
          />
          {searchQuery && (
            <span className="text-[10px] font-label-code bg-secondary-container px-1.5 py-0.5 rounded text-on-secondary-fixed shrink-0 font-semibold">
              {searchMatches} {searchMatches === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>

        {/* Mode 1: Interactive Folio & Bounding Boxes Canvas */}
        {viewMode === 'folio' && (
          <div
            className="relative w-full rounded bg-surface-container-high overflow-hidden shadow-inner p-3 min-h-[320px] flex flex-col justify-between select-none border border-outline-variant/40"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}
          >
            {/* Watermark Ledger */}
            <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 rounded-full border-8 border-current text-primary flex items-center justify-center font-headline-md text-headline-md tracking-widest uppercase rotate-[-28deg] text-center p-2 leading-none">
                OFFICIAL GOVT SEAL REGISTRAR BENGALURU
              </div>
            </div>

            {/* Scanned Top Banner */}
            <div className="relative z-10 flex justify-between items-start text-[10px] font-label-code text-on-surface-variant">
              <span>VOL: 219 // PG: 184 // {activePage}</span>
              <span className="bg-surface/90 px-1.5 py-0.5 rounded border border-outline-variant/30 font-medium">
                ENGINE: {ocrData?.engineUsed ? 'Gemini 3.8 Flash' : 'Optical OCR'} · CONF: {selectedDoc?.confidence || '98.4%'}
              </span>
            </div>

            {/* Document Core Body Representation with Interactive Bounding Boxes */}
            <div className="relative z-10 space-y-2.5 my-auto py-2">
              <p className="font-title-editorial text-[13px] text-on-surface leading-snug italic text-center">
                &ldquo;Government of Karnataka — Department of Stamps &amp; Registration&rdquo;
              </p>

              {/* Interactive Bounding Box 1: Deed Registration Number */}
              <div
                onMouseEnter={() => setHoveredFieldKey('registration_number')}
                onMouseLeave={() => setHoveredFieldKey(null)}
                onClick={() => setSelectedFieldKey('registration_number')}
                className={`relative p-2 rounded transition-all cursor-pointer border ${
                  hoveredFieldKey === 'registration_number' || selectedFieldKey === 'registration_number'
                    ? 'bg-secondary-container/40 border-secondary ring-2 ring-secondary/50 shadow-sm'
                    : 'bg-surface/90 border-outline-variant/30 hover:border-secondary/40'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-label-code text-secondary font-bold">
                  <span>● BOUNDING BOX 01 · REGISTRATION DIGIT</span>
                  <span className="bg-surface px-1 rounded text-outline">OCR Conf: 99.4%</span>
                </div>
                <p className="font-label-code text-xs text-primary font-bold mt-0.5">
                  Registered Deed No: 3892/2014-15 BOOK-I (Zone IV Bangalore South)
                </p>
              </div>

              {/* Interactive Bounding Box 2: Land Parcel Area Extracted (Discrepancy) */}
              <div
                onMouseEnter={() => setHoveredFieldKey('contiguous_land_area')}
                onMouseLeave={() => setHoveredFieldKey(null)}
                onClick={() => setSelectedFieldKey('contiguous_land_area')}
                className={`relative p-2.5 rounded transition-all cursor-pointer border ${
                  hoveredFieldKey === 'contiguous_land_area' || selectedFieldKey === 'contiguous_land_area'
                    ? 'bg-error-container/30 border-error ring-2 ring-error/50 shadow-sm'
                    : 'bg-surface border-secondary/40 hover:border-error/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-eyebrow text-[9px] uppercase tracking-wider text-error font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                    ● BOUNDING BOX 02 · PARCEL EXTENT [DISCREPANCY]
                  </span>
                  <span className="font-caption text-[10px] text-error bg-error-container/60 px-1 py-0.2 rounded font-label-code font-bold">
                    Row 14-B · -1.80 Ac Deficit
                  </span>
                </div>
                <p className="font-data-numeric text-data-numeric text-primary font-bold mt-1">
                  Total Area: 2 Acres 16 Guntas{' '}
                  <span className="text-secondary font-semibold">(2.40 Acres Net Contiguous)</span>
                </p>
                <p className="font-caption text-[10px] text-error font-medium mt-0.5">
                  Declared on Portal: 4.20 Acres (Shortfall against AICTE Metro Threshold 4.00 Ac)
                </p>
              </div>

              {/* Highlight Box B: Tampered Notary Seal with Heatmap Overlay */}
              <div className="relative p-2 rounded bg-surface-container-lowest shadow-sm overflow-hidden border border-error/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-eyebrow text-[9px] uppercase tracking-wider text-error font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                    Highlight Box B · Notary Seal Analysis (Forensic Authenticity)
                  </span>
                  <span className="font-label-code text-[9px] text-error font-bold bg-error-container/80 px-1 py-0.2 rounded">
                    ELA: 74% Anomaly
                  </span>
                </div>
                <div className="relative h-14 rounded bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/30">
                  <div className="text-center text-primary-container font-headline-sm text-xs opacity-70">
                    [ ADVOCATE NOTARY STAMP — BANGALORE DIST. ]
                  </div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-tr from-error/40 via-secondary/30 to-transparent mix-blend-multiply flex items-end justify-end p-1 transition-opacity duration-300 ${
                      heatmapOn ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <span className="bg-error text-on-error text-[8px] font-label-code px-1 rounded uppercase tracking-wider font-semibold">
                      Pixel Resampling Detected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scanned Footer Stamp */}
            <div className="relative z-10 flex justify-between items-center text-[10px] font-label-code text-on-surface-variant pt-1 border-t border-outline-variant/20">
              <span>Doc ID: #{selectedDoc?.id || '3892-LND'}</span>
              <span className="text-primary font-semibold">Resolution: 600 DPI Verified</span>
            </div>
          </div>
        )}

        {/* Mode 2: Side-by-Side Invariant Triangulation Workspace */}
        {viewMode === 'side-by-side' && (
          <div className="space-y-2 animate-in fade-in duration-150">
            <div className="p-2 bg-surface-container-low rounded border border-outline-variant/20 text-[11px] font-caption text-on-surface-variant">
              Cross-verifying verbatim OCR transcript against portal declaration and statutory thresholds:
            </div>
            <div className="divide-y divide-outline-variant/20 border border-outline-variant/20 rounded overflow-hidden">
              <div className="grid grid-cols-3 bg-surface-container p-2 text-[10px] font-label-eyebrow uppercase tracking-wider text-secondary font-bold">
                <span>Document Excerpt</span>
                <span>Extracted / Normalized</span>
                <span>Portal Declaration</span>
              </div>
              {(ocrData?.extractedFields || []).map((f) => (
                <div key={f.key} className="grid grid-cols-3 p-2.5 gap-2 text-[11px] bg-surface hover:bg-surface-container-low/50">
                  <div>
                    <span className="font-caption text-on-surface-variant block text-[10px]">{f.label}</span>
                    <p className="font-label-code text-primary text-[10px] truncate" title={f.rawText}>
                      &ldquo;{f.rawText}&rdquo;
                    </p>
                    <span className="text-[9px] text-outline font-label-code">P.{f.pageNumber} · {f.confidence}%</span>
                  </div>
                  <div>
                    <span className="font-label-code text-primary font-bold block">
                      {f.correctedValue ? f.correctedValue : f.normalizedValue}
                    </span>
                    {f.correctedValue && (
                      <span className="text-[9px] font-label-code text-secondary font-semibold">
                        Corrected by {f.correctedBy}
                      </span>
                    )}
                    {isOfficerOrAdmin && (
                      <button
                        type="button"
                        onClick={() => openCorrectionModal(f)}
                        className="text-[10px] font-label-code text-secondary hover:underline block mt-0.5 cursor-pointer"
                      >
                        Correct Field
                      </button>
                    )}
                  </div>
                  <div>
                    <span className="font-label-code text-primary font-medium block">
                      {f.portalDeclaredValue || 'Standard Portal Schedule'}
                    </span>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-label-code font-bold mt-0.5 ${
                      f.reviewStatus === 'mismatch'
                        ? 'bg-error-container text-error'
                        : f.reviewStatus === 'corrected'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {f.reviewStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode 3: Raw OCR Full Text Transcript */}
        {viewMode === 'raw-text' && (
          <div className="space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px] font-label-code text-on-surface-variant">
              <span>Verbatim OCR Dump ({ocrData?.engineUsed || 'Gemini 3.8 Flash'})</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(ocrData?.rawFullText || '')}
                className="text-secondary hover:underline cursor-pointer"
              >
                Copy Transcript
              </button>
            </div>
            <pre className="p-3 rounded bg-surface-container text-primary font-label-code text-[11px] leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap border border-outline-variant/30 select-text">
              {ocrData?.rawFullText || 'Direct text stream being ingested...'}
            </pre>
          </div>
        )}

        {/* Forensic Mini Toolbar & Thumbnail Pagination Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-caption text-[11px] text-on-surface-variant px-1">
            <span>Thumbnail Folios</span>
            <div className="flex items-center gap-1">
              <button
                aria-label="Zoom out"
                onClick={() => setZoomLevel((z) => Math.max(0.9, z - 0.05))}
                className="p-1 rounded hover:bg-surface-container transition-colors text-primary flex items-center cursor-pointer"
                type="button"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_out</span>
              </button>
              <button
                aria-label="Zoom in"
                onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.05))}
                className="p-1 rounded hover:bg-surface-container transition-colors text-primary flex items-center cursor-pointer"
                type="button"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_in</span>
              </button>
              <button
                aria-label="Inspect Layer"
                onClick={() => setHeatmapOn(!heatmapOn)}
                className="p-1 rounded hover:bg-surface-container transition-colors text-primary flex items-center cursor-pointer"
                type="button"
                title="Toggle Layers"
              >
                <span className="material-symbols-outlined text-[16px]">layers</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <button
              onClick={() => setActivePage('P.01')}
              className={`p-1.5 rounded text-left space-y-0.5 border transition-all cursor-pointer ${
                activePage === 'P.01'
                  ? 'bg-surface-container-highest border-secondary text-primary font-semibold'
                  : 'bg-surface-container-high border-outline-variant/20 text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="block font-label-code text-[9px]">P. 01</span>
              <span className="block font-caption text-[10px] text-on-surface truncate">Stamp Duty</span>
            </button>
            <button
              onClick={() => setActivePage('P.02')}
              className={`p-1.5 rounded text-left space-y-0.5 shadow-xs border transition-all cursor-pointer ${
                activePage === 'P.02'
                  ? 'bg-surface-container-highest border-error text-primary font-semibold'
                  : 'bg-surface-container-high border-outline-variant/20 text-on-surface-variant'
              }`}
              type="button"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-code text-[9px] font-bold">P. 02</span>
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              </div>
              <span className="block font-caption text-[10px] text-error font-medium truncate">Parcel / Area</span>
            </button>
            <button
              onClick={() => setActivePage('P.03')}
              className={`p-1.5 rounded text-left space-y-0.5 border transition-all cursor-pointer ${
                activePage === 'P.03'
                  ? 'bg-surface-container-highest border-secondary text-primary font-semibold'
                  : 'bg-surface-container-high border-outline-variant/20 text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="block font-label-code text-[9px]">P. 03</span>
              <span className="block font-caption text-[10px] text-on-surface truncate">Boundaries</span>
            </button>
            <button
              onClick={() => setActivePage('P.04')}
              className={`p-1.5 rounded text-left space-y-0.5 border transition-all cursor-pointer ${
                activePage === 'P.04'
                  ? 'bg-surface-container-highest border-secondary text-primary font-semibold'
                  : 'bg-surface-container-high border-outline-variant/20 text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="block font-label-code text-[9px]">P. 04</span>
              <span className="block font-caption text-[10px] text-on-surface truncate">Signatures</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Tabbed Scrutiny Inspector & Field Correction Workbench */}
      <div className="bg-surface-container-low rounded p-3.5 shadow-sm border border-outline-variant/30 space-y-3">
        <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded border border-outline-variant/20">
          <button
            type="button"
            onClick={() => setActiveInspectorTab('fields')}
            className={`py-1 rounded font-caption text-caption text-center transition-colors cursor-pointer ${
              activeInspectorTab === 'fields'
                ? 'bg-surface text-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Fields ({ocrData?.extractedFields.length || 7})
          </button>
          <button
            type="button"
            onClick={() => setActiveInspectorTab('authenticity')}
            className={`py-1 rounded font-caption text-caption text-center transition-colors cursor-pointer ${
              activeInspectorTab === 'authenticity'
                ? 'bg-surface text-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Authenticity
          </button>
          <button
            type="button"
            onClick={() => setActiveInspectorTab('compliance')}
            className={`py-1 rounded font-caption text-caption text-center transition-colors cursor-pointer ${
              activeInspectorTab === 'compliance'
                ? 'bg-surface text-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Compliance (2)
          </button>
        </div>

        {activeInspectorTab === 'compliance' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="bg-surface rounded p-3 shadow-xs border border-outline-variant/30 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onOpenClauseModal('APH Cl. 4.14(b)')}
                    className="font-label-eyebrow text-label-eyebrow uppercase text-error tracking-wider hover:underline text-left block"
                  >
                    RULE FAILURE · CLAUSE 4.14(B)
                  </button>
                  <h3 className="font-headline-sm text-[16px] leading-tight text-primary font-medium">
                    Contiguous Land Area Requirement
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-code text-[10px] font-bold shrink-0">
                  -1.80 ACRES DEFICIT
                </span>
              </div>

              <div className="bg-surface-container-lowest p-2.5 rounded shadow-inner border border-outline-variant/20">
                <p className="font-caption text-[11px] uppercase tracking-wider text-secondary font-semibold">
                  Statutory Reference
                </p>
                <blockquote className="font-title-editorial text-[13px] text-on-surface italic mt-0.5 leading-snug">
                  &ldquo;AICTE Approval Process Handbook (APH) 2024-25, Appx 4, Cl. 4.14(b): Mega/Metro category technical institutions offering UG Engineering must possess minimum contiguous land of 4.00 Acres unencumbered.&rdquo;
                </blockquote>
              </div>

              <div className="bg-surface-container-low p-2.5 rounded space-y-2 border border-outline-variant/20">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant font-caption">Portal Declared (Form Tab 2):</span>
                  <span className="font-data-numeric text-primary font-bold">04.20 ACRES</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant font-caption">OCR Extracted (Deed P. 02):</span>
                  <span className="font-data-numeric text-on-surface font-bold">02.40 ACRES</span>
                </div>
                <div className="pt-1.5 bg-surface-variant/40 p-1.5 rounded flex items-center justify-between text-[11px] border border-error/20">
                  <span className="font-caption font-semibold text-error">Net Statutory Discrepancy:</span>
                  <span className="font-data-numeric text-error font-extrabold">-01.80 ACRES (42.8% SHORT)</span>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded p-3 shadow-xs border border-outline-variant/30 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onOpenClauseModal('APH Cl. 6.3')}
                    className="font-label-eyebrow text-label-eyebrow uppercase text-error tracking-wider hover:underline text-left block"
                  >
                    RULE FAILURE · CLAUSE 6.3
                  </button>
                  <h3 className="font-headline-sm text-[16px] leading-tight text-primary font-medium">
                    Life Safety &amp; Fire NOC Validity
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-code text-[10px] font-bold shrink-0">
                  EXPIRED DOCUMENT
                </span>
              </div>
              <div className="bg-surface-container-lowest p-2.5 rounded shadow-inner border border-outline-variant/20">
                <blockquote className="font-title-editorial text-[13px] text-on-surface italic leading-snug">
                  &ldquo;APH 2024-25 Cl. 6.3: Valid Fire NOC issued by competent State Fire Authority must cover complete operational duration through current academic calendar year.&rdquo;
                </blockquote>
              </div>
              <div className="bg-surface-container-low p-2 rounded flex items-center justify-between text-[11px] border border-outline-variant/20">
                <span className="font-caption text-on-surface-variant">Validity Extracted:</span>
                <span className="font-data-numeric text-error font-bold">Expired 31 March 2024</span>
              </div>
            </div>
          </div>
        )}

        {activeInspectorTab === 'fields' && (
          <div className="bg-surface rounded p-3 shadow-xs border border-outline-variant/30 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-label-eyebrow text-[10px] uppercase text-secondary font-bold block">
                Extracted Gazette &amp; Title Invariants
              </span>
              <span className="font-caption text-[10px] text-outline">
                Click any field to correct or inspect
              </span>
            </div>

            <div className="divide-y divide-outline-variant/20 text-[11px]">
              {(ocrData?.extractedFields || []).map((f) => {
                const isSelected = selectedFieldKey === f.key;
                const isCorrected = f.reviewStatus === 'corrected';
                return (
                  <div
                    key={f.key}
                    onClick={() => setSelectedFieldKey(f.key)}
                    className={`py-2 px-1.5 rounded transition-all flex justify-between items-start cursor-pointer ${
                      isSelected ? 'bg-secondary-container/20 ring-1 ring-secondary/30' : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-on-surface-variant font-caption font-medium">{f.label}</span>
                        <span className="font-label-code text-[9px] text-outline">P.{f.pageNumber} · {f.confidence}%</span>
                      </div>
                      <p className="font-label-code text-primary font-bold">
                        {f.correctedValue ? f.correctedValue : f.normalizedValue}
                      </p>
                      <p className="font-label-code text-[10px] text-on-surface-variant truncate max-w-xs" title={f.rawText}>
                        Raw: &ldquo;{f.rawText}&rdquo;
                      </p>
                      {f.correctionReason && (
                        <p className="text-[10px] font-caption text-secondary italic">
                          Correction: &ldquo;{f.correctionReason}&rdquo; ({f.correctedBy})
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-1.5 py-0.2 rounded font-label-code text-[9px] font-bold ${
                        f.reviewStatus === 'mismatch'
                          ? 'bg-error-container text-error'
                          : isCorrected
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {f.reviewStatus.toUpperCase()}
                      </span>
                      {isOfficerOrAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCorrectionModal(f);
                          }}
                          className="font-label-code text-[10px] text-secondary hover:underline cursor-pointer"
                        >
                          Correct
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeInspectorTab === 'authenticity' && (
          <div className="bg-surface rounded p-3 shadow-xs border border-outline-variant/30 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-label-eyebrow text-[10px] uppercase text-secondary font-bold block">
                Forensic Integrity Audit Manifest
              </span>
              <span className="font-caption text-[10px] text-outline">
                Decoupled from OCR Extraction
              </span>
            </div>

            <p className="font-caption text-[11px] text-on-surface-variant leading-snug">
              OCR decodes textual characters; forensic scrutiny evaluates physical ink variance, pixel resampling, and government registry validation:
            </p>

            <div className="space-y-2 text-caption">
              <div className="bg-surface-container-low p-2 rounded flex justify-between items-center text-[11px]">
                <span className="text-on-surface-variant">Error Level Analysis (ELA):</span>
                <span className="font-label-code text-error font-bold">74% Variance on Notary Seal</span>
              </div>
              <div className="bg-surface-container-low p-2 rounded flex justify-between items-center text-[11px]">
                <span className="text-on-surface-variant">QR Verification State:</span>
                <span className="font-label-code text-primary font-semibold">Decoded against KAVERI II Registry</span>
              </div>
              <div className="bg-surface-container-low p-2 rounded flex justify-between items-center text-[11px]">
                <span className="text-on-surface-variant">Font Forgery Forensics:</span>
                <span className="font-label-code text-primary font-semibold">Uniform Serif Font Kernel (99.8%)</span>
              </div>
              <div className="bg-surface-container-low p-2 rounded flex justify-between items-center text-[11px]">
                <span className="text-on-surface-variant">Cryptographic SHA-256 Seal:</span>
                <span className="font-label-code text-primary font-semibold truncate max-w-[200px]">
                  {selectedDoc?.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e46'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Field Correction Modal (Officer Bench) */}
      {correctionTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg max-w-md w-full p-4 space-y-3 shadow-xl border border-secondary/40 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">edit_document</span>
                <h3 className="font-headline-sm text-sm text-primary font-semibold">
                  Authorized Field Correction · {correctionTarget.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCorrectionTarget(null)}
                className="text-on-surface-variant hover:text-primary text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-2.5 bg-surface-container-low rounded border border-outline-variant/20 text-[11px] font-caption text-on-surface-variant space-y-1">
              <span className="font-label-eyebrow text-[9px] uppercase tracking-wider text-outline block">
                Immutable Original Raw OCR Text
              </span>
              <p className="font-label-code text-primary font-semibold select-text">
                &ldquo;{correctionTarget.rawText}&rdquo;
              </p>
              <p className="text-[10px] text-outline">
                Original raw characters cannot be deleted; corrections are appended with officer cryptostamp.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-caption text-[11px] text-on-surface font-medium block">
                Corrected Normalized Value:
              </label>
              <input
                type="text"
                value={correctionValue}
                onChange={(e) => setCorrectionValue(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/40 rounded px-2.5 py-1.5 text-xs font-label-code text-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-caption text-[11px] text-on-surface font-medium block">
                Statutory Correction Rationale (Required for Gazette Audit):
              </label>
              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="e.g. Endorsement on margin page 2 rectifies net boundary calculation to 2.40 Acres."
                rows={3}
                className="w-full bg-surface-container border border-outline-variant/40 rounded px-2.5 py-1.5 text-xs text-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setCorrectionTarget(null)}
                className="px-3 py-1.5 rounded bg-transparent text-xs font-caption text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!correctionReason.trim() || isSavingCorrection}
                onClick={handleSaveCorrection}
                className={`px-3 py-1.5 rounded bg-primary text-on-primary text-xs font-label-code font-semibold shadow cursor-pointer ${
                  !correctionReason.trim() || isSavingCorrection ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-container'
                }`}
              >
                {isSavingCorrection ? 'Signing...' : 'Sign & Apply Correction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Adjudication Action Panel (Officer Bench) */}
      <div className="bg-surface-container-low rounded p-3.5 shadow-sm border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">gavel</span>
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-primary tracking-wider font-semibold">
              Statutory Adjudication Bench
            </span>
          </div>
          <span className="font-label-code text-[10px] text-on-surface-variant">
            {isOfficerOrAdmin ? 'Action Required' : 'Read-Only Perspective'}
          </span>
        </div>

        {!isOfficerOrAdmin ? (
          <div className="p-3 bg-secondary-container/20 border border-secondary/30 rounded text-caption text-on-surface space-y-1">
            <div className="flex items-center gap-1 text-secondary font-semibold text-[11px]">
              <span className="material-symbols-outlined text-[15px]">lock</span>
              <span>Officer Bench Restricted</span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Adjudication orders and show-cause directives can only be issued by an authorized AICTE Gazette Scrutiny Official. Use the Profile switcher in the top right to switch to Officer perspective.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-caption text-[11px] text-on-surface-variant font-medium block">
                Official Scrutiny Directive &amp; Compliance Findings:
              </label>
              <textarea
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                rows={3}
                className="w-full p-2 rounded bg-surface border border-outline-variant/40 font-body-sm text-xs text-primary leading-relaxed focus:outline-hidden focus:border-secondary select-text"
              />
            </div>

            <div className="p-2 rounded bg-surface-container flex items-center justify-between text-[10px] font-label-code text-on-surface-variant border border-outline-variant/20">
              <span className="truncate">Cryptographic Proof: {proofHash}</span>
              <span className="text-secondary font-semibold shrink-0">AICTE SEC-4 LOG</span>
            </div>

            {actionStatus && (
              <div className="p-2 rounded bg-primary/10 border border-primary/20 text-primary font-label-code text-[11px] animate-in fade-in duration-150">
                {actionStatus}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction('show-cause')}
                className="py-2.5 px-2 rounded bg-error text-on-error font-label-eyebrow text-[10px] uppercase font-bold tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>Issue Show-Cause</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction('overridden')}
                className="py-2.5 px-2 rounded bg-secondary text-on-secondary font-label-eyebrow text-[10px] uppercase font-bold tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">tune</span>
                <span>Conditional Pass</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction('accepted')}
                className="py-2.5 px-2 rounded bg-primary text-on-primary font-label-eyebrow text-[10px] uppercase font-bold tracking-wider hover:bg-primary-container active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">check</span>
                <span>Approve Dossier</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
