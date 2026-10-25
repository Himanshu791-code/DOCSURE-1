import React, { useState } from 'react';
import { AICTE_REGULATORY_INDEX } from '../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectClause?: (clause: string) => void;
}

export const RegulatoryIndexModal: React.FC<Props> = ({ isOpen, onClose, onSelectClause }) => {
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'All' | 'High' | 'Moderate' | 'Low'>('All');

  if (!isOpen) return null;

  const filtered = AICTE_REGULATORY_INDEX.filter((item) => {
    const matchesSearch =
      item.clause.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = selectedSeverity === 'All' || item.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tertiary/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-surface-container-lowest border border-border-hairline rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-surface-container-low px-5 py-4 border-b border-border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">menu_book</span>
            <div>
              <span className="font-label-eyebrow text-label-eyebrow uppercase text-secondary tracking-widest block">
                Statutory Reference Codex
              </span>
              <h3 className="font-title-editorial text-title-editorial text-primary font-medium leading-none">
                AICTE Approval Process Handbook (APH 2024–25)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-surface-container/40 border-b border-border-hairline space-y-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search handbook clauses, keywords (e.g. land, fire, cadre)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface text-body-sm rounded border border-outline-variant focus:outline-none focus:border-primary font-caption text-on-surface"
            />
          </div>

          <div className="flex items-center gap-1.5 text-caption font-label-code">
            <span className="text-on-surface-variant text-[11px] mr-1">Severity:</span>
            {(['All', 'High', 'Moderate', 'Low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedSeverity === sev
                    ? 'bg-primary text-on-primary font-medium'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Clause List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-on-surface-variant font-caption">
              No statutory clauses matching query &ldquo;{search}&rdquo;.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.clause}
                onClick={() => {
                  onSelectClause?.(item.clause);
                  onClose();
                }}
                className="p-3 bg-surface-container-low rounded border border-outline-variant/50 hover:border-secondary transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-label-code text-[11px] font-bold text-primary group-hover:text-secondary">
                    {item.clause}
                  </span>
                  <span
                    className={`text-[10px] font-label-code px-1.5 py-0.2 rounded font-semibold ${
                      item.severity === 'High'
                        ? 'bg-error-container text-on-error-container'
                        : item.severity === 'Moderate'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {item.severity} Risk
                  </span>
                </div>
                <h4 className="font-body-sm font-semibold text-primary leading-snug">{item.title}</h4>
                <p className="font-caption text-caption text-on-surface-variant mt-1 leading-relaxed">
                  {item.summary}
                </p>
                <div className="mt-2 pt-1.5 border-t border-outline-variant/30 flex items-start gap-1 text-[11px] text-error font-caption">
                  <span className="font-medium text-on-surface-variant shrink-0">Statutory Penalty:</span>
                  <span>{item.penalty}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-surface-container-low border-t border-border-hairline flex items-center justify-between text-caption text-[11px] text-on-surface-variant">
          <span>AICTE Act No. 52 of 1987 Gazette Corpus</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-surface-container text-primary font-medium rounded hover:bg-surface-container-high transition-colors"
          >
            Dismiss Codex
          </button>
        </div>
      </div>
    </div>
  );
};
