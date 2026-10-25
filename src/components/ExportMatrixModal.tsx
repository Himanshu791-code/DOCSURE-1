import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportMatrixModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tertiary/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-surface-container-lowest border border-border-hairline rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-surface-container-low px-5 py-4 border-b border-border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">verified</span>
            <div>
              <span className="font-label-eyebrow text-label-eyebrow uppercase text-secondary tracking-widest block">
                Official Regulatory Certificate
              </span>
              <h3 className="font-title-editorial text-title-editorial text-primary font-medium leading-none">
                Cross-Document Forensic Consistency Ledger
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Certificate / Archival Sheet Preview */}
        <div className="p-6 overflow-y-auto space-y-4 bg-surface no-scrollbar">
          <div className="border border-outline-variant bg-surface-container-low/40 p-6 rounded space-y-4 relative text-on-surface">
            {/* Watermark */}
            <div className="absolute right-4 top-4 opacity-20 pointer-events-none text-primary">
              <span className="material-symbols-outlined text-[80px]">gavel</span>
            </div>

            <div className="border-b border-outline-variant pb-3 flex justify-between items-start">
              <div>
                <span className="font-label-eyebrow uppercase tracking-widest text-secondary block text-[10px]">
                  ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
                </span>
                <h4 className="font-title-editorial text-xl text-primary font-medium">
                  Statutory Scrutiny Forensic Dossier #AICTE-2025-SWR-10492
                </h4>
                <p className="font-caption text-[11px] text-on-surface-variant">
                  South-Western Regional Office • Session 2025–26 Extension of Approval (EoA)
                </p>
              </div>
              <span className="px-2 py-0.5 bg-error-container text-on-error-container font-label-code text-[10px] font-bold rounded">
                EVIDENTIARY DEFICIT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-caption">
              <div>
                <span className="text-on-surface-variant text-[10px] uppercase font-label-eyebrow block">
                  Institution Name
                </span>
                <span className="font-body-sm font-semibold text-primary">
                  Vishweshwaraya Institute of Technology &amp; Management
                </span>
                <span className="block font-label-code text-[11px] text-on-surface-variant">PID: 1-93821094</span>
              </div>
              <div>
                <span className="text-on-surface-variant text-[10px] uppercase font-label-eyebrow block">
                  Scrutiny Date &amp; Cadre
                </span>
                <span className="font-label-code text-on-surface text-[11px]">22 Oct 2026 • 16:42 IST</span>
                <span className="block font-caption text-secondary font-medium">
                  Examined by Officer A. Verma (Gazette IV)
                </span>
              </div>
            </div>

            {/* Invariant Matrix Summary Table */}
            <div className="border border-outline-variant rounded overflow-hidden text-[11px] font-label-code">
              <div className="bg-surface-container px-3 py-1.5 font-bold text-primary flex justify-between">
                <span>INVARIANT STATUTORY AUDIT SUMMARY</span>
                <span>CONCORDANCE: 68.4%</span>
              </div>
              <div className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
                <div className="p-2 flex justify-between items-center">
                  <span>01. Trust / Society Nomenclature</span>
                  <span className="text-secondary font-semibold">88.4% Fuzzy Equivalence (Affidavit Req.)</span>
                </div>
                <div className="p-2 flex justify-between items-center bg-error-container/20 text-error">
                  <span className="font-semibold">02. Campus Contiguous Land Acreage</span>
                  <span className="font-bold">-1.80 Acre Deficit (Mandatory Min 4.00 Ac)</span>
                </div>
                <div className="p-2 flex justify-between items-center">
                  <span>03. Revenue Cadastre Plot Identification</span>
                  <span className="text-secondary">Sub-plot 142/2 Municipal Sanction Absent</span>
                </div>
                <div className="p-2 flex justify-between items-center">
                  <span>04. Authorized Signatory Chain-of-Title</span>
                  <span className="text-on-surface-variant">Attested via Trust Resolution #12</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof Strip */}
            <div className="bg-surface-container p-3 rounded space-y-1 font-label-code text-[10px]">
              <div className="flex justify-between text-on-surface-variant">
                <span>AICTE-ENGINE: v3.2-SHA256</span>
                <span>SEAL: VERIFIED-GOVT-SWR</span>
              </div>
              <div className="text-primary font-bold break-all">
                HASH: 0x9f4a18ce84d2b2719cfa082104192b0018a12c813f890a2391bde4410
              </div>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="p-4 bg-surface-container-low border-t border-border-hairline flex items-center justify-between">
          <span className="text-caption text-on-surface-variant text-[11px]">
            {downloaded ? '✓ Cryptographic PDF dossier exported to local storage.' : 'Export conforms to Indian IT Act Sec. 43A.'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded text-body-sm text-on-surface-variant hover:text-on-surface font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 rounded bg-primary text-on-primary font-body-sm font-medium hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {downloading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Generating Signed PDF...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download Signed PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
