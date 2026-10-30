import React, { useRef, useState, useEffect } from 'react';
import { Question } from '../types';
import { LogicEngine } from '../services/questionnaireLogicEngine';
import { 
  Camera, 
  Mic, 
  Video, 
  MapPin, 
  Barcode, 
  Check, 
  RotateCcw, 
  Sliders, 
  Calculator, 
  Plus, 
  Trash2, 
  PenTool, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface QuestionRendererProps {
  question: Question;
  index?: number;
  value: any;
  allAnswers: Record<string, any>;
  onChange: (val: any) => void;
  gpsCoords?: { lat: number; lng: number; accuracy: number };
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  index,
  value,
  allAnswers,
  onChange,
  gpsCoords = { lat: 6.6192, lng: 3.3213, accuracy: 2.5 }
}) => {
  // Check relevance condition
  const isRelevant = LogicEngine.isQuestionRelevant(question, allAnswers);
  if (!isRelevant) return null;

  // Piped label
  const pipedLabel = LogicEngine.pipeText(question.label, allAnswers);

  // Screenout check
  const screenout = LogicEngine.checkScreenout(question, allAnswers);

  // Signature canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas if signature type
  useEffect(() => {
    if (question.type === 'signature' && canvasRef.current && value) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && typeof value === 'string' && value.startsWith('data:image')) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, 320, 140);
          ctx.drawImage(img, 0, 0);
        };
        img.src = value;
      }
    }
  }, [question.type, value]);

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#17243A';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      onChange(canvasRef.current.toDataURL());
    }
  };

  const handleClearSignature = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, 320, 140);
    }
    onChange(null);
  };

  // Repeating group handlers
  const repeatItems: Record<string, any>[] = Array.isArray(value) ? value : [];
  const handleAddRepeatItem = () => {
    const newItem: Record<string, any> = { _id: `item_${Date.now()}` };
    (question.repeatQuestions || []).forEach(childQ => {
      newItem[childQ.variableName] = '';
    });
    onChange([...repeatItems, newItem]);
  };

  const handleRemoveRepeatItem = (idx: number) => {
    onChange(repeatItems.filter((_, i) => i !== idx));
  };

  const handleUpdateRepeatChild = (itemIdx: number, childVar: string, childVal: any) => {
    const updated = [...repeatItems];
    updated[itemIdx] = { ...updated[itemIdx], [childVar]: childVal };
    onChange(updated);
  };

  return (
    <div className={`p-4 rounded-xl border transition-all space-y-3 ${
      screenout.screenout 
        ? 'bg-red-50 border-red-300 ring-2 ring-red-500/20' 
        : question.type === 'instruction' 
        ? 'bg-blue-50/50 border-blue-200' 
        : 'bg-white border-gray-200 shadow-xs'
    }`}>
      {/* Label & Variable Name Header */}
      <div className="flex items-start justify-between gap-2">
        <label className="text-xs font-bold text-[#17243A] leading-relaxed">
          {index !== undefined && <span className="text-[#C8202F] mr-1.5">Q{index + 1}.</span>}
          {pipedLabel}
          {question.required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
        <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase shrink-0">
          {question.type}
        </span>
      </div>

      {question.hint && (
        <p className="text-[11px] text-gray-500 italic">{question.hint}</p>
      )}

      {/* INPUT RENDERING ACCORDING TO TYPE */}

      {/* 1. Instruction / Note */}
      {question.type === 'instruction' && (
        <div className="flex items-center gap-2 text-xs text-blue-900 bg-blue-100/60 p-3 rounded-lg font-medium">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span>{question.hint || 'Interviewer instruction section'}</span>
        </div>
      )}

      {/* 2. Text */}
      {question.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter respondent answer..."
          className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-[#17243A] focus:bg-white focus:outline-hidden focus:border-[#C8202F]"
        />
      )}

      {/* 3. Textarea / Long Answer */}
      {question.type === 'textarea' && (
        <textarea
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Record verbatim comments..."
          className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-[#17243A] focus:bg-white focus:outline-hidden focus:border-[#C8202F]"
        />
      )}

      {/* 4. Integer & Decimal */}
      {(question.type === 'integer' || question.type === 'decimal') && (
        <input
          type="number"
          step={question.type === 'decimal' ? '0.01' : '1'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          placeholder="Enter numeric value..."
          className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs font-mono text-[#17243A] focus:bg-white focus:outline-hidden focus:border-[#C8202F]"
        />
      )}

      {/* 5. Yes / No */}
      {question.type === 'yes_no' && (
        <div className="grid grid-cols-2 gap-3">
          {['yes', 'no'].map(choice => (
            <button
              key={choice}
              type="button"
              onClick={() => onChange(choice)}
              className={`py-2.5 px-4 text-xs font-bold rounded-xl border capitalize transition-colors flex items-center justify-center gap-1.5 ${
                value === choice
                  ? 'bg-[#17243A] text-white border-[#17243A] shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {value === choice && <Check className="w-3.5 h-3.5" />}
              <span>{choice}</span>
            </button>
          ))}
        </div>
      )}

      {/* 6. Single Choice (Radio) */}
      {question.type === 'select_one' && (
        <div className="space-y-2">
          {(question.options || []).map(opt => (
            <label
              key={opt.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                value === opt.value
                  ? 'bg-red-50/70 border-[#C8202F] font-bold text-[#17243A] shadow-xs'
                  : 'bg-gray-50/50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <input
                type="radio"
                name={question.variableName}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="text-[#C8202F] focus:ring-[#C8202F] w-4 h-4 cursor-pointer"
              />
              <span className="flex-1">{opt.label}</span>
            </label>
          ))}

          {question.allowOther && (
            <div className="pt-1">
              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer ${
                  typeof value === 'object' && value?.isOther
                    ? 'bg-red-50/70 border-[#C8202F]'
                    : 'bg-gray-50/50 border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name={question.variableName}
                  checked={typeof value === 'object' && value?.isOther}
                  onChange={() => onChange({ isOther: true, text: '' })}
                  className="text-[#C8202F] focus:ring-[#C8202F] w-4 h-4"
                />
                <span className="font-medium text-gray-700">Other (Specify below)</span>
              </label>
              {typeof value === 'object' && value?.isOther && (
                <input
                  type="text"
                  placeholder="Specify other answer..."
                  value={value.text || ''}
                  onChange={(e) => onChange({ isOther: true, text: e.target.value })}
                  className="mt-2 w-full p-2 text-xs border border-gray-300 rounded-lg bg-white"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* 7. Multiple Choice (Checkboxes) */}
      {question.type === 'select_multiple' && (
        <div className="space-y-2">
          {(question.options || []).map(opt => {
            const currentSelected: string[] = Array.isArray(value) ? value : [];
            const isChecked = currentSelected.includes(opt.value);
            return (
              <label
                key={opt.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-red-50/70 border-[#C8202F] font-bold text-[#17243A] shadow-xs'
                    : 'bg-gray-50/50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...currentSelected, opt.value]);
                    } else {
                      onChange(currentSelected.filter(v => v !== opt.value));
                    }
                  }}
                  className="rounded text-[#C8202F] focus:ring-[#C8202F] w-4 h-4 cursor-pointer"
                />
                <span className="flex-1">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* 8. Dropdown */}
      {question.type === 'dropdown' && (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-[#17243A] focus:bg-white focus:outline-hidden"
        >
          <option value="">-- Select an option --</option>
          {(question.options || []).map(opt => (
            <option key={opt.id} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {/* 9. NPS 0-10 */}
      {question.type === 'nps' && (
        <div className="space-y-2">
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => i).map(score => {
              const isSelected = value === score;
              const isPromoter = score >= 9;
              const isPassive = score >= 7 && score <= 8;

              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => onChange(score)}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#C8202F] text-white ring-2 ring-red-400 shadow-xs'
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
            <span className="text-rose-700">0 (Not at all likely)</span>
            <span className="text-amber-700">7-8 (Passive)</span>
            <span className="text-emerald-700">10 (Extremely likely)</span>
          </div>
        </div>
      )}

      {/* 10. Rating / Likert */}
      {question.type === 'rating' && (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                value === star
                  ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {star} ★
            </button>
          ))}
        </div>
      )}

      {/* 11. Matrix / Grid */}
      {question.type === 'matrix' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-[#17243A]">
              <tr>
                <th className="p-2 text-left font-bold">Attribute Statement</th>
                {(question.matrixCols || []).map(col => (
                  <th key={col.id} className="p-2 text-center font-bold text-[11px] whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(question.matrixRows || []).map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-2.5 font-medium text-gray-800">{row.label}</td>
                  {(question.matrixCols || []).map(col => (
                    <td key={col.id} className="p-2.5 text-center">
                      <input
                        type="radio"
                        name={`${question.variableName}_${row.id}`}
                        checked={value?.[row.id] === col.value}
                        onChange={() => {
                          const prev = typeof value === 'object' && value ? value : {};
                          onChange({ ...prev, [row.id]: col.value });
                        }}
                        className="text-[#C8202F] focus:ring-[#C8202F] w-4 h-4 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 12. Semantic Differential */}
      {question.type === 'semantic_differential' && (
        <div className="space-y-4">
          {(question.semanticPairs || []).map(pair => {
            const currentScore = value?.[pair.id] ?? 4;
            return (
              <div key={pair.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#17243A]">
                  <span className="text-rose-700">{pair.leftLabel}</span>
                  <span className="text-emerald-700">{pair.rightLabel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={currentScore}
                    onChange={(e) => {
                      const prev = typeof value === 'object' && value ? value : {};
                      onChange({ ...prev, [pair.id]: Number(e.target.value) });
                    }}
                    className="w-full accent-[#C8202F] cursor-pointer"
                  />
                  <span className="w-6 text-center text-xs font-mono font-bold bg-white border border-gray-300 rounded px-1">
                    {currentScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 13. Constant Sum */}
      {question.type === 'constant_sum' && (
        <div className="space-y-3">
          <div className="space-y-2">
            {(question.options || []).map(opt => (
              <div key={opt.id} className="flex items-center justify-between gap-3 text-xs bg-gray-50 p-2 rounded-lg border border-gray-200">
                <span className="font-medium text-gray-800">{opt.label}</span>
                <input
                  type="number"
                  value={value?.[opt.value] ?? ''}
                  onChange={(e) => {
                    const prev = typeof value === 'object' && value ? value : {};
                    onChange({ ...prev, [opt.value]: Number(e.target.value) || 0 });
                  }}
                  className="w-24 p-1.5 border border-gray-300 rounded-lg text-right font-mono bg-white"
                />
              </div>
            ))}
          </div>

          {/* Sum Validator Badge */}
          {(() => {
            const target = question.constantSumTotal || 100;
            const currentSum = Object.values(value || {}).reduce((acc: number, cur: any) => acc + (Number(cur) || 0), 0);
            const isMatch = currentSum === target;

            return (
              <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center justify-between ${
                isMatch ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                <span>Total Allocated: {currentSum} / {target}</span>
                <span>{isMatch ? '✓ Valid Total' : `Remaining: ${target - currentSum}`}</span>
              </div>
            );
          })()}
        </div>
      )}

      {/* 14. Calculation */}
      {question.type === 'calculation' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Auto-Evaluated Field</span>
            <span className="font-mono text-emerald-950 font-semibold">{question.calculationFormula}</span>
          </div>
          <span className="text-sm font-bold font-mono bg-white px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-900 shadow-xs">
            = {LogicEngine.evaluateCalculation(question.calculationFormula || '', allAnswers)}
          </span>
        </div>
      )}

      {/* 15. Signature Pad */}
      {question.type === 'signature' && (
        <div className="space-y-2">
          <div className="border border-gray-300 rounded-xl overflow-hidden bg-white max-w-sm">
            <canvas
              ref={canvasRef}
              width={320}
              height={140}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDraw}
              onMouseUp={handleEndDraw}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDraw}
              onTouchEnd={handleEndDraw}
              className="touch-none w-full bg-white cursor-crosshair"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearSignature}
              className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Signature
            </button>
            {value && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                ✓ Signature Recorded
              </span>
            )}
          </div>
        </div>
      )}

      {/* 16. Repeating Group / Roster Loop */}
      {question.type === 'repeat_group' && (
        <div className="space-y-3 p-3 bg-violet-50/50 border border-violet-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-900">
              Roster Iterations ({repeatItems.length})
            </span>
            <button
              type="button"
              onClick={handleAddRepeatItem}
              className="text-xs font-bold text-violet-700 hover:text-violet-900 bg-white px-3 py-1 rounded-lg border border-violet-300 flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Member / Entry
            </button>
          </div>

          <div className="space-y-3">
            {repeatItems.map((item, itemIdx) => (
              <div key={item._id || itemIdx} className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-xs font-bold text-gray-700">Entry #{itemIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRepeatItem(itemIdx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(question.repeatQuestions || []).map(childQ => (
                    <div key={childQ.id} className="text-xs">
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">{childQ.label}</label>
                      <input
                        type="text"
                        value={item[childQ.variableName] || ''}
                        onChange={(e) => handleUpdateRepeatChild(itemIdx, childQ.variableName, e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 17. GPS Satellite Fix */}
      {question.type === 'gps' && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-3.5 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between font-mono">
            <span className="font-bold flex items-center gap-1.5 text-emerald-800">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>GPS Coordinates: {gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)}</span>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              Accuracy: ±{gpsCoords.accuracy}m
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/60">
            <span>✓ High-Accuracy Satellite Lock Acquired</span>
            <a
              href={`https://maps.google.com/?q=${gpsCoords.lat},${gpsCoords.lng}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-1"
            >
              Verify on Google Maps ↗
            </a>
          </div>
        </div>
      )}

      {/* Screenout Alert Banner if triggered */}
      {screenout.screenout && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">SCREENOUT / TERMINATION CONDITION TRIGGERED:</strong>
            <span>{screenout.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
