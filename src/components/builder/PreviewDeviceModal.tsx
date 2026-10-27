import React, { useState } from 'react';
import { Questionnaire, Question } from '../../types';
import { LogicEngine } from '../../services/questionnaireLogicEngine';
import { 
  X, 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Check, 
  Camera, 
  Mic, 
  Video, 
  MapPin, 
  QrCode, 
  Signature
} from 'lucide-react';

interface PreviewDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaire: Questionnaire;
}

export const PreviewDeviceModal: React.FC<PreviewDeviceModalProps> = ({
  isOpen,
  onClose,
  questionnaire
}) => {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showDebugger, setShowDebugger] = useState(false);

  if (!isOpen) return null;

  const handleAnswer = (varName: string, val: any) => {
    setAnswers(prev => ({ ...prev, [varName]: val }));
  };

  const handleReset = () => {
    setAnswers({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0B0F17] rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl border border-gray-800 overflow-hidden text-gray-200">
        {/* Top Control Bar */}
        <div className="p-3.5 px-5 bg-[#121824] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider bg-[#C8202F] px-2 py-0.5 rounded">
              Interactive Test Sandbox
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {questionnaire.title} (v{questionnaire.version})
            </span>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center gap-1 bg-[#1A2333] p-1 rounded-xl border border-gray-700">
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                device === 'mobile' ? 'bg-[#C8202F] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (PWA)</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                device === 'tablet' ? 'bg-[#C8202F] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                device === 'desktop' ? 'bg-[#C8202F] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDebugger(!showDebugger)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                showDebugger ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-transparent text-gray-400 border-gray-700 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showDebugger ? 'Hide Logic Debugger' : 'Show Logic Debugger'}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Frame */}
        <div className="flex-1 overflow-hidden flex bg-[#06090E]">
          {/* Main Simulator Viewport */}
          <div className="flex-1 overflow-y-auto p-4 flex justify-center items-start">
            <div className={`transition-all duration-300 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-300 overflow-hidden my-4 ${
              device === 'mobile' ? 'w-[385px] min-h-[640px]' : device === 'tablet' ? 'w-[680px] min-h-[700px]' : 'w-full max-w-4xl min-h-[700px]'
            }`}>
              {/* Device Header */}
              <div className="p-4 bg-[#17243A] text-white flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-bold uppercase tracking-wider">CMRG Field Collector</span>
                </div>
                <span className="text-[10px] font-mono text-gray-300 bg-white/10 px-2 py-0.5 rounded">
                  v{questionnaire.version} • Sandbox
                </span>
              </div>

              {/* Form Content */}
              <div className="p-5 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[#17243A]">{questionnaire.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live simulation with dynamic skip logic, calculations, and text piping.
                  </p>
                </div>

                {/* Render Questions in order */}
                <div className="space-y-5">
                  {questionnaire.questions.map((q, idx) => {
                    const isVisible = LogicEngine.isQuestionRelevant(q, answers);
                    if (!isVisible) return null;

                    const pipedLabel = LogicEngine.pipeText(q.label, answers);
                    const screenout = LogicEngine.checkScreenout(q, answers);

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border transition-all ${
                          screenout.screenout
                            ? 'bg-red-50 border-red-300 ring-2 ring-red-500/20'
                            : 'bg-gray-50/70 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <label className="text-xs font-bold text-gray-800">
                            <span className="text-[#C8202F] mr-1.5">Q{idx + 1}.</span>
                            {pipedLabel}
                            {q.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                        </div>

                        {q.hint && (
                          <p className="text-[11px] text-gray-500 mb-2 italic">{q.hint}</p>
                        )}

                        {/* Question Inputs */}
                        {q.type === 'text' && (
                          <input
                            type="text"
                            value={answers[q.variableName] || ''}
                            onChange={(e) => handleAnswer(q.variableName, e.target.value)}
                            placeholder="Type respondent answer..."
                            className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#C8202F]"
                          />
                        )}

                        {q.type === 'textarea' && (
                          <textarea
                            rows={3}
                            value={answers[q.variableName] || ''}
                            onChange={(e) => handleAnswer(q.variableName, e.target.value)}
                            placeholder="Type detailed verbatim comments..."
                            className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#C8202F]"
                          />
                        )}

                        {(q.type === 'integer' || q.type === 'decimal') && (
                          <input
                            type="number"
                            step={q.type === 'decimal' ? '0.01' : '1'}
                            value={answers[q.variableName] ?? ''}
                            onChange={(e) => handleAnswer(q.variableName, e.target.value ? Number(e.target.value) : '')}
                            placeholder="Enter number..."
                            className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg font-mono focus:outline-hidden focus:border-[#C8202F]"
                          />
                        )}

                        {q.type === 'yes_no' && (
                          <div className="grid grid-cols-2 gap-2">
                            {['yes', 'no'].map((choice) => (
                              <button
                                key={choice}
                                type="button"
                                onClick={() => handleAnswer(q.variableName, choice)}
                                className={`py-2 px-3 text-xs font-bold rounded-lg border capitalize transition-colors ${
                                  answers[q.variableName] === choice
                                    ? 'bg-[#17243A] text-white border-[#17243A]'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {choice}
                              </button>
                            ))}
                          </div>
                        )}

                        {q.type === 'select_one' && (
                          <div className="space-y-1.5">
                            {(q.options || []).map((opt) => (
                              <label
                                key={opt.id}
                                className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  answers[q.variableName] === opt.value
                                    ? 'bg-red-50/50 border-[#C8202F] font-bold text-[#17243A]'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={q.variableName}
                                  value={opt.value}
                                  checked={answers[q.variableName] === opt.value}
                                  onChange={() => handleAnswer(q.variableName, opt.value)}
                                  className="text-[#C8202F] focus:ring-[#C8202F]"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {q.type === 'select_multiple' && (
                          <div className="space-y-1.5">
                            {(q.options || []).map((opt) => {
                              const currentSelected: string[] = answers[q.variableName] || [];
                              const isChecked = currentSelected.includes(opt.value);
                              return (
                                <label
                                  key={opt.id}
                                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                    isChecked
                                      ? 'bg-red-50/50 border-[#C8202F] font-bold text-[#17243A]'
                                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        handleAnswer(q.variableName, [...currentSelected, opt.value]);
                                      } else {
                                        handleAnswer(q.variableName, currentSelected.filter(v => v !== opt.value));
                                      }
                                    }}
                                    className="rounded text-[#C8202F] focus:ring-[#C8202F]"
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* NPS 0-10 */}
                        {q.type === 'nps' && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-11 gap-1">
                              {Array.from({ length: 11 }, (_, i) => i).map((score) => {
                                const isSelected = answers[q.variableName] === score;
                                const isPromoter = score >= 9;
                                const isPassive = score >= 7 && score <= 8;
                                const isDetractor = score <= 6;

                                return (
                                  <button
                                    key={score}
                                    type="button"
                                    onClick={() => handleAnswer(q.variableName, score)}
                                    className={`py-2 rounded text-xs font-bold transition-all ${
                                      isSelected
                                        ? 'bg-[#C8202F] text-white ring-2 ring-red-400'
                                        : isPromoter
                                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                        : isPassive
                                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                                    }`}
                                  >
                                    {score}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-gray-500 px-1">
                              <span>0 (Not at all likely)</span>
                              <span>10 (Extremely likely)</span>
                            </div>
                          </div>
                        )}

                        {/* Rating 1-5 */}
                        {q.type === 'rating' && (
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleAnswer(q.variableName, val)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                                  answers[q.variableName] === val
                                    ? 'bg-yellow-400 text-yellow-950 border-yellow-500 shadow-xs'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {val} ★
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Calculation */}
                        {q.type === 'calculation' && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="font-mono text-emerald-800">Formula: {q.calculationFormula}</span>
                            <span className="font-bold text-emerald-900 bg-white px-2 py-1 rounded shadow-xs">
                              = {LogicEngine.evaluateCalculation(q.calculationFormula || '', answers)}
                            </span>
                          </div>
                        )}

                        {/* Constant Sum */}
                        {q.type === 'constant_sum' && (
                          <div className="space-y-2">
                            {(q.options || []).map((opt) => (
                              <div key={opt.id} className="flex items-center justify-between gap-2 text-xs">
                                <span>{opt.label}</span>
                                <input
                                  type="number"
                                  value={answers[q.variableName]?.[opt.value] || ''}
                                  onChange={(e) => {
                                    const prev = answers[q.variableName] || {};
                                    handleAnswer(q.variableName, { ...prev, [opt.value]: Number(e.target.value) || 0 });
                                  }}
                                  className="w-20 p-1.5 border border-gray-300 rounded font-mono text-right"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Photo / Audio / GPS / Signature Placeholders */}
                        {['photo', 'video', 'audio', 'gps', 'signature'].includes(q.type) && (
                          <div className="p-3 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-between text-xs text-gray-600">
                            <span className="flex items-center gap-2">
                              {q.type === 'photo' && <Camera className="w-4 h-4 text-[#C8202F]" />}
                              {q.type === 'video' && <Video className="w-4 h-4 text-[#C8202F]" />}
                              {q.type === 'audio' && <Mic className="w-4 h-4 text-[#C8202F]" />}
                              {q.type === 'gps' && <MapPin className="w-4 h-4 text-emerald-600" />}
                              {q.type === 'signature' && <Signature className="w-4 h-4 text-gray-700" />}
                              <span>{q.type.toUpperCase()} sensor simulator</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAnswer(q.variableName, `simulated_${q.type}_${Date.now()}`)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded font-semibold text-[11px]"
                            >
                              {answers[q.variableName] ? 'Captured ✓' : 'Simulate Capture'}
                            </button>
                          </div>
                        )}

                        {/* Screenout Trigger Notice */}
                        {screenout.screenout && (
                          <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg text-xs text-red-900 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-bold">TERMINATION CONDITION TRIGGERED:</strong>
                              <span>{screenout.message}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Logic Debugger Sidebar */}
          {showDebugger && (
            <div className="w-80 bg-[#0F141F] border-l border-gray-800 p-4 overflow-y-auto space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Logic & Answer State</span>
              </h4>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400">Current Answer Store:</span>
                <pre className="p-3 bg-[#06090E] rounded-xl text-[10px] font-mono text-emerald-400 border border-gray-800 max-h-56 overflow-y-auto">
                  {JSON.stringify(answers, null, 2)}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400">Relevance Evaluation Matrix:</span>
                <div className="space-y-1.5">
                  {questionnaire.questions.map((q) => {
                    const active = LogicEngine.isQuestionRelevant(q, answers);
                    return (
                      <div key={q.id} className="p-2 rounded bg-[#161D2C] border border-gray-800 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-gray-300 font-bold">${'{' + q.variableName + '}'}</span>
                          <span className={`px-1.5 py-0.2 rounded font-bold ${active ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                            {active ? 'VISIBLE' : 'HIDDEN'}
                          </span>
                        </div>
                        {q.relevantCondition && (
                          <div className="text-[9px] text-gray-400 font-mono mt-0.5 truncate">
                            Rule: {q.relevantCondition}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
