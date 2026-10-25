import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficerProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tertiary/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-surface-container-lowest border border-border-hairline rounded-lg shadow-xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-primary px-5 py-4 text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary-fixed">badge</span>
            <div>
              <span className="font-label-eyebrow text-label-eyebrow uppercase text-primary-fixed tracking-widest block">
                Statutory Credential
              </span>
              <h3 className="font-title-editorial text-title-editorial font-medium">Scrutiny Officer Identity</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-primary-fixed hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 bg-surface">
          <div className="flex items-center gap-3">
            <img
              alt="Officer A. Verma"
              className="w-14 h-14 rounded-full object-cover border-2 border-secondary/30 shrink-0"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6mBdOvrj3STQKYzqtoUhclbmVhx_bhpQ7Lf6gZa2hVkPimvUWwcSi41iwB5PDSAA54wGORFZQP6c_M8wUuGXqJsxGutdd1U6WDwx_MuOmcNe6IYB2pQ28zGJsYnm9_qfglgeyZDF9CTgsnAf52J_UlKtp0i20IvHtk9gCVeRSulWKGciOIVyW8d9SYKzUoj550bvXYpMUZ4KMjGAv4fw4_x-ynwKdvnSDPtjZu1ug29cXhO5KJoOqqg"
            />
            <div className="min-w-0">
              <h4 className="font-headline-sm text-base text-primary font-medium">A. Verma</h4>
              <p className="font-caption text-secondary font-medium">Senior Scrutiny Officer</p>
              <p className="font-label-code text-[11px] text-on-surface-variant">Reg. IV Gazette Officer #8419</p>
            </div>
          </div>

          <div className="bg-surface-container-low p-3 rounded space-y-2 text-caption">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-on-surface-variant font-caption">Jurisdiction:</span>
              <span className="font-semibold text-primary">South-Western Regional Office (SWRO)</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-on-surface-variant font-caption">HQ Secretariat:</span>
              <span className="text-on-surface">Bengaluru, Karnataka</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-on-surface-variant font-caption">Current Docket:</span>
              <span className="font-label-code text-primary font-medium">AICTE/2025/SWR-10492</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-on-surface-variant font-caption">Digital Signature Cert:</span>
              <span className="font-label-code text-secondary font-semibold">Class III Valid 2027</span>
            </div>
          </div>

          <div className="p-2.5 bg-secondary-container/20 rounded flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5 shrink-0">verified_user</span>
            <p className="font-caption text-[11px] text-on-surface leading-tight">
              Authorized to execute formal Show-Cause notices, grant hearing referrals, or endorse institutional compliance certificates under AICTE Act 1987.
            </p>
          </div>
        </div>

        <div className="p-3 bg-surface-container-low border-t border-border-hairline text-right">
          <button
            onClick={onClose}
            className="w-full py-2 bg-primary text-on-primary font-label-eyebrow uppercase text-[11px] tracking-wider rounded font-medium hover:bg-primary-container transition-colors"
          >
            Acknowledge Officer Credentials
          </button>
        </div>
      </div>
    </div>
  );
};
