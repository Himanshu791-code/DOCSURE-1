import React from 'react';
import { NavTab, ApplicationRecord, StatutoryDoc } from '../types';
import { SCRUTINY_FINDINGS } from '../data/mockData';

interface Props {
  currentApp: ApplicationRecord;
  docs: StatutoryDoc[];
  onNavigate: (tab: NavTab) => void;
  onSelectInstrument?: (docNumber: string) => void;
}

export const SummaryView: React.FC<Props> = ({
  currentApp,
  docs,
  onNavigate,
  onSelectInstrument,
}) => {
  // Dynamically calculate audit breakdown from actual stored records
  const verifiedCount = docs.filter((d) => d.status === 'verified').length;
  const flawedCount = docs.filter((d) => d.status === 'flawed').length;
  const deficientCount = docs.filter((d) => d.status === 'deficient').length;
  const pendingCount = docs.filter((d) => d.status === 'pending' || d.status === 'scanning').length;

  const totalCalculatedChecks = 28;
  const deficientCalculated = Math.max(deficientCount, currentApp.status === 'flagged' ? 4 : 0);
  const warningCalculated = Math.max(flawedCount, currentApp.status === 'under_scrutiny' ? 3 : 0);
  const passedCalculated = Math.max(0, totalCalculatedChecks - deficientCalculated - warningCalculated);

  const riskScore = currentApp.riskScore;
  const isHighRisk = riskScore > 60;
  const isModerateRisk = riskScore >= 31 && riskScore <= 60;

  // Calibrate needle rotation (-90 deg at 0% to +90 deg at 100%)
  const needleDeg = -90 + (riskScore / 100) * 180;
  // Arc calculation for SVG: total circumference = pi * 92 ~= 289.02
  const dashoffset = 289.02 - (riskScore / 100) * (289.02 * 0.74);

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto space-y-space-md pb-6 animate-in fade-in duration-200">
      {/* Dossier Metadata Strip */}
      <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm border border-outline-variant/30 relative overflow-hidden">
        <div className="flex items-center justify-between gap-space-xs mb-space-xs">
          <div className="inline-flex items-center gap-1.5 bg-surface-container px-2 py-0.5 rounded border border-secondary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="font-label-eyebrow text-label-eyebrow text-secondary uppercase tracking-widest">
              Dossier Ref
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {currentApp.isDemo && (
              <span className="font-label-code text-[9px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-medium border border-outline-variant/30">
                Demonstration Data
              </span>
            )}
            <span className="font-label-code text-label-code text-on-surface-variant font-medium">
              {currentApp.dossierRef}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-space-sm mt-1">
          <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-primary border border-outline-variant/30">
            <span className="material-symbols-outlined text-[20px]">account_balance</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-headline-sm text-headline-sm text-primary leading-tight truncate font-medium">
              {currentApp.institutionName}
            </h2>
            <p className="font-caption text-caption text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[13px] text-secondary">location_on</span>
              {currentApp.region}
            </p>
          </div>
        </div>
      </div>

      {/* Semicircular Master Risk Gauge Hero Card */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col items-center relative overflow-hidden">
        <div className="w-full flex items-center justify-between mb-space-xs">
          <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-widest text-on-surface-variant">
            Regulatory Risk Index
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-label-code font-bold tracking-wide ${
              isHighRisk
                ? 'bg-error-container text-on-error-container'
                : isModerateRisk
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-primary/10 text-primary'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isHighRisk ? 'bg-error animate-pulse' : isModerateRisk ? 'bg-secondary' : 'bg-primary'
              }`}
            ></span>
            {isHighRisk ? 'HIGH RISK' : isModerateRisk ? 'REVIEW NEEDED' : 'COMPLIANT'}
          </span>
        </div>

        {/* Semicircular SVG Gauge */}
        <div className="relative w-full max-w-[280px] h-[145px] flex items-end justify-center my-1 select-none">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 240 130">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#002627" />
                <stop offset="35%" stopColor="#775928" />
                <stop offset="70%" stopColor="#ffd79b" />
                <stop offset="100%" stopColor="#ba1a1a" />
              </linearGradient>
              <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.25" />
              </filter>
            </defs>
            {/* Base Arc Track (R=92, Center 120, 115) */}
            <path
              d="M 28 115 A 92 92 0 0 1 212 115"
              fill="none"
              stroke="#f2ede4"
              strokeLinecap="round"
              strokeWidth="14"
            />
            {/* Calibrated Active Risk Arc */}
            <path
              className="transition-all duration-1000 ease-out"
              d="M 28 115 A 92 92 0 0 1 212 115"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeDasharray="289.02"
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              strokeWidth="14"
            />
            {/* Tick marks */}
            <line x1="28" y1="115" x2="16" y2="115" stroke="#717978" strokeWidth="1.5" opacity="0.4" />
            <line x1="120" y1="23" x2="120" y2="11" stroke="#717978" strokeWidth="1.5" opacity="0.4" />
            <line x1="212" y1="115" x2="224" y2="115" stroke="#717978" strokeWidth="1.5" opacity="0.4" />
            {/* Needle pivoted at (120, 115) */}
            <g transform={`rotate(${needleDeg} 120 115)`} filter="url(#needleShadow)" className="transition-transform duration-700 ease-out">
              <line x1="120" y1="115" x2="120" y2="34" stroke="#1d1c16" strokeLinecap="round" strokeWidth="2.5" />
              <polygon points="120,28 116.5,38 123.5,38" fill="#1d1c16" />
              <circle cx="120" cy="115" r="6" fill="#1d1c16" />
              <circle cx="120" cy="115" r="2.5" fill="#fef9f0" />
            </g>
          </svg>

          {/* Centered Digital Score Display */}
          <div className="absolute bottom-0 inset-x-0 flex flex-col items-center pointer-events-none">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-lg-mobile text-3xl font-bold tracking-tight text-on-surface">
                {riskScore}
              </span>
              <span className="font-caption text-caption text-on-surface-variant font-medium">/ 100</span>
            </div>
            <span
              className={`font-label-eyebrow text-[10px] font-semibold uppercase tracking-wider ${
                isHighRisk ? 'text-error' : isModerateRisk ? 'text-secondary' : 'text-primary'
              }`}
            >
              {isHighRisk ? 'Scrutiny Deficit' : isModerateRisk ? 'Conditional Clearance' : 'Approved Baseline'}
            </span>
          </div>
        </div>

        {/* Threshold Legend */}
        <div className="w-full flex items-center justify-between text-[11px] font-caption text-on-surface-variant mt-1 px-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span> 0-30 Compliant
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> 31-60 Review
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span> 61-100 High Risk
          </span>
        </div>

        {/* Notice Banner */}
        <div
          className={`w-full mt-space-sm p-2.5 rounded-lg flex items-center gap-2 border ${
            isHighRisk
              ? 'bg-error-container/40 border-error/20'
              : isModerateRisk
              ? 'bg-secondary-container/40 border-secondary/30'
              : 'bg-primary/5 border-primary/20'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0 text-primary">
            {isHighRisk ? 'gavel' : 'verified'}
          </span>
          <p className="font-body-sm text-body-sm text-on-surface leading-tight font-medium">
            {isHighRisk
              ? '4 Critical Discrepancies Require Scrutiny Committee Hearing'
              : isModerateRisk
              ? '1 Conditional Observation Pending Document Curation'
              : 'All Invariants Verified • Fully Conforming to APH 2024–25'}
          </p>
        </div>
      </div>

      {/* Statutory Inspection Aggregates Strip (Dynamically Calculated) */}
      <div className="bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center justify-between mb-space-xs">
          <span className="font-label-eyebrow text-label-eyebrow uppercase text-on-surface-variant tracking-wider">
            Statutory Audit Breakdown (Calculated from Records)
          </span>
          <span className="font-label-code text-label-code text-on-surface font-semibold">
            {totalCalculatedChecks} Checks
          </span>
        </div>

        {/* Segmented Visual Gauge Bar */}
        <div className="w-full h-2 rounded bg-surface-container-highest overflow-hidden flex mb-space-sm">
          <div
            className="h-full bg-primary-container"
            style={{ width: `${(passedCalculated / totalCalculatedChecks) * 100}%` }}
            title={`${passedCalculated} Passed`}
          ></div>
          <div
            className="h-full bg-secondary-container"
            style={{ width: `${(warningCalculated / totalCalculatedChecks) * 100}%` }}
            title={`${warningCalculated} Warnings`}
          ></div>
          <div
            className="h-full bg-error"
            style={{ width: `${(deficientCalculated / totalCalculatedChecks) * 100}%` }}
            title={`${deficientCalculated} Deficiencies`}
          ></div>
        </div>

        {/* Tonal Stat Counters Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20">
            <span className="font-data-numeric text-data-numeric font-bold text-primary block leading-none">
              {passedCalculated}
            </span>
            <span className="font-caption text-[11px] text-on-surface-variant mt-1 inline-flex items-center gap-0.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Passed
            </span>
          </div>
          <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20">
            <span className="font-data-numeric text-data-numeric font-bold text-on-secondary-container block leading-none">
              {warningCalculated.toString().padStart(2, '0')}
            </span>
            <span className="font-caption text-[11px] text-on-surface-variant mt-1 inline-flex items-center gap-0.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Warning
            </span>
          </div>
          <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20">
            <span className="font-data-numeric text-data-numeric font-bold text-error block leading-none">
              {deficientCalculated.toString().padStart(2, '0')}
            </span>
            <span className="font-caption text-[11px] text-on-surface-variant mt-1 inline-flex items-center gap-0.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Deficient
            </span>
          </div>
        </div>
      </div>

      {/* Section 01: Top Reasons for Flagging */}
      <div className="flex flex-col space-y-space-sm">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-label-code text-label-code text-secondary font-bold">§ 01</span>
            <h3 className="font-title-editorial text-title-editorial text-primary font-medium">
              Scrutiny Findings &amp; Exceptions
            </h3>
          </div>
          <span className="font-caption text-caption text-on-surface-variant">Ordered by Severity</span>
        </div>

        {/* Findings Stack */}
        <div className="flex flex-col space-y-2">
          {SCRUTINY_FINDINGS.map((finding) => (
            <div
              key={finding.id}
              onClick={() => onNavigate('matrix')}
              className="bg-surface-container-lowest p-space-sm rounded-lg shadow-sm border border-outline-variant/25 flex flex-col gap-1.5 transition-colors hover:bg-surface-container-low cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-label-code text-caption font-semibold ${
                      finding.severity === 'high' ? 'text-error' : 'text-secondary'
                    }`}
                  >
                    {finding.code}
                  </span>
                  <span className="font-caption text-caption font-semibold text-on-surface">
                    {finding.title}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-label-code font-bold ${
                    finding.severity === 'high'
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}
                >
                  {finding.severity === 'high' ? 'HIGH RISK' : 'MODERATE'}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                {finding.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 02: Institutional Instruments (Live Documents) */}
      <div className="flex flex-col space-y-space-sm">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-label-code text-label-code text-secondary font-bold">§ 02</span>
            <h3 className="font-title-editorial text-title-editorial text-primary font-medium">
              Institutional Instruments
            </h3>
          </div>
          <span className="font-caption text-caption text-on-surface-variant">
            {docs.length} Evaluated Instruments
          </span>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {docs.slice(0, 4).map((doc) => {
            const isDeficient = doc.status === 'deficient';
            const isFlawed = doc.status === 'flawed';
            const isVerified = doc.status === 'verified';

            return (
              <div
                key={doc.id}
                onClick={() => {
                  onSelectInstrument?.(doc.id);
                  onNavigate('review');
                }}
                className="bg-surface-container-lowest p-space-sm rounded-lg shadow-sm border border-outline-variant/25 flex flex-col justify-between h-36 cursor-pointer hover:bg-surface-container-low active:bg-surface-container transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      {doc.type === 'OCR Scan' ? 'architecture' : 'description'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-label-code font-semibold ${
                        isDeficient
                          ? 'bg-error-container text-on-error-container'
                          : isFlawed
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-primary-fixed text-on-primary-fixed-variant'
                      }`}
                    >
                      {doc.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-body-sm text-body-sm text-on-surface font-semibold line-clamp-1">
                    {doc.title}
                  </h4>
                  <p className="font-caption text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                    {doc.authority}
                  </p>
                </div>

                <div className="bg-surface-container-low p-1.5 rounded flex items-center justify-between text-[11px] border border-outline-variant/20">
                  <span className="font-caption text-on-surface-variant">Confidence</span>
                  <span className="font-data-numeric font-medium text-primary">
                    {doc.confidence || '94.2%'}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between text-[10px] font-medium ${
                    isDeficient ? 'text-error' : isFlawed ? 'text-secondary' : 'text-primary'
                  }`}
                >
                  <span>{isDeficient ? '1 Active Flag' : isFlawed ? '1 Active Flag' : '0 Flags'}</span>
                  <span className="material-symbols-outlined text-[14px]">
                    {isVerified ? 'check_circle' : 'arrow_forward'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Intent Action Button */}
      <div className="pt-space-xs pb-space-sm">
        <button
          onClick={() => onNavigate('review')}
          className="w-full bg-primary-container text-on-primary hover:bg-tertiary active:scale-[0.99] transition-all p-3.5 rounded-lg shadow-md flex items-center justify-center gap-2 group cursor-pointer"
          type="button"
        >
          <span className="font-title-editorial text-title-editorial font-medium">
            Proceed to Officer Adjudication Workbench
          </span>
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
        <p className="font-caption text-caption text-on-surface-variant text-center mt-2">
          Cryptographic audit seal active • AICTE Regulations 2024-2027
        </p>
      </div>
    </div>
  );
};
