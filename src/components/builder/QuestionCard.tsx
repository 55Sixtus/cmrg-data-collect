import React, { useState } from 'react';
import { Question, QuestionType, QuestionOption, MatrixRow, MatrixCol, SemanticPair } from '../../types';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Copy, 
  Settings2, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  X, 
  HelpCircle, 
  Shuffle, 
  Sliders, 
  Calculator, 
  Layers, 
  ShieldAlert, 
  CheckCircle,
  FileText
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  allQuestions: Question[];
  onUpdate: (updated: Question) => void;
  onDelete: (id: string) => void;
  onDuplicate: (q: Question) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  totalQuestions,
  allQuestions,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown
}) => {
  const [expanded, setExpanded] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'options' | 'logic' | 'validation'>('content');

  const questionTypeLabels: Record<QuestionType, { label: string; badge: string; color: string }> = {
    text: { label: 'Single-line Text', badge: 'Text', color: 'bg-blue-100 text-blue-800' },
    textarea: { label: 'Long Answer / Essay', badge: 'Textarea', color: 'bg-indigo-100 text-indigo-800' },
    integer: { label: 'Integer (Whole Number)', badge: 'Int', color: 'bg-amber-100 text-amber-800' },
    decimal: { label: 'Decimal Number', badge: 'Dec', color: 'bg-amber-100 text-amber-800' },
    yes_no: { label: 'Yes / No Binary', badge: 'Y/N', color: 'bg-emerald-100 text-emerald-800' },
    select_one: { label: 'Single Choice (Radio)', badge: 'Select 1', color: 'bg-purple-100 text-purple-800' },
    select_multiple: { label: 'Multiple Choice (Checkboxes)', badge: 'Select Many', color: 'bg-purple-100 text-purple-800' },
    dropdown: { label: 'Dropdown Selection', badge: 'Dropdown', color: 'bg-purple-100 text-purple-800' },
    rating: { label: 'Rating / Likert Scale', badge: 'Rating', color: 'bg-yellow-100 text-yellow-800' },
    nps: { label: 'Net Promoter Score (0-10)', badge: 'NPS', color: 'bg-rose-100 text-rose-800' },
    matrix: { label: 'Matrix / Grid Table', badge: 'Matrix', color: 'bg-cyan-100 text-cyan-800' },
    ranking: { label: 'Ranking / Preference Order', badge: 'Ranking', color: 'bg-teal-100 text-teal-800' },
    semantic_differential: { label: 'Semantic Differential Scale', badge: 'Semantic', color: 'bg-fuchsia-100 text-fuchsia-800' },
    constant_sum: { label: 'Constant Sum (Target Total)', badge: 'Constant Sum', color: 'bg-orange-100 text-orange-800' },
    date: { label: 'Calendar Date', badge: 'Date', color: 'bg-blue-100 text-blue-800' },
    time: { label: 'Time of Day', badge: 'Time', color: 'bg-blue-100 text-blue-800' },
    duration: { label: 'Duration (Minutes/Hours)', badge: 'Duration', color: 'bg-blue-100 text-blue-800' },
    calculation: { label: 'Calculated Field (Formula)', badge: 'Calc', color: 'bg-emerald-100 text-emerald-800' },
    image_select: { label: 'Image Selection Choice', badge: 'Img Select', color: 'bg-pink-100 text-pink-800' },
    photo: { label: 'Camera Photo (GPS Watermarked)', badge: 'Camera', color: 'bg-red-100 text-[#C8202F]' },
    video: { label: 'Video Survey (Up to 1 Min)', badge: 'Video', color: 'bg-red-100 text-[#C8202F]' },
    audio: { label: 'Audio Recorder (Waveform)', badge: 'Audio', color: 'bg-red-100 text-[#C8202F]' },
    signature: { label: 'Signature / Consent Canvas', badge: 'Signature', color: 'bg-gray-100 text-gray-800' },
    gps: { label: 'GPS Satellite Fix', badge: 'GPS', color: 'bg-emerald-100 text-emerald-800' },
    barcode: { label: 'Barcode / QR Scanner', badge: 'Barcode', color: 'bg-gray-100 text-gray-800' },
    repeat_group: { label: 'Repeating Group (Loop / Roster)', badge: 'Loop', color: 'bg-violet-100 text-violet-800' },
    instruction: { label: 'Instruction / Section Note', badge: 'Section', color: 'bg-slate-100 text-slate-800' }
  };

  const handleOptionChange = (optIdx: number, field: 'label' | 'value', val: string) => {
    const opts = [...(question.options || [])];
    opts[optIdx] = { ...opts[optIdx], [field]: val };
    onUpdate({ ...question, options: opts });
  };

  const handleAddOption = () => {
    const count = (question.options || []).length + 1;
    const newOpt: QuestionOption = {
      id: `opt_${Date.now()}_${count}`,
      label: `Option ${count}`,
      value: `option_${count}`
    };
    onUpdate({ ...question, options: [...(question.options || []), newOpt] });
  };

  const handleRemoveOption = (optIdx: number) => {
    const opts = (question.options || []).filter((_, i) => i !== optIdx);
    onUpdate({ ...question, options: opts });
  };

  // Matrix handlers
  const handleAddMatrixRow = () => {
    const count = (question.matrixRows || []).length + 1;
    const newRow: MatrixRow = { id: `r_${Date.now()}`, label: `Attribute Statement ${count}` };
    onUpdate({ ...question, matrixRows: [...(question.matrixRows || []), newRow] });
  };

  const handleAddMatrixCol = () => {
    const count = (question.matrixCols || []).length + 1;
    const newCol: MatrixCol = { id: `c_${Date.now()}`, label: `Scale ${count}`, value: `${count}` };
    onUpdate({ ...question, matrixCols: [...(question.matrixCols || []), newCol] });
  };

  // Semantic pairs handlers
  const handleAddSemanticPair = () => {
    const newPair: SemanticPair = { id: `sp_${Date.now()}`, leftLabel: 'Negative / Slow', rightLabel: 'Positive / Fast' };
    onUpdate({ ...question, semanticPairs: [...(question.semanticPairs || []), newPair] });
  };

  return (
    <div className={`border rounded-xl transition-all duration-200 bg-white ${
      expanded ? 'border-[#C8202F] shadow-md ring-1 ring-[#C8202F]/10' : 'border-gray-200 hover:border-gray-300 shadow-xs'
    }`}>
      {/* Question Header Bar */}
      <div className="p-4 flex items-center justify-between gap-3 bg-gray-50/70 rounded-t-xl cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="w-6 h-6 rounded-full bg-[#17243A] text-white text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>

          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
            questionTypeLabels[question.type]?.color || 'bg-gray-100 text-gray-800'
          }`}>
            {questionTypeLabels[question.type]?.badge || question.type}
          </span>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#17243A] truncate">
              {question.label || <span className="text-gray-400 italic">Untitled Question</span>}
            </h4>
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
              <span>${'{' + question.variableName + '}'}</span>
              {question.required && <span className="text-[#C8202F] font-bold">• Required</span>}
              {question.relevantCondition && (
                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-sans">
                  🔀 Skip logic active
                </span>
              )}
              {question.screenoutCondition && (
                <span className="text-red-700 bg-red-50 px-1.5 py-0.2 rounded font-sans">
                  ⛔ Screener
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveUp(index)}
            className="p-1.5 text-gray-400 hover:text-[#17243A] disabled:opacity-30 rounded hover:bg-gray-200"
            title="Move Question Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalQuestions - 1}
            onClick={() => onMoveDown(index)}
            className="p-1.5 text-gray-400 hover:text-[#17243A] disabled:opacity-30 rounded hover:bg-gray-200"
            title="Move Question Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(question)}
            className="p-1.5 text-gray-400 hover:text-[#17243A] rounded hover:bg-gray-200"
            title="Clone Question"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(question.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
            title="Delete Question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-500 hover:text-[#17243A] rounded hover:bg-gray-200 ml-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Editor Body */}
      {expanded && (
        <div className="p-5 border-t border-gray-200 space-y-4">
          {/* Sub Navigation */}
          <div className="flex items-center gap-1 border-b border-gray-100 pb-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('content')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === 'content' ? 'bg-[#17243A] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Content & Prompt
            </button>
            {['select_one', 'select_multiple', 'dropdown', 'ranking', 'constant_sum', 'matrix', 'semantic_differential'].includes(question.type) && (
              <button
                type="button"
                onClick={() => setActiveSubTab('options')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeSubTab === 'options' ? 'bg-[#17243A] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Choices & Structure
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveSubTab('logic')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                activeSubTab === 'logic' ? 'bg-[#17243A] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Skip Logic & Piping</span>
              {(question.relevantCondition || question.screenoutCondition) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8202F]"></span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('validation')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === 'validation' ? 'bg-[#17243A] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Validation & Constraints
            </button>
          </div>

          {/* Tab 1: Content & Prompt */}
          {activeSubTab === 'content' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Question Label / Interviewer Script
                  </label>
                  <textarea
                    rows={2}
                    value={question.label}
                    onChange={(e) => onUpdate({ ...question, label: e.target.value })}
                    placeholder="Enter question text or prompt to read to respondent..."
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#C8202F] focus:outline-hidden"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Tip: Use <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">{`{{variable_name}}`}</code> to dynamically pipe previous answers.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) => onUpdate({ ...question, type: e.target.value as QuestionType })}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-[#C8202F] focus:outline-hidden"
                  >
                    {Object.entries(questionTypeLabels).map(([typeKey, meta]) => (
                      <option key={typeKey} value={typeKey}>{meta.label}</option>
                    ))}
                  </select>

                  <div className="mt-3 flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700">Mandatory / Required</label>
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
                      className="rounded text-[#C8202F] focus:ring-[#C8202F] w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Variable Name (Column Name in DB & Exports)
                  </label>
                  <input
                    type="text"
                    value={question.variableName}
                    onChange={(e) => onUpdate({ ...question, variableName: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                    placeholder="e.g. household_head_age"
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg font-mono focus:ring-1 focus:ring-[#C8202F] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Interviewer Hint / Enumerator Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={question.hint || ''}
                    onChange={(e) => onUpdate({ ...question, hint: e.target.value })}
                    placeholder="e.g. Do not read options aloud; observe dwelling entrance"
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#C8202F] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Specific configs based on type */}
              {question.type === 'calculation' && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Calculator className="w-4 h-4 text-emerald-700" />
                    <span>Calculation Formula Engine</span>
                  </div>
                  <input
                    type="text"
                    value={question.calculationFormula || ''}
                    onChange={(e) => onUpdate({ ...question, calculationFormula: e.target.value })}
                    placeholder="e.g. weight_kg / ((height_cm/100)*(height_cm/100)) or unit_price * quantity"
                    className="w-full text-xs p-2 border border-emerald-300 rounded-lg font-mono bg-white focus:outline-hidden"
                  />
                  <p className="text-[10px] text-emerald-800">
                    Formula evaluates automatically in real-time as the enumerator fills earlier inputs. Supports Math functions: round, floor, ceil.
                  </p>
                </div>
              )}

              {question.type === 'repeat_group' && (
                <div className="p-3 bg-violet-50/70 border border-violet-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
                    <Layers className="w-4 h-4 text-violet-700" />
                    <span>Repeating Group / Loop Configuration</span>
                  </div>
                  <p className="text-xs text-violet-800">
                    Repeats child survey questions for each household member, purchased item, or transaction.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-violet-900 mb-0.5">Repeat Count Variable (Optional)</label>
                      <input
                        type="text"
                        value={question.repeatCountVar || ''}
                        onChange={(e) => onUpdate({ ...question, repeatCountVar: e.target.value })}
                        placeholder="e.g. member_count"
                        className="w-full text-xs p-1.5 border border-violet-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-violet-900 mb-0.5">Maximum Iterations</label>
                      <input
                        type="number"
                        value={question.repeatMax || 15}
                        onChange={(e) => onUpdate({ ...question, repeatMax: Number(e.target.value) })}
                        className="w-full text-xs p-1.5 border border-violet-300 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Choices & Structure (Options, Matrix, Semantic Differential) */}
          {activeSubTab === 'options' && (
            <div className="space-y-4">
              {/* Choices for Select One, Select Multiple, Dropdown, Ranking */}
              {['select_one', 'select_multiple', 'dropdown', 'ranking', 'constant_sum'].includes(question.type) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">Answer Choices</span>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs font-bold text-[#C8202F] hover:text-red-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Choice Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(question.options || []).map((opt, oIdx) => (
                      <div key={opt.id || oIdx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400 w-5 text-right">{oIdx + 1}.</span>
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleOptionChange(oIdx, 'label', e.target.value)}
                          placeholder="Option Label"
                          className="flex-1 text-xs p-2 border border-gray-300 rounded-lg focus:outline-hidden"
                        />
                        <input
                          type="text"
                          value={opt.value}
                          onChange={(e) => handleOptionChange(oIdx, 'value', e.target.value)}
                          placeholder="value_code"
                          className="w-32 text-xs p-2 border border-gray-300 rounded-lg font-mono text-gray-600 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(oIdx)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Other-specify toggle & Randomize toggle */}
                  <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100 text-xs">
                    <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.allowOther || false}
                        onChange={(e) => onUpdate({ ...question, allowOther: e.target.checked })}
                        className="rounded text-[#C8202F] focus:ring-[#C8202F]"
                      />
                      <span className="font-semibold">Include "Other (Please specify)" with text box</span>
                    </label>

                    <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.randomizeOptions || false}
                        onChange={(e) => onUpdate({ ...question, randomizeOptions: e.target.checked })}
                        className="rounded text-[#C8202F] focus:ring-[#C8202F]"
                      />
                      <span className="font-semibold flex items-center gap-1">
                        <Shuffle className="w-3 h-3" /> Randomize option order in field
                      </span>
                    </label>
                  </div>

                  {question.type === 'constant_sum' && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between text-xs text-orange-900">
                      <span>Target Total Sum (e.g. 100% or 10 points):</span>
                      <input
                        type="number"
                        value={question.constantSumTotal || 100}
                        onChange={(e) => onUpdate({ ...question, constantSumTotal: Number(e.target.value) })}
                        className="w-24 p-1.5 border border-orange-300 rounded font-mono font-bold text-center bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Matrix / Grid Config */}
              {question.type === 'matrix' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700">Matrix Rows (Statements / Attributes)</span>
                      <button
                        type="button"
                        onClick={handleAddMatrixRow}
                        className="text-xs font-bold text-[#C8202F] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Row
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {(question.matrixRows || []).map((row, rIdx) => (
                        <div key={row.id} className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-400 w-5">R{rIdx + 1}</span>
                          <input
                            type="text"
                            value={row.label}
                            onChange={(e) => {
                              const rows = [...(question.matrixRows || [])];
                              rows[rIdx] = { ...rows[rIdx], label: e.target.value };
                              onUpdate({ ...question, matrixRows: rows });
                            }}
                            className="flex-1 text-xs p-1.5 border border-gray-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const rows = (question.matrixRows || []).filter((_, i) => i !== rIdx);
                              onUpdate({ ...question, matrixRows: rows });
                            }}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700">Matrix Columns (Rating Scale)</span>
                      <button
                        type="button"
                        onClick={handleAddMatrixCol}
                        className="text-xs font-bold text-[#C8202F] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Column
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {(question.matrixCols || []).map((col, cIdx) => (
                        <div key={col.id} className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-400 w-5">C{cIdx + 1}</span>
                          <input
                            type="text"
                            value={col.label}
                            onChange={(e) => {
                              const cols = [...(question.matrixCols || [])];
                              cols[cIdx] = { ...cols[cIdx], label: e.target.value };
                              onUpdate({ ...question, matrixCols: cols });
                            }}
                            className="flex-1 text-xs p-1.5 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={col.value}
                            onChange={(e) => {
                              const cols = [...(question.matrixCols || [])];
                              cols[cIdx] = { ...cols[cIdx], value: e.target.value };
                              onUpdate({ ...question, matrixCols: cols });
                            }}
                            className="w-24 text-xs p-1.5 border border-gray-300 rounded font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const cols = (question.matrixCols || []).filter((_, i) => i !== cIdx);
                              onUpdate({ ...question, matrixCols: cols });
                            }}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Semantic Differential Config */}
              {question.type === 'semantic_differential' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">Bipolar Opposing Adjectives (Left vs Right)</span>
                    <button
                      type="button"
                      onClick={handleAddSemanticPair}
                      className="text-xs font-bold text-[#C8202F] flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Semantic Pair
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(question.semanticPairs || []).map((pair, pIdx) => (
                      <div key={pair.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <input
                          type="text"
                          value={pair.leftLabel}
                          onChange={(e) => {
                            const pairs = [...(question.semanticPairs || [])];
                            pairs[pIdx] = { ...pairs[pIdx], leftLabel: e.target.value };
                            onUpdate({ ...question, semanticPairs: pairs });
                          }}
                          placeholder="Left Label (e.g. Traditional)"
                          className="flex-1 text-xs p-1.5 border border-gray-300 rounded bg-white text-right"
                        />
                        <span className="text-xs font-bold text-gray-400">⟷</span>
                        <input
                          type="text"
                          value={pair.rightLabel}
                          onChange={(e) => {
                            const pairs = [...(question.semanticPairs || [])];
                            pairs[pIdx] = { ...pairs[pIdx], rightLabel: e.target.value };
                            onUpdate({ ...question, semanticPairs: pairs });
                          }}
                          placeholder="Right Label (e.g. Modern)"
                          className="flex-1 text-xs p-1.5 border border-gray-300 rounded bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const pairs = (question.semanticPairs || []).filter((_, i) => i !== pIdx);
                            onUpdate({ ...question, semanticPairs: pairs });
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Skip Logic, Relevance & Screenouts */}
          {activeSubTab === 'logic' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Sliders className="w-4 h-4 text-amber-700" />
                    <span>Conditional Display / Relevance Rule (Skip Logic)</span>
                  </div>
                  {question.relevantCondition && (
                    <button
                      type="button"
                      onClick={() => onUpdate({ ...question, relevantCondition: undefined })}
                      className="text-[10px] text-amber-800 underline font-semibold"
                    >
                      Clear Rule
                    </button>
                  )}
                </div>

                <p className="text-xs text-amber-800">
                  Show this question ONLY if condition is met. Operators: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">==, !=, &gt;, &lt;, &gt;=, &lt;=, in, &&, ||</code>
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={question.relevantCondition || ''}
                    onChange={(e) => onUpdate({ ...question, relevantCondition: e.target.value })}
                    placeholder="e.g. q_age >= 18 && has_shopped == 'yes'"
                    className="flex-1 text-xs p-2 border border-amber-300 rounded-lg bg-white font-mono focus:outline-hidden"
                  />
                </div>

                {/* Quick Helper Dropdown */}
                <div className="flex items-center gap-2 text-[10px] text-amber-900">
                  <span className="font-bold">Insert previous variable:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const cur = question.relevantCondition || '';
                        onUpdate({ ...question, relevantCondition: cur ? `${cur} && ${e.target.value} == 'yes'` : `${e.target.value} == 'yes'` });
                      }
                    }}
                    className="bg-white border border-amber-300 rounded px-2 py-1 text-[10px]"
                  >
                    <option value="">-- Select Question --</option>
                    {allQuestions.slice(0, index).map(q => (
                      <option key={q.id} value={q.variableName}>${'{' + q.variableName + '}'} - {q.label.slice(0, 30)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Termination / Screen-out Rule */}
              <div className="p-4 bg-red-50/60 border border-red-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-900">
                    <ShieldAlert className="w-4 h-4 text-red-700" />
                    <span>Eligibility Screening / Screenout Termination Rule</span>
                  </div>
                  {question.screenoutCondition && (
                    <button
                      type="button"
                      onClick={() => onUpdate({ ...question, screenoutCondition: undefined, screenoutMessage: undefined })}
                      className="text-[10px] text-red-800 underline font-semibold"
                    >
                      Disable Screenout
                    </button>
                  )}
                </div>

                <p className="text-xs text-red-800">
                  If respondent answers trigger this condition, the interview immediately terminates with a disqualification screen.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-red-900 mb-1">Termination Condition</label>
                    <input
                      type="text"
                      value={question.screenoutCondition || ''}
                      onChange={(e) => onUpdate({ ...question, screenoutCondition: e.target.value })}
                      placeholder="e.g. is_primary_shopper == 'no' or age < 18"
                      className="w-full text-xs p-2 border border-red-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-red-900 mb-1">Custom Disqualification Message</label>
                    <input
                      type="text"
                      value={question.screenoutMessage || ''}
                      onChange={(e) => onUpdate({ ...question, screenoutMessage: e.target.value })}
                      placeholder="e.g. Screenout: Target quota reached or respondent ineligible."
                      className="w-full text-xs p-2 border border-red-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Validation & Constraints */}
          {activeSubTab === 'validation' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <h5 className="text-xs font-bold text-gray-800">Range Limits & Character Constraints</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Min Value (Numeric)</label>
                    <input
                      type="number"
                      value={question.validation?.minValue ?? ''}
                      onChange={(e) => onUpdate({
                        ...question,
                        validation: { ...question.validation, minValue: e.target.value ? Number(e.target.value) : undefined }
                      })}
                      className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Max Value (Numeric)</label>
                    <input
                      type="number"
                      value={question.validation?.maxValue ?? ''}
                      onChange={(e) => onUpdate({
                        ...question,
                        validation: { ...question.validation, maxValue: e.target.value ? Number(e.target.value) : undefined }
                      })}
                      className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Min Length (Chars)</label>
                    <input
                      type="number"
                      value={question.validation?.minLength ?? ''}
                      onChange={(e) => onUpdate({
                        ...question,
                        validation: { ...question.validation, minLength: e.target.value ? Number(e.target.value) : undefined }
                      })}
                      className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Max Length (Chars)</label>
                    <input
                      type="number"
                      value={question.validation?.maxLength ?? ''}
                      onChange={(e) => onUpdate({
                        ...question,
                        validation: { ...question.validation, maxLength: e.target.value ? Number(e.target.value) : undefined }
                      })}
                      className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Regex Pattern Validation (Optional)</label>
                    <input
                      type="text"
                      value={question.validation?.regexPattern ?? ''}
                      onChange={(e) => onUpdate({
                        ...question,
                        validation: { ...question.validation, regexPattern: e.target.value || undefined }
                      })}
                      placeholder="e.g. ^0[7-9][0-1][0-9]{8}$ (Nigerian Phone)"
                      className="w-full text-xs p-2 border border-gray-300 rounded-lg font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Custom Error Message</label>
                    <input
                      type="text"
                      value={question.validation?.customErrorMessage ?? ''}
                      onChange={(e) => onUpdate({
                        ...question,
                        validation: { ...question.validation, customErrorMessage: e.target.value || undefined }
                      })}
                      placeholder="e.g. Value must be within reasonable market limits"
                      className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
