import React, { useState } from 'react';
import { Questionnaire } from '../../types';
import { XLSFormHelper } from '../../services/universalQuestionnaireTemplates';
import { FileCode, X, Upload, Download, Copy, Check, AlertCircle } from 'lucide-react';

interface XlsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestionnaire: Questionnaire;
  onImport: (questionnaire: Questionnaire) => void;
}

export const XlsFormModal: React.FC<XlsFormModalProps> = ({
  isOpen,
  onClose,
  currentQuestionnaire,
  onImport
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importText, setImportText] = useState(`type,name,label,required,relevant,hint
select_one yes_no,eligible_voter,Are you registered to vote in this LGA?,yes,,Must possess valid PVC
integer,respondent_age,How old were you on your last birthday?,yes,,Must be 18 or older
text,primary_concern,What is the most pressing issue in your community?,yes,respondent_age >= 18,
geopoint,poll_location,Capture polling booth location,yes,,Satellite fix
image,pvc_card_photo,Take photo of voter registration card,no,,Watermarked`);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleExecuteImport = () => {
    setErrorMsg(null);
    try {
      const parsed = XLSFormHelper.parseXLSForm(importText, `Imported ${new Date().toLocaleDateString()}`);
      onImport(parsed);
      onClose();
    } catch (e: any) {
      setErrorMsg(`Import failed: ${e.message}`);
    }
  };

  const exportedCSV = XLSFormHelper.exportToXLSFormCSV(currentQuestionnaire);

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportedCSV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([exportedCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentQuestionnaire.title.replace(/\s+/g, '_')}_survey.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#17243A] text-white">
              <FileCode className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">XLSForm (ODK / SurveyCTO) Studio</h3>
              <p className="text-xs text-gray-500">Import or export standard CSV/TSV survey sheets with logic and constraints</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-3 bg-white border-b border-gray-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              activeTab === 'import' ? 'bg-[#17243A] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import from XLSForm CSV / TSV</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              activeTab === 'export' ? 'bg-[#17243A] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export XLSForm CSV</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'import' ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Paste tabular data containing headers: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">type, name, label, required, relevant, hint</code>. Compatible with KoboToolbox, ODK Collect, and SurveyCTO.
              </p>
              <textarea
                rows={10}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full text-xs p-3 font-mono border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Generated XLSForm standard CSV representation:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyExport}
                    className="text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadFile}
                    className="text-xs font-semibold text-white bg-[#C8202F] hover:bg-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .CSV</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={10}
                readOnly
                value={exportedCSV}
                className="w-full text-xs p-3 font-mono border border-gray-300 rounded-xl bg-gray-50 text-gray-700 focus:outline-hidden"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-white"
          >
            Close
          </button>
          {activeTab === 'import' && (
            <button
              type="button"
              onClick={handleExecuteImport}
              className="px-5 py-2 bg-[#C8202F] hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import Questions to Builder</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
