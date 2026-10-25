import React, { useState, useRef, useEffect } from 'react';
import { NavTab, ApplicationRecord, MatrixRowData, AuditLogRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { logAuditEvent, getAuditLogs } from '../firebase/dbService';

interface Props {
  currentApp: ApplicationRecord;
  matrixData: Record<number, MatrixRowData>;
  onNavigate: (tab: NavTab) => void;
  onOpenExportModal: () => void;
}

export const MatrixView: React.FC<Props> = ({
  currentApp,
  matrixData,
  onNavigate,
  onOpenExportModal,
}) => {
  const { currentUser } = useAuth();
  const [selectedRow, setSelectedRow] = useState<number>(2); // Default to Campus Land Area
  const [appendedToReport, setAppendedToReport] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const inspectorRef = useRef<HTMLDivElement>(null);

  const activeData = matrixData[selectedRow] || matrixData[2];

  useEffect(() => {
    if (showAuditLogs) {
      getAuditLogs(currentApp.id).then((logs) => setAuditLogs(logs));
    }
  }, [showAuditLogs, currentApp.id]);

  const handleSelectRow = (index: number) => {
    setSelectedRow(index);
    if (inspectorRef.current) {
      inspectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleAppendReport = async () => {
    setAppendedToReport(true);
    await logAuditEvent(
      currentApp.id,
      currentUser?.uid || 'officer',
      currentUser?.role || 'officer',
      'APPEND_INVARIANTS_TO_REPORT',
      'Officer appended 4 forensic discrepancies to formal AICTE hearing dossier.'
    );
    setTimeout(() => setAppendedToReport(false), 4000);
  };

  const handleEscalate = async () => {
    setEscalated(true);
    await logAuditEvent(
      currentApp.id,
      currentUser?.uid || 'officer',
      currentUser?.role || 'officer',
      'ESCALATE_TO_COMMITTEE',
      `Parameter ${selectedRow} escalated to Regional Scrutiny Hearing Committee.`
    );
    setTimeout(() => setEscalated(false), 4000);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-space-md pb-6 animate-in fade-in duration-200">
      {/* Archival Dossier Heading */}
      <div className="bg-surface-container p-space-md rounded-lg shadow-sm border border-outline-variant/30">
        <div className="flex items-center justify-between mb-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-eyebrow text-label-eyebrow text-secondary uppercase tracking-widest">
              CHAPTER 05 / INVARIANT AUDIT
            </span>
            <span className="w-1 h-1 rounded-full bg-outline"></span>
            <span className="font-label-code text-caption text-on-surface-variant">
              FOLIO-AICTE-9810
            </span>
          </div>
          <span className="bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded font-label-code text-[11px] font-semibold tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">balance</span> SEAL VERIFIED
          </span>
        </div>

        <h2 className="font-headline-lg-mobile md:font-headline-lg text-primary tracking-tight font-medium text-2xl md:text-3xl">
          Cross-Document Forensic Consistency Matrix
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
          Automated entity resolution and invariant statutory validation synthesized across 5 regulatory instruments for{' '}
          <strong>{currentApp.institutionName}</strong>.
        </p>

        {/* Stat Bar Summary */}
        <div className="grid grid-cols-3 gap-space-xs mt-space-md pt-space-xs">
          <div className="bg-surface p-space-sm rounded border border-outline-variant/30 text-center sm:text-left">
            <span className="font-caption text-[11px] text-on-surface-variant block uppercase font-medium">
              Instruments
            </span>
            <span className="font-data-numeric text-data-numeric text-primary font-bold">05 Validated</span>
          </div>
          <div className="bg-surface p-space-sm rounded border border-outline-variant/30 text-center sm:text-left">
            <span className="font-caption text-[11px] text-on-surface-variant block uppercase font-medium">
              Concordance
            </span>
            <span className="font-data-numeric text-data-numeric text-secondary font-bold">68.4% Matched</span>
          </div>
          <div className="bg-surface p-space-sm rounded border border-outline-variant/30 text-center sm:text-left">
            <span className="font-caption text-[11px] text-on-surface-variant block uppercase font-medium">
              High Variance
            </span>
            <span className="font-data-numeric text-data-numeric text-error font-bold">02 Flagged</span>
          </div>
        </div>
      </div>

      {/* Interactive Matrix Table with Horizontal Scroll & Sticky First Column */}
      <div className="flex flex-col space-y-space-xs">
        <div className="flex items-center justify-between px-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">drag_indicator</span>
            <span className="font-label-eyebrow text-label-eyebrow text-on-surface-variant uppercase tracking-wider">
              Comparative Ledger (Scroll horizontally • First column locked)
            </span>
          </div>
          <span className="font-caption text-caption text-secondary flex items-center gap-0.5 font-medium">
            <span>Tap row to inspect proof</span>
            <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
          </span>
        </div>

        {/* Scrollable Matrix Frame with sticky column */}
        <div className="overflow-x-auto rounded-lg shadow-sm bg-surface-container-lowest border border-outline-variant/40">
          <table className="w-full text-left min-w-[760px] border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface font-label-eyebrow text-label-eyebrow uppercase tracking-wider border-b border-outline-variant/40">
                <th className="py-2.5 px-4 sticky left-0 z-20 bg-surface-container w-44 shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                  Invariant Parameter
                </th>
                <th className="py-2.5 px-4 w-44">Portal Declaration</th>
                <th className="py-2.5 px-4 w-48">Land Title Deed</th>
                <th className="py-2.5 px-4 w-44">Trust Certificate</th>
                <th className="py-2.5 px-4 w-44">Fire NOC</th>
                <th className="py-2.5 px-4 w-48">Municipality Sanction</th>
              </tr>
            </thead>
            <tbody className="font-label-code text-caption divide-y divide-outline-variant/30">
              {/* Row 1: Trust / Society Name */}
              <tr
                className={`cursor-pointer transition-colors ${
                  selectedRow === 1
                    ? 'bg-secondary-container/20 ring-1 ring-inset ring-secondary/40'
                    : 'bg-surface-container-low hover:bg-surface-container'
                }`}
                onClick={() => handleSelectRow(1)}
              >
                <td className="py-2.5 px-4 font-body-sm font-semibold text-primary sticky left-0 z-10 bg-inherit shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span>01. Trust / Society Name</span>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-on-surface">
                  <div className="font-semibold text-primary">Vishweshwaraya Education Trust</div>
                  <span className="inline-block mt-0.5 text-[10px] text-primary px-1.5 py-0.2 bg-primary-fixed-dim/30 rounded border border-primary/20">
                    AFFIDAVIT DECLARED
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <div className="bg-secondary-container/40 text-on-secondary-fixed p-1.5 rounded border border-secondary/30">
                    <div className="font-semibold">Shri Vishweshwaraya Edu Trust</div>
                    <div className="text-[10px] flex items-center gap-1 text-secondary mt-0.5 font-medium">
                      <span className="material-symbols-outlined text-[12px]">search</span> 88% Fuzzy Match
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <div className="bg-primary/5 text-primary p-1.5 rounded border border-primary/20">
                    <div className="font-semibold">Vishweshwaraya Education Trust</div>
                    <div className="text-[10px] text-primary-container font-semibold mt-0.5">■ EXACT MATCH</div>
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <div className="bg-secondary-container/40 text-on-secondary-fixed p-1.5 rounded border border-secondary/30">
                    <div className="font-semibold">VITM Campus</div>
                    <div className="text-[10px] text-secondary mt-0.5">Campus Entity Alias</div>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-on-surface-variant italic">
                  -- Not Appended --
                </td>
              </tr>

              {/* Row 2: Campus Land Area (Critical Conflict) */}
              <tr
                className={`cursor-pointer transition-colors ${
                  selectedRow === 2
                    ? 'bg-error-container/40 ring-1 ring-inset ring-error/60'
                    : 'bg-error-container/20 hover:bg-error-container/30'
                }`}
                onClick={() => handleSelectRow(2)}
              >
                <td className="py-2.5 px-4 font-body-sm font-semibold text-error sticky left-0 z-10 bg-inherit shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                    <span>02. Campus Land Area</span>
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <div className="font-semibold text-primary">4.20 Acres</div>
                  <span className="inline-block mt-0.5 text-[10px] text-on-surface-variant font-data-numeric">
                    17,000 sq.m
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <div className="bg-error-container text-on-error-container p-1.5 rounded border border-error/30">
                    <div className="font-semibold text-error">2.40 Acres</div>
                    <div className="text-[10px] font-bold mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">error</span> -1.80 ACRE DEFICIT
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-on-surface-variant italic">
                  -- Not Specified --
                </td>
                <td className="py-2.5 px-4 text-on-surface-variant">
                  <span>9,712 sq.m (2.40 Ac)</span>
                </td>
                <td className="py-2.5 px-4">
                  <div className="bg-error-container text-on-error-container p-1.5 rounded border border-error/30">
                    <div className="font-semibold text-error">2.40 Acres (Sanctioned)</div>
                    <div className="text-[10px] mt-0.5">Discrepancy with Form</div>
                  </div>
                </td>
              </tr>

              {/* Row 3: Survey / Khasra No. */}
              <tr
                className={`cursor-pointer transition-colors ${
                  selectedRow === 3
                    ? 'bg-secondary-container/20 ring-1 ring-inset ring-secondary/40'
                    : 'bg-surface-container-low hover:bg-surface-container'
                }`}
                onClick={() => handleSelectRow(3)}
              >
                <td className="py-2.5 px-4 font-body-sm font-semibold text-primary sticky left-0 z-10 bg-inherit shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span>03. Survey / Khasra No.</span>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-on-surface">
                  <div className="font-semibold">Sy. No. 142/1, 142/2</div>
                  <span className="text-[10px] text-on-surface-variant">Revenue Cadastre</span>
                </td>
                <td className="py-2.5 px-4">
                  <div className="bg-primary/5 text-primary p-1.5 rounded border border-primary/20">
                    <div className="font-semibold">Sy. No. 142/1, 142/2</div>
                    <div className="text-[10px] text-primary-container font-semibold mt-0.5">■ BOUNDARY PARALLEL</div>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-on-surface-variant italic">
                  -- Not Applicable --
                </td>
                <td className="py-2.5 px-4 text-on-surface-variant">
                  <span>Sy. No. 142/1, 142/2</span>
                </td>
                <td className="py-2.5 px-4">
                  <div className="bg-secondary-container/40 text-on-secondary-fixed p-1.5 rounded border border-secondary/30">
                    <div className="font-semibold">Sy. No. 142/1</div>
                    <div className="text-[10px] text-secondary mt-0.5">Sub-plot 142/2 Absent</div>
                  </div>
                </td>
              </tr>

              {/* Row 4: Authorized Signatory */}
              <tr
                className={`cursor-pointer transition-colors ${
                  selectedRow === 4
                    ? 'bg-secondary-container/20 ring-1 ring-inset ring-secondary/40'
                    : 'bg-surface-container-low hover:bg-surface-container'
                }`}
                onClick={() => handleSelectRow(4)}
              >
                <td className="py-2.5 px-4 font-body-sm font-semibold text-primary sticky left-0 z-10 bg-inherit shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span>04. Authorized Signatory</span>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-on-surface">
                  <div className="font-semibold">Dr. K. S. Ramanathan</div>
                  <span className="text-[10px] text-on-surface-variant">Chairman &amp; Trustee</span>
                </td>
                <td className="py-2.5 px-4">
                  <div className="bg-secondary-container/40 text-on-secondary-fixed p-1.5 rounded border border-secondary/30">
                    <div className="font-semibold">Late Shri V. Ramanathan</div>
                    <div className="text-[10px] text-secondary mt-0.5">Succession Deed Needed</div>
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <div className="bg-primary/5 text-primary p-1.5 rounded border border-primary/20">
                    <div className="font-semibold">Dr. K. S. Ramanathan</div>
                    <div className="text-[10px] text-primary-container font-semibold mt-0.5">■ RESOLUTION CONFIRMED</div>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-on-surface-variant">
                  <span>Dr. K. S. Ramanathan</span>
                </td>
                <td className="py-2.5 px-4 text-on-surface-variant">
                  <span>Trustee Body</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Focus Switcher Chips */}
      <div className="flex items-center gap-space-xs overflow-x-auto py-1 no-scrollbar">
        <button
          type="button"
          className={`px-space-sm py-1 text-caption font-label-code rounded flex items-center gap-1 shrink-0 cursor-pointer border transition-all ${
            selectedRow === 2
              ? 'bg-error-container text-on-error-container border-error font-semibold'
              : 'bg-surface-container text-on-surface border-outline-variant/30 hover:bg-surface-container-high'
          }`}
          onClick={() => handleSelectRow(2)}
        >
          <span className="material-symbols-outlined text-[14px]">warning</span> Clause 02: Land Conflict
        </button>
        <button
          type="button"
          className={`px-space-sm py-1 text-caption font-label-code rounded flex items-center gap-1 shrink-0 cursor-pointer border transition-all ${
            selectedRow === 1
              ? 'bg-secondary-container text-on-secondary-container border-secondary font-semibold'
              : 'bg-surface-container text-on-surface border-outline-variant/30 hover:bg-surface-container-high'
          }`}
          onClick={() => handleSelectRow(1)}
        >
          <span className="material-symbols-outlined text-[14px]">spellcheck</span> Clause 01: Trust Name
        </button>
        <button
          type="button"
          className={`px-space-sm py-1 text-caption font-label-code rounded flex items-center gap-1 shrink-0 cursor-pointer border transition-all ${
            selectedRow === 3
              ? 'bg-secondary-container text-on-secondary-container border-secondary font-semibold'
              : 'bg-surface-container text-on-surface border-outline-variant/30 hover:bg-surface-container-high'
          }`}
          onClick={() => handleSelectRow(3)}
        >
          <span className="material-symbols-outlined text-[14px]">map</span> Clause 03: Survey Sub-plot
        </button>
        <button
          type="button"
          className={`px-space-sm py-1 text-caption font-label-code rounded flex items-center gap-1 shrink-0 cursor-pointer border transition-all ${
            selectedRow === 4
              ? 'bg-secondary-container text-on-secondary-container border-secondary font-semibold'
              : 'bg-surface-container text-on-surface border-outline-variant/30 hover:bg-surface-container-high'
          }`}
          onClick={() => handleSelectRow(4)}
        >
          <span className="material-symbols-outlined text-[14px]">badge</span> Clause 04: Signatory Lineage
        </button>
      </div>

      {/* Forensic Cell Detail & Source Snippet Inspector */}
      <div
        ref={inspectorRef}
        className="bg-surface-container-lowest rounded-lg p-space-md shadow-md border border-outline-variant/30 space-y-space-md animate-in fade-in duration-200"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-space-xs mb-1">
              <span
                className={`font-label-eyebrow text-label-eyebrow uppercase tracking-wider font-semibold ${
                  activeData.inspector.statusColor === 'error' ? 'text-error' : 'text-secondary'
                }`}
              >
                {activeData.inspector.badgeText}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded font-label-code text-[10px] font-bold ${activeData.inspector.badgeClass}`}
              >
                {activeData.inspector.badgeText}
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-medium">
              {activeData.inspector.title}
            </h3>
          </div>
          <span className="material-symbols-outlined text-secondary text-[24px]">verified_user</span>
        </div>

        {/* Side-by-Side Dual Dossier Excerpt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
          {/* Snippet A: Portal Affidavit Entry */}
          <div className="bg-surface-container-low p-space-sm rounded border border-outline-variant/30">
            <div className="flex items-center justify-between pb-1 mb-1.5">
              <span className="font-label-eyebrow text-label-eyebrow text-primary uppercase font-semibold">
                Source A: Self-Declaration Form
              </span>
              <span className="font-label-code text-[10px] text-on-surface-variant">PAGE 03, SEC 4.1</span>
            </div>
            <div className="bg-surface p-space-sm rounded font-label-code text-caption space-y-1 border border-outline-variant/20">
              <div className="text-on-surface-variant">
                Parameter Field: <span className="text-primary font-semibold">{activeData.inspector.sourceAField}</span>
              </div>
              <div className="text-headline-sm text-primary font-title-editorial font-semibold">
                {activeData.inspector.sourceAVal}
              </div>
              <p className="text-[11px] text-on-surface-variant font-caption italic">
                {activeData.inspector.sourceADesc}
              </p>
            </div>
          </div>

          {/* Snippet B: Sub-Registrar Deed Scan Excerpt */}
          <div className="bg-surface-container-low p-space-sm rounded border border-outline-variant/30">
            <div className="flex items-center justify-between pb-1 mb-1.5">
              <span
                className={`font-label-eyebrow text-label-eyebrow uppercase font-semibold ${
                  activeData.inspector.statusColor === 'error' ? 'text-error' : 'text-secondary'
                }`}
              >
                Source B: Registered Sale Deed
              </span>
              <span className="font-label-code text-[10px] text-on-surface-variant">VOL 412, PG 18</span>
            </div>
            <div className="bg-surface p-space-sm rounded font-label-code text-caption space-y-1 border border-outline-variant/20">
              <div className="text-on-surface-variant">
                OCR Cadastral Schedule:{' '}
                <span
                  className={`font-semibold ${
                    activeData.inspector.statusColor === 'error' ? 'text-error' : 'text-secondary'
                  }`}
                >
                  {activeData.inspector.sourceBField}
                </span>
              </div>
              <div
                className={`text-headline-sm font-title-editorial font-semibold ${
                  activeData.inspector.statusColor === 'error' ? 'text-error' : 'text-secondary'
                }`}
              >
                {activeData.inspector.sourceBVal}
              </div>
              <p className="text-[11px] text-on-surface-variant font-caption italic">
                {activeData.inspector.sourceBDesc}
              </p>
            </div>
          </div>
        </div>

        {/* AI Model Verification Audit Narrative */}
        <div className="bg-surface-container p-space-sm rounded flex items-start gap-space-sm border border-outline-variant/30">
          <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">smart_toy</span>
          <div className="flex flex-col space-y-0.5">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-code text-[11px] font-semibold text-primary">Consistency Engine v3.2</span>
              <span className="text-[10px] text-on-surface-variant">|</span>
              <span className="font-caption text-[11px] text-secondary font-medium">Confidence: 99.1%</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
              {activeData.inspector.analysis}
            </p>
          </div>
        </div>

        {/* Inspector Resolution Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-space-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                activeData.inspector.statusColor === 'error' ? 'bg-error' : 'bg-secondary'
              }`}
            ></span>
            <span className="font-caption text-caption text-on-surface-variant font-medium">
              {activeData.inspector.statusText}
            </span>
          </div>
          <button
            onClick={handleEscalate}
            className="px-space-md py-1.5 bg-surface text-error border border-error/30 text-caption font-semibold rounded shadow-xs hover:bg-error-container/20 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">priority_high</span>
            <span>{escalated ? '✓ Escalated to Scrutiny Docket' : 'Escalate to Inspection Committee'}</span>
          </button>
        </div>
      </div>

      {/* Primary Archival Actions */}
      <div className="space-y-space-xs pt-space-xs">
        <button
          onClick={onOpenExportModal}
          className="w-full py-space-sm px-space-md bg-primary-container text-on-primary font-body-sm font-semibold rounded shadow-sm hover:bg-tertiary transition-colors flex items-center justify-center gap-space-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>Export Forensic Matrix (Cryptographically Signed PDF)</span>
        </button>

        <button
          onClick={handleAppendReport}
          className="w-full py-space-sm px-space-md bg-surface-container text-error font-body-sm font-semibold rounded shadow-xs hover:bg-error-container/30 transition-colors flex items-center justify-center gap-space-xs cursor-pointer border border-error/20"
        >
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          <span>
            {appendedToReport
              ? '✓ All 4 Invariant Discrepancies Appended to Official Docket'
              : 'Append All 4 Invariant Discrepancies to Scrutiny Report'}
          </span>
        </button>

        {/* Immutable Audit Log Viewer Trigger (Admin / Officer feature) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAuditLogs(!showAuditLogs)}
            className="text-caption text-secondary font-medium hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>{showAuditLogs ? 'Hide Immutable Audit Ledger' : 'View Firestore Immutable Audit Ledger'}</span>
          </button>

          {showAuditLogs && (
            <div className="mt-2 bg-surface-container-low rounded p-3 border border-outline-variant/30 text-[11px] font-label-code space-y-2">
              <span className="font-label-eyebrow text-[10px] text-secondary uppercase font-bold block">
                Statutory Audit Events ({auditLogs.length})
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-outline-variant/20">
                {auditLogs.length === 0 ? (
                  <p className="text-on-surface-variant font-caption">No audit events logged yet.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="pt-1.5 flex justify-between items-start gap-2">
                      <div>
                        <span className="font-semibold text-primary">{log.action}: </span>
                        <span className="text-on-surface">{log.details}</span>
                      </div>
                      <span className="text-on-surface-variant shrink-0 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
