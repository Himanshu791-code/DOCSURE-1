import React from 'react';
import { NavTab } from '../types';

interface Props {
  onNavigate: (tab: NavTab) => void;
  onOpenClauseModal: (clause: string) => void;
}

export const OverviewView: React.FC<Props> = ({ onNavigate, onOpenClauseModal }) => {
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-space-md animate-in fade-in duration-200">
      {/* Section 1: Hero & Archival Editorial Lead */}
      <section className="flex flex-col gap-space-md pt-2 pb-space-lg">
        {/* Eyebrow Badge & Seal */}
        <div className="flex items-center justify-between gap-space-sm">
          <div className="inline-flex items-center gap-space-xs bg-surface-container px-2.5 py-1 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-secondary tracking-widest">
              Official AICTE Regulatory Audit System
            </span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
            <span className="font-label-code text-caption tracking-tight">APH 2024–25</span>
          </div>
        </div>

        {/* Editorial Serif Headline */}
        <div className="flex flex-col gap-space-xs">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-primary tracking-tight text-3xl md:text-4xl leading-tight">
            Every document, <span className="italic font-normal text-secondary">read carefully</span>. Every flag, explained.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-2xl">
            An explainable, human-in-the-loop validation intelligence engineered for institutional affiliation, land title scrutiny, and statutory compliance.
          </p>
        </div>

        {/* Interactive Call to Action Stack */}
        <div className="flex flex-col sm:flex-row gap-space-sm pt-space-xs">
          <button
            onClick={() => onNavigate('upload')}
            className="flex-1 h-12 bg-primary text-on-primary font-body-md font-medium rounded flex items-center justify-center gap-space-xs shadow-sm hover:bg-primary-container active:scale-[0.99] transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">document_scanner</span>
            <span>Start Institutional Validation</span>
          </button>
          <button
            onClick={() => onNavigate('summary')}
            className="flex-1 h-12 bg-surface-container text-on-surface font-body-md font-medium rounded flex items-center justify-center gap-space-xs hover:bg-surface-container-high active:scale-[0.99] transition-colors cursor-pointer border border-outline-variant/40"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">analytics</span>
            <span className="text-secondary font-semibold">View Sample Audit Folio (NIT-084)</span>
          </button>
        </div>
      </section>

      {/* Section 2: Forensic Evidence Scrutiny Preview */}
      <section className="flex flex-col gap-space-sm pb-space-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-label-code text-caption text-secondary font-semibold">§ 02.4</span>
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-on-surface-variant">
              Forensic Evidence Scrutiny
            </span>
          </div>
          <span className="font-label-code text-[11px] text-error font-medium bg-error-container/40 px-2 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
            Deficiency Detected
          </span>
        </div>

        {/* Simulated Archival Folio / Certificate Mockup */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-md shadow-sm border border-outline-variant/40 relative overflow-hidden">
          {/* Watermark Stamp / Header in Parchment Paper Style */}
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col min-w-0">
              <span className="font-label-eyebrow text-[9px] uppercase tracking-wider text-on-surface-variant">
                Government of Karnataka — Dept. of Revenue
              </span>
              <span className="font-headline-sm text-title-editorial text-primary truncate font-medium">
                Land Conversion Order No. LND-CR-892/2019-20
              </span>
              <span className="font-label-code text-[11px] text-outline">
                Khata: 104/A-12 • Hobli: Yelahanka • Devanahalli Sub-Dist
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 border border-outline-variant/50">
              <span className="material-symbols-outlined text-secondary text-[22px]">policy</span>
            </div>
          </div>

          {/* Scanned Extract Table with Discrepancy Highlight */}
          <div className="bg-surface-container-lowest rounded p-space-sm flex flex-col gap-space-xs border border-outline-variant/30">
            <div className="flex items-center justify-between text-caption font-caption text-on-surface-variant pb-1">
              <span>Declared Parcel Details</span>
              <span className="font-label-code text-[10px]">OCR CONFIDENCE: 98.4%</span>
            </div>
            <div className="grid grid-cols-2 gap-space-xs text-body-sm">
              <div className="flex flex-col bg-surface-container p-2 rounded">
                <span className="font-caption text-[11px] text-on-surface-variant">Survey Identification</span>
                <span className="font-data-numeric text-data-numeric text-on-surface font-semibold">
                  Sy. No. 142/2B &amp; 142/3
                </span>
              </div>
              <div className="flex flex-col bg-surface-container p-2 rounded">
                <span className="font-caption text-[11px] text-on-surface-variant">Tenure Classification</span>
                <span className="font-body-sm text-on-surface font-medium">Private Institutional</span>
              </div>
            </div>

            {/* Discrepant Land Area Flag Card */}
            <div className="relative mt-1 bg-secondary-container/25 rounded p-2.5 flex items-center justify-between border border-secondary/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">crop_free</span>
                <div className="flex flex-col">
                  <span className="font-caption text-[11px] text-on-surface-variant">Certified Converted Area</span>
                  <span className="font-data-numeric text-body-lg text-primary font-bold">4.20 ACRES</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-error text-on-error font-label-code text-[10px] tracking-tight font-medium">
                AMBIGUOUS OVERLAY
              </span>
            </div>
          </div>

          {/* Associated Explanatory Flag Callout */}
          <div
            onClick={() => onNavigate('matrix')}
            className="bg-surface-container-highest rounded p-space-sm flex gap-space-sm items-start cursor-pointer hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">report_problem</span>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenClauseModal('APH Cl. 4.14(b)');
                  }}
                  className="font-label-eyebrow text-[10px] uppercase tracking-wider text-error font-semibold hover:underline text-left"
                >
                  Statutory Clause Breach 4.14(B)
                </button>
                <span className="font-label-code text-[10px] text-on-surface-variant">Ref: Sale Deed #7192</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-tight">
                Area value deviates from primary Registered Title Deed. Registered conveyance grants{' '}
                <strong className="font-medium text-primary">2.40 acres</strong>, whereas conversion declaration claims{' '}
                <strong className="font-medium text-primary">4.20 acres</strong>. Difference:{' '}
                <span className="font-data-numeric text-error font-semibold">+1.80 acres unaccounted</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Trust Badges / Evidentiary Tenets */}
      <section className="flex flex-col gap-space-sm pb-space-lg">
        <div className="flex items-center gap-space-xs">
          <span className="font-label-code text-caption text-secondary font-semibold">§ 03.0</span>
          <span className="font-label-eyebrow text-label-eyebrow uppercase text-on-surface-variant">
            Archival System Standards
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs">
          <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-1 border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-[20px]">person_check</span>
            <span className="font-headline-sm text-[13px] text-primary font-medium">Human-in-Loop</span>
            <span className="font-caption text-caption text-on-surface-variant leading-snug">
              Deterministic adjudications only finalized by statutory officers.
            </span>
          </div>
          <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-1 border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-[20px]">fingerprint</span>
            <span className="font-headline-sm text-[13px] text-primary font-medium">Tamper-Evident</span>
            <span className="font-caption text-caption text-on-surface-variant leading-snug">
              Cryptographic SHA-256 ledger chaining for every inspection audit.
            </span>
          </div>
          <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-1 border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-[20px]">security</span>
            <span className="font-headline-sm text-[13px] text-primary font-medium">Encrypted Vault</span>
            <span className="font-caption text-caption text-on-surface-variant leading-snug">
              Air-gapped data residency compliant with Indian IT Act Section 43A.
            </span>
          </div>
          <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-1 border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-[20px]">model_training</span>
            <span className="font-headline-sm text-[13px] text-primary font-medium">Synthetic Grounding</span>
            <span className="font-caption text-caption text-on-surface-variant leading-snug">
              Calibrated on 14,000+ gazetted land conversion &amp; NOC rubrics.
            </span>
          </div>
        </div>
      </section>

      {/* Section 4: 9-Step Verification Pipeline */}
      <section className="flex flex-col gap-space-md pb-space-lg">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-code text-caption text-secondary font-semibold">§ 04.0</span>
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-on-surface-variant">
              The 9-Step Protocol
            </span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-primary font-medium">Systematic Scrutiny Trajectory</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Linear evidentiary decomposition from initial intake to final committee sign-off.
          </p>
        </div>

        {/* Vertical Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xs">
          {[
            { step: '01', title: 'Ingest Dossier', badge: 'PDF / TIFF / JPEG', desc: 'Multipage bundle submission via secure institution gateway.' },
            { step: '02', title: 'Pre-Processing', badge: 'Deskew & Clean', desc: 'Geometric deskewing, stamp isolation, resolution standardization.' },
            { step: '03', title: 'Statutory Classify', badge: 'Type Matching', desc: 'Sorts Land Deeds, Building NOCs, Fire Approvals & Affidavits.' },
            { step: '04', title: 'Multilingual OCR', badge: 'Regional + English', desc: 'Deep character parsing for Kannada, Devanagari, Tamil & English seals.' },
            { step: '05', title: 'Authenticity Check', badge: 'Forensic Level', desc: 'QR payload decoders, digital signature chain verification & splicing alerts.' },
            { step: '06', title: 'Cross-Consistency', badge: 'Cross-Correlate', desc: 'Synchronizes Trust names, Khata IDs, survey numbers across all 18 certificates.' },
            { step: '07', title: 'AICTE Handbook', badge: 'APH Clauses', desc: 'Validates FAR ratios, setback standards, and minimum acreage requirements.' },
            { step: '08', title: 'Explainable Scoring', badge: 'Weighted Metric', desc: 'Constructs evidentiary tree citing specific statutes for any flagged variance.' },
            { step: '09', title: 'Officer Adjudication', badge: 'Final Seal', desc: 'Appointed regional scrutiny officer accepts, overrides, or requests remap.' },
          ].map((item, idx) => (
            <div
              key={item.step}
              className={`p-3 rounded-lg flex items-start gap-space-sm border ${
                idx === 8
                  ? 'bg-surface-container-high border-secondary/40'
                  : 'bg-surface-container-low border-outline-variant/30'
              }`}
            >
              <span className={`font-label-code text-data-numeric font-bold ${idx === 8 ? 'text-primary' : 'text-secondary'}`}>
                {item.step}
              </span>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-title-editorial text-[15px] text-primary font-medium">{item.title}</span>
                  <span
                    className={`font-label-code text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      idx === 8
                        ? 'bg-primary text-on-primary'
                        : idx === 5
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant mt-0.5 leading-snug">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: What We Check (3 Forensic Domains) */}
      <section className="flex flex-col gap-space-md pb-space-lg">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-code text-caption text-secondary font-semibold">§ 05.0</span>
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-on-surface-variant">
              Forensic Dimensions
            </span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-primary font-medium">Tripartite Scrutiny Model</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {/* Domain Card 1: Authenticity */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-xs shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              <h4 className="font-title-editorial text-title-editorial text-primary font-medium">Document Authenticity</h4>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Forensic assessment of digital integrity and physical cert provenance.
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center gap-2 font-caption text-caption text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Metadata history forensics &amp; font forgery detection</span>
              </div>
              <div className="flex items-center gap-2 font-caption text-caption text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Cryptographic QR signature decoding vs State Registry</span>
              </div>
              <div className="flex items-center gap-2 font-caption text-caption text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Multi-institution deed reuse &amp; cross-state sharing</span>
              </div>
            </div>
          </div>

          {/* Domain Card 2: Consistency */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-xs shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">sync_alt</span>
              <h4 className="font-title-editorial text-title-editorial text-primary font-medium">Entity Consistency</h4>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Cross-document verification of legal entity identities and geographic descriptors.
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center gap-2 font-caption text-caption text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Fuzzy matching of Society/Trust registered naming variants</span>
              </div>
              <div className="flex items-center gap-2 font-caption text-caption text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Survey number continuity between Conversion &amp; Deeds</span>
              </div>
              <div className="flex items-center gap-2 font-caption text-caption text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Cadastral parcel shape and contiguous parcel boundary parity</span>
              </div>
            </div>
          </div>

          {/* Domain Card 3: Compliance */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-xs shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">gavel</span>
              <h4 className="font-title-editorial text-title-editorial text-primary font-medium">Statutory AICTE Compliance</h4>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Deterministic checks against the active Approval Process Handbook (2024–25).
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center gap-2 font-caption text-caption text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Urban / Rural minimum contiguous land acreage thresholds</span>
              </div>
              <div className="flex items-center gap-2 font-caption text-caption text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Clear 30-year leasehold encumbrance continuity</span>
              </div>
              <div className="flex items-center gap-2 font-caption text-caption text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Occupancy Certificate (OC) validity vs proposed built-up sq.ft</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Dual-Stakeholder Utility */}
      <section className="flex flex-col gap-space-md pb-space-lg">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-code text-caption text-secondary font-semibold">§ 06.0</span>
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-on-surface-variant">
              Dual-Stakeholder Utility
            </span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-primary font-medium">Purpose-Engineered Interfaces</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
          {/* For Institutions */}
          <div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-xs border border-outline-variant/40">
            <div className="flex items-center justify-between">
              <span className="font-label-eyebrow text-label-eyebrow uppercase text-secondary">Pre-Submission Auditing</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">account_balance</span>
            </div>
            <h4 className="font-title-editorial text-title-editorial text-primary font-medium">For Academic Institutions</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Identify and remediate conflicting declarations, outdated encumbrance certificates, or mismatching survey boundaries weeks before the statutory filing deadline. Prevent surprise rejection notes.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('upload')}
                className="font-label-code text-caption text-primary font-semibold underline flex items-center gap-1 hover:text-secondary"
              >
                <span>Upload Institutional Dossier</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* For Scrutiny Officers */}
          <div className="bg-primary text-on-primary p-space-md rounded-xl flex flex-col gap-space-xs shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-label-eyebrow text-label-eyebrow uppercase text-primary-fixed">Statutory Committee View</span>
              <span className="material-symbols-outlined text-primary-fixed text-[20px]">fact_check</span>
            </div>
            <h4 className="font-title-editorial text-title-editorial text-on-primary font-medium">For AICTE Scrutiny Officers</h4>
            <p className="font-body-sm text-body-sm text-surface-container-high leading-relaxed">
              Condense hours of manual cross-referencing into a highlighted 3-minute briefing. Zero in on questionable parcel conversions with direct citations to legal statutes and OCR diffs.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('review')}
                className="font-label-code text-caption text-primary-fixed font-semibold underline flex items-center gap-1 hover:text-white"
              >
                <span>Open Officer Adjudication Bench</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Statutory Caveat & Legal Notice */}
      <section className="pb-space-md">
        <div className="bg-surface-container-low p-space-md rounded-xl flex gap-space-sm items-start border border-outline-variant/30">
          <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">info</span>
          <div className="flex flex-col gap-1">
            <span className="font-label-eyebrow text-[10px] uppercase tracking-wider text-secondary font-semibold">
              Statutory Evidentiary Caveat
            </span>
            <p className="font-caption text-caption text-on-surface leading-relaxed">
              DOCSURE risk scores and discrepancy highlights are evidentiary indicators engineered strictly to assist appointed AICTE Scrutiny Committees and Regional Officers. They do not constitute a final administrative determination of approval, deficiency, or fraud. Administrative decisions remain under the sovereign purview of AICTE statutory provisions.
            </p>
          </div>
        </div>
      </section>

      {/* Section 8: Deep Ink Archival Colophon / Footer */}
      <footer className="bg-tertiary text-on-tertiary rounded-xl p-space-lg flex flex-col gap-space-md border border-tertiary-container shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-title-editorial text-title-editorial tracking-tight text-white font-medium">DOCSURE</span>
            <span className="font-caption text-[11px] text-on-tertiary-container">AICTE Regulatory Verification Suite</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center text-primary-fixed font-label-code text-caption font-bold">
            3.2
          </div>
        </div>
        <div className="flex flex-col gap-1 text-on-tertiary-container font-caption text-caption">
          <span>AICTE Approval Process Handbook (APH) 2024–25 Certified Protocol</span>
          <span>National Informatics Centre (NIC) Interoperable Data Standards</span>
          <span className="text-[10px] text-outline-variant pt-2">© 2026 All Rights Reserved. Sovereign Scrutiny Engine.</span>
        </div>
      </footer>
    </div>
  );
};
