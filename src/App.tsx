import React, { useState, useEffect } from 'react';
import { TabType, Project, Questionnaire, Submission, Enumerator, AuditLog, FieldDeployment, RetentionPolicy, CloudDeploymentRecord, GeofenceZone } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { DataService } from './services/dataService';
import { INITIAL_QUESTIONNAIRES, INITIAL_FIELD_DEPLOYMENTS, INITIAL_RETENTION_POLICIES, INITIAL_CLOUD_DEPLOYMENTS, INITIAL_GEOFENCES } from './mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProjectsView } from './components/ProjectsView';
import { FormBuilder } from './components/FormBuilder';
import { FormSimulator } from './components/FormSimulator';
import { QualityControl } from './components/QualityControl';
import { EnumeratorsView } from './components/EnumeratorsView';
import { AnalyticsView } from './components/AnalyticsView';
import { DeploymentRetentionView } from './components/DeploymentRetentionView';
import { GeoLockManager } from './components/GeoLockManager';
import { FieldPwaView } from './components/FieldPwaView';
import { SettingsView } from './components/SettingsView';
import { LoginScreen } from './components/LoginScreen';
import { LandingPage } from './components/LandingPage';
import { MobileInstallPage } from './components/MobileInstallPage';
import { PublicCheckView } from './components/PublicCheckView';
import { WhatsAppQrConnectModal } from './components/WhatsAppQrConnectModal';
import { Footer } from './components/Footer';
import { Loader2, AlertCircle } from 'lucide-react';
import { offlineQueue } from './services/offlineQueue';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [currentView, setCurrentView] = useState<'landing' | 'app' | 'login' | 'install' | 'check'>('landing');
  const [installCode, setInstallCode] = useState<string>('CMRG-123');
  const [checkCode, setCheckCode] = useState<string>('CMRG-739');
  const [showWhatsAppConnectModal, setShowWhatsAppConnectModal] = useState(false);
  const [connectProjectCode, setConnectProjectCode] = useState<string>('CMRG-123');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(INITIAL_QUESTIONNAIRES);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [enumerators, setEnumerators] = useState<Enumerator[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [geofences, setGeofences] = useState<GeofenceZone[]>(INITIAL_GEOFENCES);
  
  const [fieldDeployments, setFieldDeployments] = useState<FieldDeployment[]>(INITIAL_FIELD_DEPLOYMENTS);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>(INITIAL_RETENTION_POLICIES);
  const [cloudDeployments, setCloudDeployments] = useState<CloudDeploymentRecord[]>(INITIAL_CLOUD_DEPLOYMENTS);
  
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedProjectIdForSimulator, setSelectedProjectIdForSimulator] = useState<string>('proj-1');
  const [forceDemoAccess, setForceDemoAccess] = useState(false);

  // Register Service Worker for PWA Offline Install
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration notice:', err);
      });
    }
  }, []);

  // Check for URL query params (e.g. ?install=CMRG-123 or PWA standalone launch)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const installParam = params.get('install');
      const modeParam = params.get('mode');
      const checkParam = params.get('check');
      if (checkParam) {
        setCheckCode(checkParam);
        setCurrentView('check');
      } else if (window.location.pathname.startsWith('/check/')) {
        const code = window.location.pathname.replace('/check/', '');
        if (code) {
          setCheckCode(code);
          setCurrentView('check');
        }
      } else if (installParam) {
        setInstallCode(installParam);
        setCurrentView('install');
      } else if (window.location.pathname.startsWith('/install/')) {
        const code = window.location.pathname.replace('/install/', '');
        if (code) setInstallCode(code);
        setCurrentView('install');
      } else if (modeParam === 'pwa' || (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches)) {
        setForceDemoAccess(true);
        setActiveTab('field');
        setCurrentView('app');
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }, []);

  // Listen to offline synced items from IndexedDB
  useEffect(() => {
    const unsubSync = offlineQueue.onSync((syncedSub) => {
      setSubmissions(prev => {
        const index = prev.findIndex(s => s.id === syncedSub.id || (s.client_submission_uuid && s.client_submission_uuid === syncedSub.client_submission_uuid));
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...syncedSub, is_offline: false };
          return updated;
        }
        return [{ ...syncedSub, is_offline: false }, ...prev];
      });

      // Update project completed count if it was newly added
      setProjects(prev => prev.map(p => {
        if (p.id === syncedSub.projectId) {
          return { ...p, completedInterviews: p.completedInterviews + 1 };
        }
        return p;
      }));
    });

    return () => {
      unsubSync();
    };
  }, []);

  // Supabase Auth Session Restoration & Subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthChecking(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch data when session is active or in fallback mode
  useEffect(() => {
    if (authChecking) return;

    async function loadData() {
      setLoading(true);
      try {
        const projRes = await DataService.getProjects();
        const subRes = await DataService.getSubmissions();
        const enuRes = await DataService.getEnumerators();
        const logRes = await DataService.getAuditLogs();

        setProjects(projRes.data);
        setSubmissions(subRes.data);
        setEnumerators(enuRes.data);
        setAuditLogs(logRes.data);
        setIsDemo(projRes.isDemo);

        if (projRes.error) {
          setErrorMsg(projRes.error);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load application data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [authChecking, session?.user?.id]);

  const flaggedCount = submissions.filter(s => s.status === 'Flagged').length;

  const handleAddProject = (newProj: Project) => {
    setProjects(prev => [newProj, ...prev]);
    const newQ: Questionnaire = {
      id: `quest-${Date.now()}`,
      title: `${newProj.title} Questionnaire`,
      version: '1.0',
      projectId: newProj.id,
      updatedAt: new Date().toISOString().split('T')[0],
      questions: [
        { id: 'q1', variableName: 'interviewer_id', label: 'Enumerator ID Code', type: 'text', required: true, hint: 'e.g. CMRG-001' },
        { id: 'q2', variableName: 'gps_loc', label: 'Capture GPS Location', type: 'gps', required: true }
      ]
    };
    setQuestionnaires(prev => [...prev, newQ]);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'Dr. Tunde Fashola (Admin)',
      action: 'Project Created',
      details: `Initialized project ${newProj.code}`,
      ip: '197.210.44.12'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateQuestionnaire = (updated: Questionnaire) => {
    setQuestionnaires(prev => {
      const exists = prev.some(q => q.id === updated.id);
      if (exists) {
        return prev.map(q => q.id === updated.id ? updated : q);
      }
      return [updated, ...prev];
    });
  };

  const handleAddSubmission = (sub: Submission) => {
    setSubmissions(prev => [sub, ...prev]);
    setProjects(prev => prev.map(p => {
      if (p.id === sub.projectId) {
        return { ...p, completedInterviews: p.completedInterviews + 1 };
      }
      return p;
    }));
  };

  const handleUpdateSubmissionStatus = (subId: string, newStatus: 'Approved' | 'Flagged' | 'Rejected', reason?: string) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          status: newStatus,
          flagReason: reason || s.flagReason
        };
      }
      return s;
    }));
  };

  const handleAddGeofence = (newGf: GeofenceZone) => {
    setGeofences(prev => [newGf, ...prev]);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'Dr. Tunde Fashola (Admin)',
      action: 'Geofence Perimeter Locked',
      details: `Pre-field geolock established for "${newGf.name}" (${newGf.state}, ${newGf.radiusMeters}m radius, Quota: ${newGf.targetInterviews})`,
      ip: '197.210.44.12'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleSelectProjectForSimulator = (projId: string) => {
    setSelectedProjectIdForSimulator(projId);
    setActiveTab('simulator');
  };

  const handleAddFieldDeployment = (newDep: FieldDeployment) => {
    setFieldDeployments(prev => [newDep, ...prev]);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'Dr. Tunde Fashola (Admin)',
      action: 'Field Deployment Created',
      details: `Initialized wave "${newDep.name}" (${newDep.targetRegion}) with retention period ${newDep.retentionPeriod}`,
      ip: '197.210.44.12'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleToggleRetentionPolicy = (policyId: string) => {
    setRetentionPolicies(prev => prev.map(p => {
      if (p.id === policyId) {
        const nextState = !p.enabled;
        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'Dr. Tunde Fashola (Admin)',
          action: 'Retention Policy Modified',
          details: `Policy "${p.title}" status changed to ${nextState ? 'ACTIVE' : 'DISABLED'}`,
          ip: '197.210.44.12'
        };
        setAuditLogs(curr => [newLog, ...curr]);
        return { ...p, enabled: nextState };
      }
      return p;
    }));
  };

  const handleExecuteRetentionPolicy = (policyId: string) => {
    setRetentionPolicies(prev => prev.map(p => {
      if (p.id === policyId) {
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'System Retention Daemon',
          action: 'Retention Schedule Executed',
          details: `Enforced policy "${p.title}" on ${p.affectedCount} matching records. Action: ${p.action}`,
          ip: '127.0.0.1'
        };
        setAuditLogs(curr => [newLog, ...curr]);
        return { ...p, lastExecuted: now };
      }
      return p;
    }));
  };

  const handleTriggerCloudDeployment = (env: 'Production' | 'Preview') => {
    const hash = Math.random().toString(16).substring(2, 9);
    const newRecord: CloudDeploymentRecord = {
      id: `dpl-${Date.now()}`,
      deploymentUrl: env === 'Production' ? 'https://cmrg-data-collect.vercel.app' : `https://cmrg-data-collect-${hash}.vercel.app`,
      environment: env,
      branch: env === 'Production' ? 'main' : 'feat/wave-sync',
      commitHash: hash,
      commitMessage: env === 'Production' ? 'Production release with Vercel build cache retention' : 'Preview branch verification',
      status: 'Ready',
      createdAt: 'Just now',
      retentionStatus: env === 'Production' ? 'Retained (Protected)' : 'Retained (30 Days)',
      buildDuration: '36s (Vercel Build Cache Reused)',
      author: 'Dr. Tunde Fashola (Admin)'
    };
    setCloudDeployments(prev => [newRecord, ...prev]);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'Dr. Tunde Fashola (Admin)',
      action: 'Cloud Deployment Triggered',
      details: `Vercel ${env} release created (${newRecord.commitHash}) with ${newRecord.retentionStatus}`,
      ip: '197.210.44.12'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleOpenWhatsAppConnect = (projectCode?: string) => {
    if (projectCode) {
      setConnectProjectCode(projectCode);
    } else if (projects.length > 0) {
      setConnectProjectCode(projects[0].code);
    }
    setShowWhatsAppConnectModal(true);
  };

  if (currentView === 'check') {
    return (
      <PublicCheckView 
        checkCode={checkCode}
        projects={projects}
        geofences={geofences}
        submissions={submissions}
        onBackToApp={() => {
          setForceDemoAccess(true);
          setCurrentView('app');
        }}
        onOpenInstall={(code) => {
          setInstallCode(code);
          setCurrentView('install');
        }}
      />
    );
  }

  if (currentView === 'install') {
    return (
      <MobileInstallPage 
        projectCode={installCode}
        onOpenFieldApp={(code) => {
          setForceDemoAccess(true);
          setActiveTab('field');
          setCurrentView('app');
        }}
        onBackToMain={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onOpenLogin={() => setCurrentView('login')} 
        onContinueAsDemo={() => {
          setForceDemoAccess(true);
          setCurrentView('app');
        }}
        onOpenInstall={(code) => {
          setInstallCode(code);
          setCurrentView('install');
        }}
      />
    );
  }

  if (currentView === 'login' || (isSupabaseConfigured && !session && !forceDemoAccess)) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F6F7F9]">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView('landing')}
            className="text-xs font-bold text-[#E30620] hover:underline flex items-center gap-1"
          >
            ← Back to CMRG Landing Page
          </button>
        </div>
        <LoginScreen 
          onLoginSuccess={() => setCurrentView('app')} 
          onContinueAsDemo={() => {
            setForceDemoAccess(true);
            setCurrentView('app');
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[#17243A] text-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#C8202F]" />
        </div>
        <h2 className="text-lg font-bold text-[#17243A]">Loading CMRG Data Collect Enterprise...</h2>
        <p className="text-xs text-gray-500 mt-1">Fetching authenticated research data streams from Supabase.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col font-sans text-[#1B2430]">
      <Header 
        activeProjectCount={projects.filter(p => p.status === 'Active').length} 
        projects={projects}
        submissions={submissions}
        enumerators={enumerators}
        onSignOut={() => supabase?.auth.signOut()} 
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenWhatsAppConnect={handleOpenWhatsAppConnect}
        onReturnHome={() => setCurrentView('landing')}
      />

      {isDemo && !isSupabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Demonstration Mode:</strong> Running with sample research data. Supabase environment variables are not configured.
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center gap-2 text-xs text-[#C8202F]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span><strong>Backend Notice:</strong> {errorMsg}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
        )}

        <div className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setMobileSidebarOpen(false);
            }} 
            flaggedCount={flaggedCount} 
            onReturnHome={() => setCurrentView('landing')}
          />
        </div>

        <main className="flex-1 overflow-y-auto w-full flex flex-col justify-between">
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <Dashboard 
                projects={projects} 
                submissions={submissions} 
                enumerators={enumerators} 
                geofences={geofences}
                onAddGeofence={handleAddGeofence}
                onNavigateTab={setActiveTab} 
                onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
                onOpenWhatsAppConnect={handleOpenWhatsAppConnect}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsView 
                projects={projects} 
                onAddProject={handleAddProject} 
                onSelectProjectForSimulator={handleSelectProjectForSimulator} 
                onOpenWhatsAppConnect={handleOpenWhatsAppConnect}
              />
            )}

            {activeTab === 'builder' && (
              <FormBuilder 
                questionnaires={questionnaires} 
                projects={projects}
                enumerators={enumerators}
                onUpdateQuestionnaire={handleUpdateQuestionnaire} 
                onNavigateToInstall={(code) => {
                  setInstallCode(code);
                  setCurrentView('install');
                }}
              />
            )}

            {activeTab === 'simulator' && (
              <FormSimulator 
                questionnaires={questionnaires} 
                projects={projects} 
                selectedProjectId={selectedProjectIdForSimulator} 
                onAddSubmission={handleAddSubmission} 
              />
            )}

            {activeTab === 'quality' && (
              <QualityControl 
                submissions={submissions} 
                onUpdateSubmissionStatus={handleUpdateSubmissionStatus} 
              />
            )}

            {activeTab === 'enumerators' && (
              <EnumeratorsView enumerators={enumerators} />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView submissions={submissions} projects={projects} />
            )}

            {activeTab === 'deployments' && (
              <DeploymentRetentionView
                projects={projects}
                fieldDeployments={fieldDeployments}
                onAddFieldDeployment={handleAddFieldDeployment}
                retentionPolicies={retentionPolicies}
                onToggleRetentionPolicy={handleToggleRetentionPolicy}
                onExecuteRetentionPolicy={handleExecuteRetentionPolicy}
                cloudDeployments={cloudDeployments}
                onTriggerCloudDeployment={handleTriggerCloudDeployment}
              />
            )}

            {activeTab === 'geolock' && (
              <GeoLockManager 
                projects={projects} 
                geofences={geofences}
                onAddGeofence={handleAddGeofence}
              />
            )}

            {activeTab === 'field' && (
              <FieldPwaView 
                projects={projects}
                questionnaires={questionnaires}
                enumerators={enumerators}
                geofences={geofences}
                onAddSubmission={handleAddSubmission}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView auditLogs={auditLogs} />
            )}
          </div>

          <Footer />
        </main>
      </div>

      {showWhatsAppConnectModal && (
        <WhatsAppQrConnectModal 
          projects={projects}
          initialProjectCode={connectProjectCode}
          onClose={() => setShowWhatsAppConnectModal(false)}
          onSimulatePhoneScan={(code, pin, title, enuId) => {
            setInstallCode(code);
            try {
              window.history.pushState({}, '', `/?install=${code}&pin=${pin}&title=${encodeURIComponent(title)}&enu=${enuId}&connect=true`);
            } catch (e) {
              // ignore history errors
            }
            setShowWhatsAppConnectModal(false);
            setCurrentView('install');
          }}
        />
      )}
    </div>
  );
}
