import React, { useState, useEffect } from 'react';
import { TabType, Project, Questionnaire, Submission, Enumerator, AuditLog } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { DataService } from './services/dataService';
import { INITIAL_QUESTIONNAIRES } from './mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProjectsView } from './components/ProjectsView';
import { FormBuilder } from './components/FormBuilder';
import { FormSimulator } from './components/FormSimulator';
import { QualityControl } from './components/QualityControl';
import { EnumeratorsView } from './components/EnumeratorsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { LoginScreen } from './components/LoginScreen';
import { Footer } from './components/Footer';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(INITIAL_QUESTIONNAIRES);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [enumerators, setEnumerators] = useState<Enumerator[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedProjectIdForSimulator, setSelectedProjectIdForSimulator] = useState<string>('proj-1');

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
  }, [authChecking, session]);

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
    setQuestionnaires(prev => prev.map(q => q.id === updated.id ? updated : q));
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

  const handleSelectProjectForSimulator = (projId: string) => {
    setSelectedProjectIdForSimulator(projId);
    setActiveTab('simulator');
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[#17243A] text-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#C8202F]" />
        </div>
        <h2 className="text-lg font-bold text-[#17243A]">Verifying Supabase Authentication Session...</h2>
        <p className="text-xs text-gray-500 mt-1">Connecting securely to CMRG project kmwzmyupvqjitugpckzp.</p>
      </div>
    );
  }

  if (isSupabaseConfigured && !session) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F6F7F9]">
        <LoginScreen onLoginSuccess={() => {}} />
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
        onSignOut={() => supabase?.auth.signOut()} 
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
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
          />
        </div>

        <main className="flex-1 overflow-y-auto w-full flex flex-col justify-between">
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <Dashboard 
                projects={projects} 
                submissions={submissions} 
                enumerators={enumerators} 
                onNavigateTab={setActiveTab} 
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsView 
                projects={projects} 
                onAddProject={handleAddProject} 
                onSelectProjectForSimulator={handleSelectProjectForSimulator} 
              />
            )}

            {activeTab === 'builder' && (
              <FormBuilder 
                questionnaires={questionnaires} 
                onUpdateQuestionnaire={handleUpdateQuestionnaire} 
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

            {activeTab === 'settings' && (
              <SettingsView auditLogs={auditLogs} />
            )}
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
}
