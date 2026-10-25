import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'affidavit' | 'replace-file';
  onSuccess: (fileName: string) => void;
}

export const AffidavitModal: React.FC<Props> = ({ isOpen, onClose, type, onSuccess }) => {
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [affidavitNumber, setAffidavitNumber] = useState(
    type === 'affidavit' ? 'AFF-KA-BLR-2024/9912' : 'NOC-DFS-RENEWAL-2025'
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSuccess(fileSelected ? fileSelected.name : type === 'affidavit' ? 'Notarized_Name_Affidavit_2025.pdf' : 'State_Fire_NOC_Renewal_Order_2025.pdf');
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tertiary/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-surface-container-lowest border border-border-hairline rounded-lg shadow-xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-surface-container-low px-5 py-4 border-b border-border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">
              {type === 'affidavit' ? 'history_edu' : 'upload_file'}
            </span>
            <div>
              <span className="font-label-eyebrow text-label-eyebrow uppercase text-secondary tracking-widest block">
                {type === 'affidavit' ? 'Deficiency Cure' : 'Document Replacement'}
              </span>
              <h3 className="font-title-editorial text-title-editorial text-primary font-medium leading-none">
                {type === 'affidavit' ? 'Attach Notarized Name Affidavit' : 'Upload Validated Fire NOC Certificate'}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-surface">
          <div className="text-caption text-on-surface-variant leading-relaxed">
            {type === 'affidavit' ? (
              <span>
                To resolve the <strong>88.4% Title Mismatch</strong> between the Registered Sale Deed (<em>Shri Vishwesharaya Edu Trust</em>) and Portal Declaration (<em>Shri Vishweshwaraya Educational Trust</em>), submit an executive magistrate affidavit affirming identity identity invariance.
              </span>
            ) : (
              <span>
                Upload the renewed <strong>State Fire &amp; Emergency Services Safety Clearance</strong> valid through commencement of Academic Session 2025–26 (min validity required: 01 Aug 2025).
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="block font-caption text-[11px] uppercase tracking-wider text-on-surface font-semibold">
              {type === 'affidavit' ? 'Gazette / Notary Stamp Identifier' : 'Departmental Order / Receipt Reference'}
            </label>
            <input
              type="text"
              required
              value={affidavitNumber}
              onChange={(e) => setAffidavitNumber(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded font-label-code text-body-sm text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-caption text-[11px] uppercase tracking-wider text-on-surface font-semibold">
              Select Signed PDF / TIFF Instrument
            </label>
            <div className="border border-dashed border-outline-variant bg-surface-container-low/60 rounded p-4 text-center cursor-pointer hover:bg-surface-container transition-colors relative">
              <input
                type="file"
                accept=".pdf,.tif,.tiff,.jpg,.png"
                onChange={(e) => setFileSelected(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="material-symbols-outlined text-[24px] text-secondary block mb-1">
                cloud_upload
              </span>
              <p className="font-caption text-body-sm text-primary font-medium">
                {fileSelected ? fileSelected.name : 'Click to select signed statutory instrument'}
              </p>
              <p className="font-label-code text-[10px] text-on-surface-variant mt-0.5">
                {fileSelected ? `${(fileSelected.size / 1024).toFixed(1)} KB` : 'PDF / TIFF up to 25MB (Digital signature checked)'}
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-surface-container rounded text-[11px] font-label-code text-on-surface-variant flex items-center justify-between">
            <span>Cryptographic Target Hash:</span>
            <span className="text-secondary font-semibold">SHA-256 Auto-seal</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded text-body-sm text-on-surface-variant hover:text-on-surface transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-primary text-on-primary font-body-sm font-medium hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Hashing &amp; Verifying...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Ingest &amp; Attach Proof</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
