import React, { useState } from 'react';
import { Questionnaire, Question, QuestionType, Enumerator, Project } from '../types';
import { DataService } from '../services/dataService';
import { 
  FileCode2, 
  Plus, 
  Trash2, 
  Check, 
  Code, 
  Layers, 
  Settings,
  QrCode,
  Users,
  Send,
  ShieldCheck,
  RefreshCw,
  Copy,
  ExternalLink
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
  const [activeTab, setActiveTab] = useState<'questions' | 'xform' | 'publishing' | 'settings'>('questions');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedEnumerator, setSelectedEnumerator] = useState<Enumerator | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Publish form state
  const [publishVersion, setPublishVersion] = useState('2.5');
  const [publishChangelog, setPublishChangelog] = useState('Updated price audit logic and added GPS constraints.');

  // New question form state
  const [newLabel, setNewLabel] = useState('');
  const [newVarName, setNewVarName] = useState('');
  const [newType, setNewType] = useState<QuestionType>('text');
  const [newRequired, setNewRequired] = useState(true);
  const [newHint, setNewHint] = useState('');
  const [newOptionsText, setNewOptionsText] = useState('Option 1, Option 2, Option 3');

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
      const updated: Questionnaire = {
        ...currentQuestionnaire,
        version: publishVersion,
        updatedAt: new Date().toISOString().split('T')[0]
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
    if (newType === 'select_one' || newType === 'select_multiple') {
      options = newOptionsText.split(',').map((opt, i) => ({
        id: `opt-${Date.now()}-${i}`,
        label: opt.trim(),
        value: opt.trim().toLowerCase().replace(/\s+/g, '_')
      }));
    }

    const newQ: Question = {
      id: `q-${Date.now()}`,
      variableName: newVarName.trim().toLowerCase().replace(/\s+/g, '_'),
      label: newLabel,
      type: newType,
      required: newRequired,
      hint: newHint || undefined,
      options
    };

    const updatedQuestions = [...currentQuestionnaire.questions, newQ];
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

  const handleDeleteQuestion = (qId: string) => {
    const updatedQuestions = currentQuestionnaire.questions.filter(q => q.id !== qId);
    const updated: Questionnaire = {
      ...currentQuestionnaire,
      updatedAt: new Date().toISOString().split('T')[0],
      questions: updatedQuestions
    };
    onUpdateQuestionnaire(updated);
  };

  const generateXFormXML = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml" xmlns:odk="http://www.opendatakit.org/xforms">
  <h:head>
    <h:title>${currentQuestionnaire.title}</h:title>
    <model>
      <instance>
        <data id="${currentQuestionnaire.id}" version="${currentQuestionnaire.version}">
          ${currentQuestionnaire.questions.map(q => `<${q.variableName}/>`).join('\n          ')}
        </data>
      </instance>
      ${currentQuestionnaire.questions.map(q => `<bind nodeset="/data/${q.variableName}" type="${q.type === 'integer' ? 'int' : 'string'}" required="${q.required ? 'true()' : 'false()'}"/>`).join('\n      ')}
    </model>
  </h:head>
  <h:body>
    ${currentQuestionnaire.questions.map(q => `
    <input ref="/data/${q.variableName}">
      <label>${q.label}</label>
      ${q.hint ? `<hint>${q.hint}</hint>` : ''}
    </input>`).join('')}
  </h:body>
</h:html>`;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#17243A]">Questionnaire Design Studio & Publishing</h1>
          <p className="text-xs text-gray-500">Build, version, assign, and publish ODK/SurveyCTO-compatible survey forms to PostgreSQL</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedQuestId}
            onChange={(e) => setSelectedQuestId(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#17243A] shadow-xs"
          >
            {questionnaires.map(q => (
              <option key={q.id} value={q.id}>{q.title} (v{q.version})</option>
            ))}
          </select>

          <button
            onClick={handleSaveToDatabase}
            disabled={saving}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-[#17243A] text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C8202F] ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            className="bg-[#C8202F] hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-2"
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
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'questions' ? 'bg-[#17243A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Form Questions ({currentQuestionnaire?.questions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('publishing')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'publishing' ? 'bg-[#17243A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Enumerators, Access Codes & QR</span>
        </button>
        <button
          onClick={() => setActiveTab('xform')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'xform' ? 'bg-[#17243A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>ODK XForm & JSON</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-[#17243A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Form Properties</span>
        </button>
      </div>

      {/* Tab Content: Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Survey Variables & Skip Logic</span>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#17243A] hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          {currentQuestionnaire?.questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-[#17243A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-[#17243A]">{q.label}</h3>
                    <span className="text-[10px] font-mono bg-red-50 text-[#C8202F] px-2 py-0.5 rounded font-semibold">{q.variableName}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase font-semibold">{q.type}</span>
                    {q.required && <span className="text-[10px] text-red-600 font-bold">*Required</span>}
                  </div>
                  {q.hint && <p className="text-[11px] text-gray-500 italic">Hint: {q.hint}</p>}
                  
                  {q.options && q.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {q.options.map((opt, i) => (
                        <span key={i} className="bg-gray-50 border border-gray-200 text-gray-700 text-[10px] px-2.5 py-1 rounded-md font-medium">
                          {opt.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-2 text-gray-400 hover:text-[#C8202F] hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Publishing, Access Codes & QR */}
      {activeTab === 'publishing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-[#17243A]">Field Enumerator Assignment & QR Access</h2>
                <p className="text-xs text-gray-500">Assign questionnaire v{currentQuestionnaire.version} to field staff & generate secure QR codes</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-1 rounded-lg border border-emerald-200">
                Published & Active
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Assigned Field Enumerators ({enumerators.length})</h3>
              
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {enumerators.map(enu => (
                  <div key={enu.id} className="bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#17243A] text-white flex items-center justify-center font-bold text-xs">
                        {enu.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#17243A]">{enu.name} ({enu.id})</p>
                        <p className="text-[10px] text-gray-500">{enu.state} State • Code: <strong className="text-gray-800 font-mono">CMRG-ACC-{enu.id.replace('ENU-', '')}89</strong></p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEnumerator(enu);
                        setShowQRModal(true);
                      }}
                      className="bg-[#C8202F] hover:bg-red-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR Access Code</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#17243A] text-white rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Questionnaire Publication Summary</span>
                <span className="text-xs font-mono bg-[#C8202F] text-white px-2 py-0.5 rounded font-bold">v{currentQuestionnaire.version}</span>
              </div>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Associated Project</span>
                  <p className="font-bold text-white mt-0.5">{associatedProject?.title || 'Research Project'}</p>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Total Variables</span>
                  <p className="font-bold text-emerald-400 mt-0.5">{currentQuestionnaire.questions.length} Questions (ODK XForm Ready)</p>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Last Version Update</span>
                  <p className="font-bold text-white mt-0.5">{currentQuestionnaire.updatedAt}</p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>PostgreSQL Immutable Versioning</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Published questionnaire versions are locked in Supabase to ensure historical data integrity across all completed field interviews.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: XForm Export */}
      {activeTab === 'xform' && (
        <div className="bg-[#17243A] rounded-2xl p-6 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold">ODK / SurveyCTO XForm XML Definition</h2>
              <p className="text-xs text-gray-400">Ready for direct deployment to ODK Aggregate or SurveyCTO server</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(generateXFormXML())}
              className="bg-[#C8202F] hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy XML</span>
            </button>
          </div>
          <pre className="text-xs font-mono bg-[#0D1522] p-4 rounded-xl overflow-x-auto text-emerald-400 leading-relaxed max-h-96">
            {generateXFormXML()}
          </pre>
        </div>
      )}

      {/* Tab Content: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 max-w-xl">
          <h2 className="text-sm font-bold text-[#17243A]">Questionnaire Metadata</h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Form Title</label>
              <input
                type="text"
                value={currentQuestionnaire.title}
                onChange={(e) => {
                  const updated = { ...currentQuestionnaire, title: e.target.value };
                  onUpdateQuestionnaire(updated);
                }}
                className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Form Version</label>
              <input
                type="text"
                value={currentQuestionnaire.version}
                onChange={(e) => {
                  const updated = { ...currentQuestionnaire, version: e.target.value };
                  onUpdateQuestionnaire(updated);
                }}
                className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Last Updated</label>
              <input
                type="text"
                disabled
                value={currentQuestionnaire.updatedAt}
                className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-base font-bold text-[#17243A]">Publish Questionnaire Version</h2>
              <button onClick={() => setShowPublishModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">New Version Number</label>
                <input
                  type="text"
                  required
                  value={publishVersion}
                  onChange={(e) => setPublishVersion(e.target.value)}
                  className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 font-mono font-bold text-[#17243A]"
                  placeholder="e.g. 2.6"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Changelog & Release Notes</label>
                <textarea
                  rows={3}
                  required
                  value={publishChangelog}
                  onChange={(e) => setPublishChangelog(e.target.value)}
                  className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#17243A]"
                  placeholder="Describe changes made to questions or skip logic..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#C8202F] hover:bg-red-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  {saving ? 'Publishing...' : 'Publish to PostgreSQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Access Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 relative border border-gray-100">
            <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-black rounded-full bg-gray-100">×</button>
            
            <div className="w-12 h-12 bg-red-50 text-[#C8202F] rounded-2xl mx-auto flex items-center justify-center shadow-inner">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#17243A]">Enumerator Field Access & Install QR</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedEnumerator ? `${selectedEnumerator.name} (${selectedEnumerator.id})` : 'All Field Enumerators'}
              </p>
            </div>

            {/* QR Code Container with High-Contrast QR Pattern */}
            <div className="w-52 h-52 bg-gradient-to-br from-[#0B0F17] to-[#17243A] border-2 border-[#E30620] rounded-2xl p-4 mx-auto flex flex-col items-center justify-center relative shadow-lg">
              <div className="bg-white p-2.5 rounded-xl flex flex-col items-center justify-center shadow-md">
                <QrCode className="w-28 h-28 text-[#0B0F17]" />
                <span className="text-[9px] font-mono font-bold text-[#E30620] mt-1 tracking-wider">SCAN TO INSTALL</span>
              </div>
              <span className="text-[10px] font-mono text-gray-300 mt-2">
                app.ourfield.com/install/{currentQuestionnaire?.id ? currentQuestionnaire.id.replace('quest-', 'CMRG-') : 'CMRG-123'}
              </span>
            </div>

            {/* Direct Link Box */}
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold text-gray-800 flex items-center justify-between gap-2">
              <span className="truncate text-[11px] text-[#17243A]">
                app.ourfield.com/install/{currentQuestionnaire?.id ? currentQuestionnaire.id.replace('quest-', 'CMRG-') : 'CMRG-123'}
              </span>
              <button
                onClick={() => {
                  const url = `${window.location.origin}?install=${currentQuestionnaire?.id ? currentQuestionnaire.id.replace('quest-', 'CMRG-') : 'CMRG-123'}`;
                  navigator.clipboard?.writeText(url);
                  alert('Install link copied to clipboard!');
                }}
                className="p-1 text-gray-500 hover:text-[#C8202F] shrink-0"
                title="Copy link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-gray-500 leading-snug">
              Enumerator scans with phone camera → opens browser page with <b>"INSTALL APP"</b> button → PWA installs to phone home screen.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              {onNavigateToInstall && (
                <button
                  type="button"
                  onClick={() => {
                    const code = currentQuestionnaire?.id ? currentQuestionnaire.id.replace('quest-', 'CMRG-') : 'CMRG-123';
                    setShowQRModal(false);
                    onNavigateToInstall(code);
                  }}
                  className="w-full py-2.5 bg-[#17243A] hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Test Mobile Install Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#E30620]" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-base font-bold text-[#17243A]">Add Questionnaire Question</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Question Label / Prompt</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., What is the retail selling price of this item?"
                  value={newLabel}
                  onChange={(e) => {
                    setNewLabel(e.target.value);
                    if (!newVarName) {
                      setNewVarName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20));
                    }
                  }}
                  className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Variable Name (XML Tag)</label>
                  <input
                    type="text"
                    required
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Question Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
                  >
                    <option value="text">Text (Single Line)</option>
                    <option value="integer">Integer (Number)</option>
                    <option value="decimal">Decimal Number</option>
                    <option value="select_one">Select One (Radio)</option>
                    <option value="select_multiple">Select Multiple (Checkbox)</option>
                    <option value="gps">GPS Location Capture</option>
                    <option value="photo">Photo Capture</option>
                    <option value="audio">Audio Recording</option>
                    <option value="date">Date / Time</option>
                  </select>
                </div>
              </div>

              {(newType === 'select_one' || newType === 'select_multiple') && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Options (Comma separated)</label>
                  <input
                    type="text"
                    value={newOptionsText}
                    onChange={(e) => setNewOptionsText(e.target.value)}
                    className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Enumerator Hint (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Verify price tag directly from merchant ledger"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="req"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                  className="rounded border-gray-300 text-[#C8202F] focus:ring-[#C8202F]"
                />
                <label htmlFor="req" className="font-semibold text-gray-700">Mandatory question (Required for completion)</label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C8202F] hover:bg-red-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
