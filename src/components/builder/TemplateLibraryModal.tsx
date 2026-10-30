import React, { useState } from 'react';
import { Questionnaire } from '../../types';
import { UNIVERSAL_DISCIPLINE_TEMPLATES, DisciplineTemplate } from '../../services/universalQuestionnaireTemplates';
import { 
  X, 
  Layers, 
  ShoppingBag, 
  Smile, 
  Home, 
  Activity, 
  Trees, 
  Store, 
  Check, 
  FileText, 
  ArrowRight
} from 'lucide-react';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Questionnaire) => void;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTemplate, setActiveTemplate] = useState<DisciplineTemplate>(UNIVERSAL_DISCIPLINE_TEMPLATES[0]);

  if (!isOpen) return null;

  const categories = ['All', 'Market Research', 'Customer Experience', 'Demographics & Census', 'Healthcare & Public Health', 'Agriculture & Food Security', 'Retail & Distribution'];

  const filteredTemplates = selectedCategory === 'All'
    ? UNIVERSAL_DISCIPLINE_TEMPLATES
    : UNIVERSAL_DISCIPLINE_TEMPLATES.filter(t => t.category === selectedCategory);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-[#C8202F]" />;
      case 'Smile': return <Smile className="w-5 h-5 text-purple-600" />;
      case 'Home': return <Home className="w-5 h-5 text-blue-600" />;
      case 'Activity': return <Activity className="w-5 h-5 text-emerald-600" />;
      case 'Trees': return <Trees className="w-5 h-5 text-amber-600" />;
      case 'Store': return <Store className="w-5 h-5 text-rose-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#C8202F]/10 text-[#C8202F]">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-[#17243A]">Universal Research Discipline Library</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Select a standardized study template across commercial FMCG, CX/NPS, Public Health, Agriculture, or Census
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="p-3 bg-white border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                selectedCategory === cat ? 'bg-[#17243A] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Split: Left Template Cards, Right Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Templates List */}
          <div className="w-full md:w-1/2 p-4 overflow-y-auto space-y-3 border-r border-gray-200 bg-gray-50/40">
            {filteredTemplates.map(t => (
              <div
                key={t.id}
                onClick={() => setActiveTemplate(t)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  activeTemplate.id === t.id
                    ? 'border-[#C8202F] bg-white shadow-md ring-1 ring-[#C8202F]/15'
                    : 'border-gray-200 bg-white hover:border-gray-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl shrink-0">
                    {getIcon(t.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{t.category}</span>
                      <span className="text-[10px] font-bold text-gray-400">{t.questionnaire.questions.length} questions</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#17243A] mt-0.5">{t.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Template Details & Questions Preview */}
          <div className="w-full md:w-1/2 p-5 overflow-y-auto space-y-4 bg-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#C8202F] uppercase tracking-wider">{activeTemplate.discipline}</span>
                  <h3 className="text-sm font-bold text-[#17243A] mt-0.5">{activeTemplate.title}</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                  v{activeTemplate.questionnaire.version}
                </span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-gray-700 mb-2">Included Questions & Logic:</h5>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activeTemplate.questionnaire.questions.map((q, idx) => (
                    <div key={q.id} className="p-2.5 rounded-lg border border-gray-100 bg-gray-50 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#17243A]">Q{idx + 1}: {q.label}</span>
                        <span className="text-[10px] font-mono text-gray-500 uppercase">{q.type}</span>
                      </div>
                      {q.relevantCondition && (
                        <div className="text-[10px] text-amber-700 font-mono mt-1">
                          ↳ Logic: {q.relevantCondition}
                        </div>
                      )}
                      {q.screenoutCondition && (
                        <div className="text-[10px] text-red-700 font-mono mt-1">
                          ↳ Disqualification screenout: {q.screenoutCondition}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTemplate(activeTemplate.questionnaire);
                  onClose();
                }}
                className="px-5 py-2 bg-[#C8202F] hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Load This Template</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
