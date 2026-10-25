import React from 'react';
import { NavTab } from '../types';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface NavItem {
  key: NavTab;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: 'dashboard' },
  { key: 'upload', label: 'Upload', icon: 'upload_file' },
  { key: 'summary', label: 'Summary', icon: 'analytics' },
  { key: 'review', label: 'Review', icon: 'gavel' },
  { key: 'matrix', label: 'Matrix', icon: 'compare_arrows' },
];

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    /* Only visible on mobile/tablet viewports; desktop uses the compact horizontal bar */
    <nav
      className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-surface/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-sm block md:hidden"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-space-xs">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-primary font-medium'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? 'font-semibold' : ''}`}>
                {item.icon}
              </span>
              <span className="font-caption text-[10px] tracking-tight mt-0.5">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-secondary"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
