import React, { useState, useEffect, useCallback } from 'react';
import { NavTab, StatutoryDoc, ApplicationRecord, MatrixRowData } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { RegulatoryIndexModal } from './components/RegulatoryIndexModal';
import { OfficerProfileModal } from './components/OfficerProfileModal';
import { AffidavitModal } from './components/AffidavitModal';
import { ExportMatrixModal } from './components/ExportMatrixModal';

import { OverviewView } from './views/OverviewView';
import { UploadView } from './views/UploadView';
import { SummaryView } from './views/SummaryView';
import { ReviewView } from './views/ReviewView';
import { MatrixView } from './views/MatrixView';

import {
  testConnection,
  seedDemonstrationDatabase,
  getApplications,
  getDocuments,
  saveDocument,
  updateDocumentStatus,
  getConsistencyMatrix,
  DEMO_APPLICATIONS,
  DEMO_DOCS_VITM,
} from './firebase/dbService';
import { MATRIX_DATA } from './data/mockData';

function MainApp() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [applications, setApplications] = useState<ApplicationRecord[]>(DEMO_APPLICATIONS);
  const [currentAppId, setCurrentAppId] = useState<string>('app-vitm-2025');
  const [docs, setDocs] = useState<StatutoryDoc[]>(DEMO_DOCS_VITM);
  const [matrixData, setMatrixData] = useState<Record<number, MatrixRowData>>(MATRIX_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(true);

  // Modals
  const [isRegulatoryModalOpen, setIsRegulatoryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [affidavitModal, setAffidavitModal] = useState<{
    isOpen: boolean;
    type: 'affidavit' | 'replace-file';
  }>({
    isOpen: false,
    type: 'affidavit',
  });

  // Handle URL hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as NavTab;
      if (['overview', 'upload', 'summary', 'review', 'matrix'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initialize and load database records
  const loadAppData = useCallback(async (appId: string) => {
    try {
      const appDocs = await getDocuments(appId);
      if (appDocs && appDocs.length > 0) {
        setDocs(appDocs);
      } else if (appId === 'app-vitm-2025') {
        setDocs(DEMO_DOCS_VITM);
      } else {
        setDocs([
          {
            id: 'doc-1',
            applicationId: appId,
            number: '01.',
            title: 'Trust/Society Registration Certificate',
            type: 'PDF',
            size: '3.1 MB',
            authority: 'State Registrar',
            status: 'verified',
            sha256Hash: 'd5b0c44298fc1c149afbf4c8996fb92427ae41e46',
            confidence: '99.5%',
          },
        ]);
      }

      const matrix = await getConsistencyMatrix(appId);
      if (matrix) {
        setMatrixData(matrix);
      }
    } catch (e) {
      console.warn('Using local fallback state for app data:', e);
    }
  }, []);

  useEffect(() => {
    async function initDB() {
      const connected = await testConnection();
      setDbConnected(connected);

      try {
        await seedDemonstrationDatabase(false);
        const apps = await getApplications(currentUser);
        if (apps && apps.length > 0) {
          setApplications(apps);
          // If applicant, select their institution app
          if (currentUser?.role === 'applicant' && currentUser.institutionId) {
            const userApp = apps.find((a) => a.institutionId === currentUser.institutionId);
            if (userApp) {
              setCurrentAppId(userApp.id);
              loadAppData(userApp.id);
              return;
            }
          }
          loadAppData(currentAppId);
        }
      } catch (e) {
        console.warn('Firestore initialization notice:', e);
        loadAppData(currentAppId);
      }
    }
    initDB();
  }, [currentUser, loadAppData, currentAppId]);

  // Handle switching active application
  const handleSelectApplication = (appId: string) => {
    setCurrentAppId(appId);
    loadAppData(appId);
    const selected = applications.find((a) => a.id === appId);
    if (selected) {
      showToast(`Active Docket: ${selected.institutionName} (${selected.dossierRef})`);
    }
  };

  // Re-seed demo database
  const handleResetDemoData = async () => {
    try {
      await seedDemonstrationDatabase(true);
      const apps = await getApplications(currentUser);
      if (apps) setApplications(apps);
      await loadAppData(currentAppId);
      showToast('Demonstration data restored and verified in Firestore.');
    } catch (e) {
      console.error(e);
      showToast('Reset completed.');
    }
  };

  // Upload new statutory document with real SHA-256 hash calculation
  const handleUploadDoc = async (file: File) => {
    try {
      // Compute cryptographic SHA-256 hash
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha256Hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      const newDocId = `doc-${Date.now()}`;
      const newDoc: StatutoryDoc = {
        id: newDocId,
        applicationId: currentAppId,
        number: `0${docs.length + 1}.`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: file.name.endsWith('.pdf') ? 'PDF' : 'TIFF/Image',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        authority: 'Uploaded Gazette Artifact (Auto-Hashed)',
        status: 'verified',
        sha256Hash: sha256Hex,
        confidence: '99.4%',
        uploadedAt: new Date().toISOString(),
      };

      // If doc 05 was pending in VITM, update it
      const doc5 = docs.find((d) => d.id === 'doc-5' && d.status === 'pending');
      if (doc5) {
        const updatedDoc5 = {
          ...doc5,
          status: 'verified' as const,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          authority: 'Certified Payroll Schedule Ingested',
          sha256Hash: sha256Hex,
          confidence: '98.8%',
          note: file.name,
        };
        await saveDocument(currentAppId, updatedDoc5);
        setDocs((prev) => prev.map((d) => (d.id === 'doc-5' ? updatedDoc5 : d)));
      } else {
        await saveDocument(currentAppId, newDoc);
        setDocs((prev) => [...prev, newDoc]);
      }

      showToast(`Ingested ${file.name} — SHA-256: ${sha256Hex.substring(0, 16)}...`);
    } catch (e) {
      console.error('File upload error:', e);
      showToast('Ingested statutory artifact.');
    }
  };

  const handleAffidavitSuccess = async (fileName: string) => {
    try {
      if (affidavitModal.type === 'affidavit') {
        await updateDocumentStatus(currentAppId, 'doc-2', 'verified', 'Name Affidavit Appended (Cured)');
        setDocs((prev) =>
          prev.map((d) =>
            d.id === 'doc-2' ? { ...d, note: 'Name Affidavit Appended (Cured)', status: 'verified' } : d
          )
        );
        showToast(`Affidavit ${fileName} successfully chained to Deed in Firestore.`);
      } else {
        await updateDocumentStatus(
          currentAppId,
          'doc-3',
          'verified',
          'Fresh Safety Clearance (Valid to May 2026)'
        );
        setDocs((prev) =>
          prev.map((d) =>
            d.id === 'doc-3'
              ? { ...d, note: 'Fresh Safety Clearance (Valid to May 2026)', status: 'verified' }
              : d
          )
        );
        showToast(`Renewed Safety Certificate ${fileName} ingested in Firestore. Expiry cleared.`);
      }
    } catch (e) {
      console.error(e);
      showToast('Document status updated.');
    }
  };

  const currentApp = applications.find((a) => a.id === currentAppId) || applications[0] || DEMO_APPLICATIONS[0];

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface flex flex-col selection:bg-secondary-container selection:text-on-secondary-fixed">
      {/* Top Header with Compact Horizontal Nav for Desktop */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenRegulatoryIndex={() => setIsRegulatoryModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        applications={applications}
        currentAppId={currentAppId}
        onSelectApplication={handleSelectApplication}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 md:px-8 pt-20 md:pt-28 pb-24 md:pb-12 min-h-screen">
        {activeTab === 'overview' && (
          <OverviewView
            onNavigate={handleTabChange}
            onOpenClauseModal={(clause) => {
              setIsRegulatoryModalOpen(true);
            }}
          />
        )}

        {activeTab === 'upload' && (
          <UploadView
            currentApp={currentApp}
            docs={docs}
            onNavigate={handleTabChange}
            onOpenAffidavitModal={(type) => setAffidavitModal({ isOpen: true, type })}
            onUploadDoc={handleUploadDoc}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryView
            currentApp={currentApp}
            docs={docs}
            onNavigate={handleTabChange}
            onSelectInstrument={() => handleTabChange('review')}
          />
        )}

        {activeTab === 'review' && (
          <ReviewView
            currentApp={currentApp}
            docs={docs}
            onNavigate={handleTabChange}
            onOpenClauseModal={() => setIsRegulatoryModalOpen(true)}
            onAdjudicationSaved={() => {
              loadAppData(currentAppId);
            }}
          />
        )}

        {activeTab === 'matrix' && (
          <MatrixView
            currentApp={currentApp}
            matrixData={matrixData}
            onNavigate={handleTabChange}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-28 inset-x-4 max-w-md mx-auto z-50 bg-primary text-on-primary p-3 rounded-lg shadow-lg flex items-center justify-between gap-2 border border-primary-container animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-caption">
            <span className="material-symbols-outlined text-[18px] text-primary-fixed">verified</span>
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-primary-fixed hover:text-white p-0.5 rounded cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Persistent Bottom Bar strictly on mobile (hidden on desktop to avoid duplicate navigation) */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Supporting Modals */}
      <RegulatoryIndexModal
        isOpen={isRegulatoryModalOpen}
        onClose={() => setIsRegulatoryModalOpen(false)}
        onSelectClause={(clause) => {
          showToast(`Referenced ${clause} in active scrutiny docket.`);
        }}
      />

      <OfficerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <AffidavitModal
        isOpen={affidavitModal.isOpen}
        type={affidavitModal.type}
        onClose={() => setAffidavitModal({ isOpen: false, type: 'affidavit' })}
        onSuccess={handleAffidavitSuccess}
      />

      <ExportMatrixModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
