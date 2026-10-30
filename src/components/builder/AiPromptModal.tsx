import React, { useState } from 'react';
import { Questionnaire } from '../../types';
import { StudyPromptGenerator } from '../../services/universalQuestionnaireTemplates';
import { Sliders, X, FileText, Lightbulb, Check, Loader2 } from 'lucide-react';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (questionnaire: Questionnaire) => void;
}

export const AiPromptModal: React.FC<AiPromptModalProps> = ({
  isOpen,
  onClose,
  onGenerated
}) => {
  const [prompt, setPrompt] = useState('');
  const [discipline, setDiscipline] = useState('Commercial Market Research & FMCG');
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const samplePrompts = [
    'Brand awareness, beverage pantry stock check, price sensitivity, and fridge photo verification in Lagos open markets',
    'Customer effort score, NPS 0-10, and multi-touchpoint satisfaction matrix for commercial bank mobile app',
    'Lagos metropolitan household roster, dwelling structure, generator fuel spend, and DisCo power reliability survey',
    'Primary healthcare clinic capacity, child immunization card verification, and malnutrition screening with BMI calculation',
    'Smallholder farmer plot size in acres, cassava and maize harvest yield allocation, and market gate selling prices'
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);

    setTimeout(() => {
      const generated = StudyPromptGenerator.generateFromBrief(prompt, discipline);
      setGenerating(false);
      onGenerated(generated);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-50/50 via-white to-gray-50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#C8202F] text-white shadow-xs">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">Smart Study Prompt Generator</h3>
              <p className="text-xs text-gray-500">Describe your research goals and generate a full questionnaire with logic and validation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Select Primary Research Discipline
            </label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full text-xs p-2.5 border border-gray-300 rounded-xl bg-white font-medium focus:ring-1 focus:ring-[#C8202F] focus:outline-hidden"
            >
              <option value="Commercial Market Research & FMCG">Commercial Market Research & FMCG</option>
              <option value="Customer Experience (CX) & NPS">Customer Experience (CX) & NPS</option>
              <option value="Household Socio-Economic & Demographics">Household Socio-Economic & Demographics (NDPR)</option>
              <option value="Public Health & Clinical Epidemiology">Public Health & Clinical Epidemiology</option>
              <option value="Agriculture & Smallholder Farmer Monitoring">Agriculture & Smallholder Farmer Monitoring</option>
              <option value="Retail Audit, Mystery Shopping & Distribution Check">Retail Audit, Mystery Shopping & Distribution Check</option>
              <option value="Public Opinion & Political Sentiment">Public Opinion & Political Sentiment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Research Objective & Fieldwork Brief
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Conduct a price audit and brand recall study of staple foods in Alaba and Balogun markets. Include spontaneous brand awareness, photo proof, price NGN, and GPS fix..."
              className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#C8202F] focus:outline-hidden"
            />
          </div>

          {/* Quick Prompt Ideas */}
          <div>
            <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Or try these pre-formulated study prompts:
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="w-full text-left text-[11px] p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!prompt.trim() || generating}
            onClick={handleGenerate}
            className="px-5 py-2 bg-[#C8202F] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Schema...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generate Universal Questionnaire</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
