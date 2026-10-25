import React, { useState } from 'react';
import { NavTab, ApplicationRecord, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenRegulatoryIndex: () => void;
  onOpenProfile: () => void;
  applications: ApplicationRecord[];
  currentAppId: string;
  onSelectApplication: (appId: string) => void;
  onResetDemoData: () => Promise<void>;
}

const TAB_CONFIG: { key: NavTab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: 'dashboard' },
  { key: 'upload', label: 'Upload', icon: 'upload_file' },
  { key: 'summary', label: 'Summary', icon: 'analytics' },
  { key: 'review', label: 'Review', icon: 'gavel' },
  { key: 'matrix', label: 'Matrix', icon: 'compare_arrows' },
];

export const Header: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onOpenRegulatoryIndex,
  onOpenProfile,
  applications,
  currentAppId,
  onSelectApplication,
  onResetDemoData,
}) => {
  const { currentUser, switchDemoRole, signInWithGoogle, signOut } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [appMenuOpen, setAppMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const currentApp = applications.find((a) => a.id === currentAppId) || applications[0];

  const handleReset = async () => {
    setIsResetting(true);
    await onResetDemoData();
    setIsResetting(false);
  };

  const getRoleLabel = (role: UserRole) => {
    if (role === 'admin') return 'Central Administrator';
    if (role === 'officer') return 'Regulatory Officer';
    return 'Institution Applicant';
  };

  const getRoleBadgeClass = (role: UserRole) => {
    if (role === 'admin') return 'bg-tertiary text-on-tertiary';
    if (role === 'officer') return 'bg-primary text-on-primary';
    return 'bg-secondary-container text-on-secondary-container';
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-surface/98 backdrop-blur-md border-b border-outline-variant/30 pt-safe">
      {/* Primary Top Bar */}
      <div className="h-16 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <button
                type="button"
                onClick={() => onTabChange('overview')}
                className="font-headline-sm text-lg md:text-xl text-primary font-medium tracking-tight text-left cursor-pointer hover:opacity-85 transition-opacity"
              >
                DOCSURE
              </button>
            </div>
            <span className="text-[10px] md:text-[11px] font-caption text-on-surface-variant tracking-normal">
              AICTE Regulatory Audit System
            </span>
          </div>
        </div>

        {/* Application Selector (for Officers and Admins) */}
        <div className="relative hidden lg:block max-w-xs xl:max-w-md w-full">
          {currentUser?.role === 'applicant' ? (
            <div className="px-3 py-1.5 bg-surface-container-low rounded border border-outline-variant/40 flex items-center justify-between text-caption">
              <span className="text-primary font-medium truncate">
                {currentApp?.institutionName || 'My Institution Application'}
              </span>
              <span className="font-label-code text-[10px] text-secondary ml-2 shrink-0">
                {currentApp?.dossierRef}
              </span>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setAppMenuOpen(!appMenuOpen)}
                className="w-full px-3 py-1.5 bg-surface-container-low hover:bg-surface-container rounded border border-outline-variant/40 flex items-center justify-between text-left text-caption transition-colors cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-primary truncate text-[11px]">
                      {currentApp?.institutionName || 'Select Application'}
                    </span>
                    <span
                      className={`text-[9px] font-label-code px-1 rounded font-bold uppercase ${
                        currentApp?.status === 'flagged'
                          ? 'bg-error-container text-on-error-container'
                          : currentApp?.status === 'approved'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {currentApp?.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-label-code text-[10px] text-on-surface-variant block truncate">
                    Ref: {currentApp?.dossierRef} • Score: {currentApp?.riskScore}/100
                  </span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                  arrow_drop_down
                </span>
              </button>

              {appMenuOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded shadow-lg z-50 overflow-hidden divide-y divide-outline-variant/20">
                  <div className="px-3 py-1.5 bg-surface-container-low text-[10px] font-label-eyebrow uppercase text-secondary">
                    Demonstration Dossiers ({applications.length})
                  </div>
                  {applications.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        onSelectApplication(app.id);
                        setAppMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-surface-container-low transition-colors flex items-center justify-between text-caption cursor-pointer ${
                        app.id === currentAppId ? 'bg-surface-container/60 font-semibold' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-primary truncate text-[11px]">{app.institutionName}</p>
                        <p className="font-label-code text-[10px] text-on-surface-variant">
                          {app.dossierRef} • {app.region}
                        </p>
                      </div>
                      <span className="font-data-numeric text-xs font-bold text-primary ml-2 shrink-0">
                        {app.riskScore}/100
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Seed/Reset Demo Button */}
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            title="Reset / Seed Demonstration Data in Firestore"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-[11px] font-label-code text-on-surface-variant transition-colors cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[14px] ${isResetting ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isResetting ? 'Seeding...' : 'Reset Demo'}</span>
          </button>

          {/* Regulatory Codex Modal Trigger */}
          <button
            aria-label="Statutory Codex Index"
            title="AICTE APH Statutory Codex & Handbook Clauses"
            type="button"
            onClick={onOpenRegulatoryIndex}
            className="w-9 h-9 rounded flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
          </button>

          {/* Role Badge & Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/30"
            >
              <img
                alt="User"
                className="w-7 h-7 rounded-full object-cover border border-secondary/40 shrink-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6mBdOvrj3STQKYzqtoUhclbmVhx_bhpQ7Lf6gZa2hVkPimvUWwcSi41iwB5PDSAA54wGORFZQP6c_M8wUuGXqJsxGutdd1U6WDwx_MuOmcNe6IYB2pQ28zGJsYnm9_qfglgeyZDF9CTgsnAf52J_UlKtp0i20IvHtk9gCVeRSulWKGciOIVyW8d9SYKzUoj550bvXYpMUZ4KMjGAv4fw4_x-ynwKdvnSDPtjZu1ug29cXhO5KJoOqqg"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-medium text-primary leading-tight truncate max-w-[120px]">
                  {currentUser?.displayName || 'Official'}
                </span>
                <span className="text-[9px] font-label-code text-secondary font-semibold uppercase">
                  {getRoleLabel(currentUser?.role || 'officer')}
                </span>
              </div>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                arrow_drop_down
              </span>
            </button>

            {/* Role Switcher Menu */}
            {roleMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-surface-container-lowest border border-outline-variant rounded shadow-xl z-50 p-2 text-caption">
                <div className="pb-2 border-b border-outline-variant/30 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label-eyebrow text-[10px] text-on-surface-variant uppercase">
                      Current Session
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-label-code font-bold ${getRoleBadgeClass(currentUser?.role || 'officer')}`}>
                      {currentUser?.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-medium text-primary text-xs mt-1 truncate">{currentUser?.displayName}</p>
                  <p className="text-[10px] text-on-surface-variant truncate font-label-code">{currentUser?.email}</p>
                </div>

                {/* SIH Multi-Role Test Switcher */}
                <div className="space-y-1">
                  <span className="text-[10px] font-label-eyebrow uppercase text-secondary block px-1">
                    Demo Role Switcher (SIH Evaluation)
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      switchDemoRole('officer', undefined, 'A. Verma (Reg. IV Gazette Officer)');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left p-1.5 rounded text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                      currentUser?.role === 'officer'
                        ? 'bg-primary text-on-primary font-medium'
                        : 'hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span>Regulatory Officer (A. Verma)</span>
                    <span className="text-[10px] opacity-80">Officer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchDemoRole('admin', undefined, 'Dr. S. Rao (Central AICTE Admin)');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left p-1.5 rounded text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                      currentUser?.role === 'admin'
                        ? 'bg-primary text-on-primary font-medium'
                        : 'hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span>Central Administrator (AICTE)</span>
                    <span className="text-[10px] opacity-80">Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchDemoRole('applicant', 'inst-vitm', 'Dean of Affairs (Vishweshwaraya Inst.)');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left p-1.5 rounded text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                      currentUser?.role === 'applicant'
                        ? 'bg-primary text-on-primary font-medium'
                        : 'hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span>Institution Applicant (VITM)</span>
                    <span className="text-[10px] opacity-80">Applicant</span>
                  </button>
                </div>

                {/* Google Sign-in / Sign-out */}
                <div className="mt-2 pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signInWithGoogle();
                        setRoleMenuOpen(false);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">login</span>
                    Google Sign-In
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      setRoleMenuOpen(false);
                    }}
                    className="text-[11px] text-error hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Horizontal Navigation Bar (Desktop & Tablet) */}
      <div className="hidden md:block bg-surface-container-low/70 border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-10">
          <nav className="flex items-center gap-1" aria-label="Desktop Navigation">
            {TAB_CONFIG.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onTabChange(item.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`h-8 px-3 rounded text-caption font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-surface text-primary border border-outline-variant/40 font-semibold shadow-2xs'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Context indicator */}
          <div className="flex items-center gap-2 text-[11px] font-caption text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>Docket: {currentApp?.dossierRef || 'AICTE/2025/SWR-10492'}</span>
            <span className="text-outline">•</span>
            <span className="font-label-code text-[10px] text-secondary">
              Role: {currentUser?.role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
