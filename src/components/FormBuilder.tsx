import React, { useState } from 'react';
import { Questionnaire, Question, QuestionType } from '../types';
import { 
  FileCode2, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Check, 
  Code, 
  Smartphone, 
  Sparkles,
  Layers,
  Settings,
  HelpCircle
} from 'lucide-react';

interface FormBuilderProps {
  questionnaires: Questionnaire[];
  onUpdateQuestionnaire: (updated: Questionnaire) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ questionnaires, onUpdateQuestionnaire }) => {
  const [selectedQuestId, setSelectedQuestId] = useState<string>(questionnaires[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'questions' | 'xform' | 'settings'>('questions');
  const [showAddModal, setShowAddModal] = useState(false);

  // New question form state
  const [newLabel, setNewLabel] = useState('');
  const [newVarName, setNewVarName] = useState('');
  const [newType, setNewType] = useState<QuestionType>('text');
  const [newRequired, setNewRequired] = useState(true);
  const [newHint, setNewHint] = useState('');
  const [newOptionsText, setNewOptionsText] = useState('Option 1, Option 2, Option 3');

  const currentQuestionnaire = questionnaires.find(q => q.id === selectedQuestId) || questionnaires[0];

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

  // Generate simulated ODK XForm XML
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
          <h1 className="text-xl font-bold text-[#17243A]">Questionnaire Design Studio</h1>
          <p className="text-xs text-gray-500">Build ODK/SurveyCTO-compatible survey forms with strict validation & skip logic</p>
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
            onClick={() => setShowAddModal(true)}
            className="bg-[#C8202F] hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
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
          onClick={() => setActiveTab('xform')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'xform' ? 'bg-[#17243A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>ODK XForm & JSON Export</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-[#17243A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Form Properties & Version</span>
        </button>
      </div>

      {/* Tab Content: Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {currentQuestionnaire?.questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-[#17243A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
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
              className="bg-[#C8202F] hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
            >
              Copy XML
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

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
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
