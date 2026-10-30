import React, { useState } from 'react';
import { Questionnaire, Question, QuestionType, Enumerator, Project, QuestionnaireQuota } from '../types';
import { DataService } from '../services/dataService';
import { QuestionCard } from './builder/QuestionCard';
import { TemplateLibraryModal } from './builder/TemplateLibraryModal';
import { AiPromptModal } from './builder/AiPromptModal';
import { XlsFormModal } from './builder/XlsFormModal';
import { PreviewDeviceModal } from './builder/PreviewDeviceModal';
import { 
  Plus, 
  Trash2, 
  Check, 
  Layers, 
  QrCode, 
  Users, 
  Send, 
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  ExternalLink,
  Sliders,
  FileCode2,
  Smartphone,
  BookOpen,
  Filter,
  History,
  Target,
  ArrowRight,
  Download
} from 'lucide-react';

interface FormBuilderProps {
  questionnaires: Questionnaire[];
  projects?: Project[];
  enumerators?: Enumerator[];
  onUpdateQuestionnaire: (updated: Questionnaire) => void;
  onNavigateToInstall?: (code: string) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ 
  questionnaires, 
  projects = [], 
  enumerators = [], 
  onUpdateQuestionnaire,
  onNavigateToInstall
}) => {
  const [selectedQuestId, setSelectedQuestId] = useState<string>(questionnaires[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'builder' | 'quotas' | 'xform' | 'publishing' | 'history'>('builder');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showXlsModal, setShowXlsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [selectedEnumerator, setSelectedEnumerator] = useState<Enumerator | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Publish versioning state
  const [publishVersion, setPublishVersion] = useState('2.0');
  const [publishChangelog, setPublishChangelog] = useState('Updated price audit logic, added GPS constraints, and updated quota screener.');

  // New question form state
  const [newLabel, setNewLabel] = useState('');
  const [newVarName, setNewVarName] = useState('');
  const [newType, setNewType] = useState<QuestionType>('text');
  const [newRequired, setNewRequired] = useState(true);
  const [newHint, setNewHint] = useState('');
  const [newOptionsText, setNewOptionsText] = useState('Option 1, Option 2, Option 3');

  // Quota manager state
  const [newQuotaName, setNewQuotaName] = useState('');
  const [newQuotaVar, setNewQuotaVar] = useState('');
  const [newQuotaValue, setNewQuotaValue] = useState('');
  const [newQuotaTarget, setNewQuotaTarget] = useState(100);

  const currentQuestionnaire = questionnaires.find(q => q.id === selectedQuestId) || questionnaires[0];
  const associatedProject = projects.find(p => p.id === currentQuestionnaire?.projectId) || projects[0];

  const handleSaveToDatabase = async () => {
    setSaving(true);
    setSaveSuccessMsg(null);
    try {
      const res = await DataService.saveQuestionnaire(currentQuestionnaire);
      if (res.success) {
        setSaveSuccessMsg('Questionnaire successfully saved and synced to Supabase PostgreSQL!');
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } else {
        setSaveSuccessMsg(`Failed to save: ${res.error}`);
      }
    } catch (err: any) {
      setSaveSuccessMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedVersionsHistory = [
        ...(currentQuestionnaire.versionsHistory || []),
        {
          version: publishVersion,
          timestamp: new Date().toISOString(),
          author: 'CMRG Research Director',
          changelog: publishChangelog,
          questionsCount: currentQuestionnaire.questions.length
        }
      ];

      const updated: Questionnaire = {
        ...currentQuestionnaire,
        version: publishVersion,
        updatedAt: new Date().toISOString().split('T')[0],
        status: 'published',
        versionsHistory: updatedVersionsHistory
      };
      
      const res = await DataService.publishQuestionnaire(
        currentQuestionnaire.id,
        publishVersion,
        currentQuestionnaire.questions,
        publishChangelog
      );

      if (res.success) {
        onUpdateQuestionnaire(updated);
        setShowPublishModal(false);
        setSaveSuccessMsg(`Successfully published version v${publishVersion} to Supabase!`);
        setTimeout(() => setSaveSuccessMsg(null), 5000);
      } else {
        setSaveSuccessMsg(`Publish failed: ${res.error}`);
      }
    } catch (err: any) {
      setSaveSuccessMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newVarName) return;

    let options = undefined;
    if (['select_one', 'select_multiple', 'dropdown', 'ranking', 'constant_sum'].includes(newType)) {
      options = newOptionsText.split(',').map((opt, i) => ({
        id: `opt-${Date.now()}-${i}`,
        label: opt.trim(),
        value: opt.trim().toLowerCase().replace(/\s+/g, '_')
      }));
    }

    const newQ: Question = {
      id: `q-${Date.now()}`,
      variableName: newVarName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      label: newLabel,
      type: newType,
      required: newRequired,
      hint: newHint || undefined,
      options
    };

    const updatedQuestions = [...(currentQuestionnaire.questions || []), newQ];
    const updated: Questionnaire = {
      ...currentQuestionnaire,
      updatedAt: new Date().toISOString().split('T')[0],
      questions: updatedQuestions
    };

    onUpdateQuestionnaire(updated);
    setShowAddModal(false);
    setNewLabel('');
    setNewVarName('');
    setNewHint('');
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    const questions = currentQuestionnaire.questions.map(q => q.id === updatedQ.id ? updatedQ : q);
    onUpdateQuestionnaire({
      ...currentQuestionnaire,
      updatedAt: new Date().toISOString().split('T')[0],
      questions
    });
  };

  const handleDeleteQuestion = (qId: string) => {
    const questions = currentQuestionnaire.questions.filter(q => q.id !== qId);
    onUpdateQuestionnaire({
      ...currentQuestionnaire,
      updatedAt: new Date().toISOString().split('T')[0],
      questions
    });
  };

  const handleDuplicateQuestion = (q: Question) => {
    const cloned: Question = {
      ...q,
      id: `q-${Date.now()}`,
      variableName: `${q.variableName}_copy`,
      label: `${q.label} (Copy)`
    };
    const index = currentQuestionnaire.questions.findIndex(item => item.id === q.id);
    const questions = [...currentQuestionnaire.questions];
    questions.splice(index + 1, 0, cloned);
    onUpdateQuestionnaire({
      ...currentQuestionnaire,
      updatedAt: new Date().toISOString().split('T')[0],
      questions
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const questions = [...currentQuestionnaire.questions];
    const temp = questions[index];
    questions[index] = questions[index - 1];
    questions[index - 1] = temp;
    onUpdateQuestionnaire({
      ...currentQuestionnaire,
      updatedAt: new Date().toISOString().split('T')[0],
      questions
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === currentQuestionnaire.questions.length - 1) return;
    const questions = [...currentQuestionnaire.questions];
    const temp = questions[index];
    questions[index] = questions[index + 1];
    questions[index + 1] = temp;
    onUpdateQuestionnaire({
      ...currentQuestionnaire,
      updatedAt: new Date().toISOString().split('T')[0],
      questions
    });
  };

  // Quotas handlers
  const handleAddQuota = () => {
    if (!newQuotaName || !newQuotaVar || !newQuotaValue) return;
    const newQ: QuestionnaireQuota = {
      id: `quota-${Date.now()}`,
      name: newQuotaName,
      variableName: newQuotaVar,
      targetValue: newQuotaValue,
      maxTarget: newQuotaTarget,
      currentCount: 0
    };
    const quotas = [...(currentQuestionnaire.quotas || []), newQ];
    onUpdateQuestionnaire({ ...currentQuestionnaire, quotas });
    setNewQuotaName('');
    setNewQuotaVar('');
    setNewQuotaValue('');
  };

  const handleDeleteQuota = (quotaId: string) => {
    const quotas = (currentQuestionnaire.quotas || []).filter(q => q.id !== quotaId);
    onUpdateQuestionnaire({ ...currentQuestionnaire, quotas });
  };

  // Quick category addition helper
  const handleQuickAddType = (type: QuestionType, label: string) => {
    const varName = label.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20);
    const newQ: Question = {
      id: `q-${Date.now()}`,
      variableName: `${varName}_${Date.now().toString().slice(-4)}`,
      label,
      type,
      required: true,
      options: ['select_one', 'select_multiple'].includes(type) ? [
        { id: 'opt_1', label: 'Option 1', value: 'opt_1' },
        { id: 'opt_2', label: 'Option 2', value: 'opt_2' }
      ] : undefined
    };
    const questions = [...(currentQuestionnaire.questions || []), newQ];
    onUpdateQuestionnaire({ ...currentQuestionnaire, questions });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#17243A]">Universal Questionnaire Design Studio</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-[#C8202F] px-2 py-0.5 rounded-full">
              Enterprise
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Design, simulate, and publish universal survey instruments with full skip logic, matrices, quotas, and XLSForm compatibility
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedQuestId}
            onChange={(e) => setSelectedQuestId(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#17243A] shadow-xs"
          >
            {questionnaires.map(q => (
              <option key={q.id} value={q.id}>{q.title} (v{q.version})</option>
            ))}
          </select>

          <button
            onClick={() => setShowTemplateModal(true)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="Browse standard research templates"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => setShowAiModal(true)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="Natural language study prompt generator"
          >
            <Sliders className="w-3.5 h-3.5 text-[#C8202F]" />
            <span>Smart Drafter</span>
          </button>

          <button
            onClick={() => setShowXlsModal(true)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="ODK / SurveyCTO XLSForm import & export"
          >
            <FileCode2 className="w-3.5 h-3.5 text-purple-600" />
            <span>XLSForm</span>
          </button>

          <button
            onClick={() => setShowPreviewModal(true)}
            className="bg-[#17243A] hover:bg-[#1E2D4A] text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preview & Test</span>
          </button>

          <button
            onClick={handleSaveToDatabase}
            disabled={saving}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C8202F] ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            className="bg-[#C8202F] hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish v{currentQuestionnaire?.version}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'builder' ? 'bg-[#17243A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Visual Question Builder ({currentQuestionnaire?.questions?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotas')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'quotas' ? 'bg-[#17243A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Quotas & Eligibility Screening ({currentQuestionnaire?.quotas?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('publishing')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'publishing' ? 'bg-[#17243A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Field Deployment & WhatsApp QR</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'history' ? 'bg-[#17243A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Version History & Revisions</span>
        </button>
      </div>

      {/* TAB 1: VISUAL QUESTION BUILDER */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          {/* Quick Palette for 20+ Question Types */}
          <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#C8202F]" />
                <span>Quick-Insert Question Type</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="text-xs font-bold text-[#C8202F] hover:text-red-700 flex items-center gap-1"
              >
                Custom Question Form
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickAddType('select_one', 'Single Choice Question')}
                className="p-2 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-left font-semibold text-gray-700 transition-colors"
              >
                🔘 Single Choice
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddType('select_multiple', 'Multiple Choice Question')}
                className="p-2 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-left font-semibold text-gray-700 transition-colors"
              >
                ☑️ Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddType('nps', 'How likely are you to recommend? (0-10)')}
                className="p-2 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-left font-semibold text-gray-700 transition-colors"
              >
                🎯 NPS (0-10)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddType('matrix', 'Rate the following attributes:')}
                className="p-2 rounded-xl border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 text-left font-semibold text-gray-700 transition-colors"
              >
                📊 Matrix / Grid
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddType('ranking', 'Rank in order of priority:')}
                className="p-2 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-left font-semibold text-gray-700 transition-colors"
              >
                🔢 Ranking Order
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddType('constant_sum', 'Allocate 100 points across items:')}
                className="p-2 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-left font-semibold text-gray-700 transition-colors"
              >
                ⚖️ Constant Sum
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddType('photo', 'Capture GPS Watermarked Photo')}
                className="p-2 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 text-left font-semibold text-gray-700 transition-colors"
              >
                📷 Watermarked Photo
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddType('video', 'Record Video of Site (Max 1 min)')}
                className="p-2 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 text-left font-semibold text-gray-700 transition-colors"
              >
                🎥 1-Min Video
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddType('audio', 'Record Audio Consent Statement')}
                className="p-2 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 text-left font-semibold text-gray-700 transition-colors"
              >
                🎙️ Audio Waveform
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddType('signature', 'Informed Consent Signature')}
                className="p-2 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-100 text-left font-semibold text-gray-700 transition-colors"
              >
                ✍️ Signature Pad
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddType('gps', 'Capture High-Accuracy GPS Fix')}
                className="p-2 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-left font-semibold text-gray-700 transition-colors"
              >
                📍 Satellite GPS
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddType('repeat_group', 'Household Member Roster')}
                className="p-2 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-left font-semibold text-gray-700 transition-colors"
              >
                🔁 Repeating Loop
              </button>
            </div>
          </div>

          {/* List of Questions */}
          <div className="space-y-3">
            {(!currentQuestionnaire?.questions || currentQuestionnaire.questions.length === 0) ? (
              <div className="p-12 text-center bg-white border border-dashed border-gray-300 rounded-2xl space-y-3">
                <Layers className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="text-sm font-bold text-gray-700">No Questions Yet</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Click a question type above, or generate from a research template or natural language prompt.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="px-4 py-2 bg-[#17243A] text-white text-xs font-semibold rounded-xl"
                  >
                    Load Standard Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAiModal(true)}
                    className="px-4 py-2 bg-[#C8202F] text-white text-xs font-semibold rounded-xl"
                  >
                    Smart Study Drafter
                  </button>
                </div>
              </div>
            ) : (
              currentQuestionnaire.questions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={idx}
                  totalQuestions={currentQuestionnaire.questions.length}
                  allQuestions={currentQuestionnaire.questions}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                  onDuplicate={handleDuplicateQuestion}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: QUOTAS & ELIGIBILITY SCREENING */}
      {activeTab === 'quotas' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#17243A]">Demographic Quotas & Sample Balance</h3>
                <p className="text-xs text-gray-500">
                  Enforce fieldwork targets across age brackets, gender, states, or customer segments. Once reached, field devices screen out additional responses.
                </p>
              </div>
            </div>

            {/* Add new quota row */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Quota Description</label>
                <input
                  type="text"
                  value={newQuotaName}
                  onChange={(e) => setNewQuotaName(e.target.value)}
                  placeholder="e.g. Lagos Island Male 25-35"
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Target Variable</label>
                <input
                  type="text"
                  value={newQuotaVar}
                  onChange={(e) => setNewQuotaVar(e.target.value)}
                  placeholder="e.g. respondent_gender"
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Target Value</label>
                <input
                  type="text"
                  value={newQuotaValue}
                  onChange={(e) => setNewQuotaValue(e.target.value)}
                  placeholder="e.g. male"
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Max Quota</label>
                  <input
                    type="number"
                    value={newQuotaTarget}
                    onChange={(e) => setNewQuotaTarget(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddQuota}
                  className="p-2 bg-[#C8202F] text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quota cards */}
            <div className="space-y-2">
              {(!currentQuestionnaire?.quotas || currentQuestionnaire.quotas.length === 0) ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">No quotas configured. Study will accept all verified submissions.</p>
              ) : (
                currentQuestionnaire.quotas.map(quota => (
                  <div key={quota.id} className="p-3.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#17243A]">{quota.name}</h4>
                      <p className="text-[10px] font-mono text-gray-500">
                        When <span className="font-bold text-gray-700">${'{' + quota.variableName + '}'} == '{quota.targetValue}'</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-[#C8202F]">
                          {quota.currentCount} / {quota.maxTarget}
                        </span>
                        <div className="w-24 bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-[#C8202F] h-full"
                            style={{ width: `${Math.min(100, (quota.currentCount / quota.maxTarget) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuota(quota.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUBLISHING, ACCESS CODES & WHATSAPP QR */}
      {activeTab === 'publishing' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#17243A]">Field Deployment Access & PWA WhatsApp QR</h3>
              <p className="text-xs text-gray-500">
                Generate project access codes and QR links to send to field enumerators via WhatsApp. Enumerators scan with phone camera to auto-pair and install the offline PWA.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Assigned Project</span>
                <p className="text-xs font-bold text-[#17243A] mt-0.5">{associatedProject?.title || 'CMRG Project'}</p>
                <p className="text-[11px] font-mono text-gray-500">Code: {associatedProject?.code || 'CMRG-739'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Universal Access Code</span>
                <p className="text-sm font-mono font-bold text-[#C8202F] mt-0.5">{associatedProject?.code || 'CMRG-739'}</p>
                <p className="text-[10px] text-gray-500">Auto-authenticates field enumerator devices</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToInstall) {
                      onNavigateToInstall(associatedProject?.code || 'CMRG-739');
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-[#17243A] hover:bg-[#1E2D4A] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Launch WhatsApp QR Modal</span>
                </button>
              </div>
            </div>

            {/* Assigned Enumerator Roster */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 mb-2">Assigned Field Enumerators ({enumerators.length})</h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {enumerators.slice(0, 6).map(e => (
                  <div key={e.id} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50">
                    <div>
                      <span className="font-bold text-[#17243A]">{e.name}</span>
                      <span className="text-[11px] font-mono text-gray-500 ml-2">({e.id})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        {e.status}
                      </span>
                      <span className="text-gray-500 text-[11px]">{e.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VERSION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#17243A]">Questionnaire Revision & Publishing History</h3>
              <p className="text-xs text-gray-500">
                Audited snapshots of previous versions. Submissions preserve the exact version schema they were collected under.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(!currentQuestionnaire.versionsHistory || currentQuestionnaire.versionsHistory.length === 0) ? (
              <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
                Current active version is <strong>v{currentQuestionnaire.version}</strong>. When you publish a release, an immutable snapshot will be logged here.
              </div>
            ) : (
              currentQuestionnaire.versionsHistory.map((v, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#17243A]">Version v{v.version}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(v.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{v.changelog}</p>
                    <span className="text-[10px] font-mono text-gray-500 mt-1 block">
                      Published by {v.author} • {v.questionsCount} questions
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Snapshot Saved
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD QUESTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-[#17243A]">Add Custom Question</h3>
            <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Question Label</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Rate your satisfaction with public transport"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Variable Name</label>
                <input
                  type="text"
                  required
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                  placeholder="e.g. transport_satisfaction"
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Question Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as QuestionType)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="text">Single-line Text</option>
                  <option value="textarea">Long Answer Textarea</option>
                  <option value="integer">Integer (Number)</option>
                  <option value="decimal">Decimal (Float)</option>
                  <option value="yes_no">Yes / No Binary</option>
                  <option value="select_one">Single Choice (Radio)</option>
                  <option value="select_multiple">Multiple Choice (Checkboxes)</option>
                  <option value="dropdown">Dropdown Selection</option>
                  <option value="rating">Rating Scale (1-5)</option>
                  <option value="nps">NPS Score (0-10)</option>
                  <option value="matrix">Matrix / Grid</option>
                  <option value="ranking">Ranking Order</option>
                  <option value="constant_sum">Constant Sum Allocation</option>
                  <option value="photo">Camera Photo (Watermarked)</option>
                  <option value="video">Video Survey (1 Min)</option>
                  <option value="audio">Audio Recorder</option>
                  <option value="signature">Signature Canvas</option>
                  <option value="gps">GPS Satellite Fix</option>
                  <option value="repeat_group">Repeating Loop / Roster</option>
                </select>
              </div>

              {['select_one', 'select_multiple', 'dropdown', 'ranking', 'constant_sum'].includes(newType) && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Options (Comma separated)</label>
                  <input
                    type="text"
                    value={newOptionsText}
                    onChange={(e) => setNewOptionsText(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Hint (Optional)</label>
                <input
                  type="text"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="req_box"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                  className="rounded text-[#C8202F]"
                />
                <label htmlFor="req_box" className="font-bold text-gray-700">Mandatory response</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C8202F] text-white rounded-xl font-semibold hover:bg-red-700"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PUBLISH RELEASE MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-[#17243A]">Publish Questionnaire Release</h3>
            <p className="text-xs text-gray-500">
              Publishing tags a new production release and makes it available immediately to field devices.
            </p>

            <form onSubmit={handlePublish} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Release Version Tag</label>
                <input
                  type="text"
                  required
                  value={publishVersion}
                  onChange={(e) => setPublishVersion(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Audit Changelog / Release Notes</label>
                <textarea
                  rows={3}
                  required
                  value={publishChangelog}
                  onChange={(e) => setPublishChangelog(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#C8202F] hover:bg-red-700 text-white rounded-xl font-semibold flex items-center gap-1.5"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Publishing...' : 'Deploy to Production'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPORTING TOOL MODALS */}
      <TemplateLibraryModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={(template) => {
          onUpdateQuestionnaire(template);
          setSelectedQuestId(template.id);
          setSaveSuccessMsg(`Loaded universal template: ${template.title}`);
          setTimeout(() => setSaveSuccessMsg(null), 4000);
        }}
      />

      <AiPromptModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onGenerated={(generated) => {
          onUpdateQuestionnaire(generated);
          setSelectedQuestId(generated.id);
          setSaveSuccessMsg(`Generated questionnaire from AI brief: ${generated.title}`);
          setTimeout(() => setSaveSuccessMsg(null), 4000);
        }}
      />

      <XlsFormModal
        isOpen={showXlsModal}
        onClose={() => setShowXlsModal(false)}
        currentQuestionnaire={currentQuestionnaire}
        onImport={(imported) => {
          onUpdateQuestionnaire(imported);
          setSelectedQuestId(imported.id);
          setSaveSuccessMsg(`Successfully imported XLSForm survey (${imported.questions.length} questions)`);
          setTimeout(() => setSaveSuccessMsg(null), 4000);
        }}
      />

      <PreviewDeviceModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        questionnaire={currentQuestionnaire}
      />
    </div>
  );
};
