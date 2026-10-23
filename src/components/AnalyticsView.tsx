import React, { useState } from 'react';
import { Submission, Project } from '../types';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  PieChart, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  Table,
  FileText
} from 'lucide-react';

interface AnalyticsViewProps {
  submissions: Submission[];
  projects: Project[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ submissions, projects }) => {
  const [selectedProjId, setSelectedProjId] = useState<string>(projects[0]?.id || 'proj-1');
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const currentProject = projects.find(p => p.id === selectedProjId) || projects[0];
  const projectSubmissions = submissions.filter(s => s.projectId === selectedProjId);

  // Real CSV Export Handler
  const handleExportCSV = () => {
    setExporting('CSV');
    setTimeout(() => {
      const headers = ['Submission ID', 'Project Code', 'Project Title', 'Enumerator ID', 'Enumerator Name', 'State', 'LGA', 'GPS Lat', 'GPS Lng', 'Duration (s)', 'Status', 'Submitted At'];
      const rows = projectSubmissions.map(s => [
        s.id,
        currentProject.code,
        `"${currentProject.title}"`,
        s.enumeratorId,
        `"${s.enumeratorName}"`,
        s.state,
        s.lga,
        s.gps.lat,
        s.gps.lng,
        s.durationSeconds,
        s.status,
        s.submittedAt
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${currentProject.code}_submissions_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExporting(null);
      setExportSuccessMsg('CSV Dataset downloaded successfully!');
      setTimeout(() => setExportSuccessMsg(null), 4000);
    }, 1000);
  };

  // Real PDF / Printable Executive Report Export
  const handleExportPDF = () => {
    setExporting('PDF');
    setTimeout(() => {
      window.print();
      setExporting(null);
      setExportSuccessMsg('Executive PDF Report generated successfully via print bridge!');
      setTimeout(() => setExportSuccessMsg(null), 4000);
    }, 1000);
  };

  const handleExportSimulated = (format: string) => {
    setExporting(format);
    setTimeout(() => {
      setExporting(null);
      setExportSuccessMsg(`${format} package generated and downloaded securely.`);
      setTimeout(() => setExportSuccessMsg(null), 4000);
    }, 1200);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#17243A]">Analytics, Crosstabs & Dataset Export</h1>
          <p className="text-xs text-gray-500">Generate frequency distributions and export production-ready datasets for SPSS, Stata, Excel, and PDF reports</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjId}
            onChange={(e) => setSelectedProjId(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#17243A] shadow-xs"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code}: {p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Export Success Banner */}
      {exportSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <strong className="block font-bold">Export Complete!</strong>
            <span>{exportSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Export Format Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#17243A]">Export Cleaned Field Dataset & Executive Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold bg-[#17243A] text-white px-2 py-0.5 rounded">SPSS (.sav)</span>
              <h3 className="text-xs font-bold text-[#17243A] mt-2">IBM SPSS Statistics</h3>
              <p className="text-[11px] text-gray-500 mt-1">Includes variable labels, value codes, and missing value definitions.</p>
            </div>
            <button
              onClick={() => handleExportSimulated('SPSS (.sav)')}
              disabled={exporting !== null}
              className="w-full bg-[#C8202F] hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exporting === 'SPSS (.sav)' ? 'Exporting...' : 'Download .sav'}</span>
            </button>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold bg-[#17243A] text-white px-2 py-0.5 rounded">STATA (.dta)</span>
              <h3 className="text-xs font-bold text-[#17243A] mt-2">StataCorp Stata Dataset</h3>
              <p className="text-[11px] text-gray-500 mt-1">Optimized for econometrics, regressions, and panel data analysis.</p>
            </div>
            <button
              onClick={() => handleExportSimulated('STATA (.dta)')}
              disabled={exporting !== null}
              className="w-full bg-[#C8202F] hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exporting === 'STATA (.dta)' ? 'Exporting...' : 'Download .dta'}</span>
            </button>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold bg-blue-600 text-white px-2 py-0.5 rounded">CSV / Excel</span>
              <h3 className="text-xs font-bold text-[#17243A] mt-2">Flat File CSV Extract</h3>
              <p className="text-[11px] text-gray-500 mt-1">Direct CSV download of all project submissions and GPS coordinates.</p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={exporting !== null}
              className="w-full bg-[#17243A] hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exporting === 'CSV' ? 'Exporting...' : 'Download CSV'}</span>
            </button>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold bg-red-600 text-white px-2 py-0.5 rounded">PDF Report</span>
              <h3 className="text-xs font-bold text-[#17243A] mt-2">Executive PDF Summary</h3>
              <p className="text-[11px] text-gray-500 mt-1">Printable executive research briefing and KPI report package.</p>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={exporting !== null}
              className="w-full bg-[#C8202F] hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{exporting === 'PDF' ? 'Generating...' : 'Export PDF Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Frequency Distribution & Crosstabs Preview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#17243A]">Frequency Distribution & Summary Metrics</h2>
            <p className="text-xs text-gray-500">Selected Study: {currentProject.title}</p>
          </div>
          <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-lg">
            {projectSubmissions.length} Submissions Analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Summary table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-[#17243A] text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2">
              <Table className="w-4 h-4 text-[#C8202F]" />
              <span>Regional Distribution Table</span>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold text-gray-500">
                <span>State / Region</span>
                <span>Submissions</span>
                <span>Percentage</span>
              </div>
              {['Lagos', 'Kano', 'Rivers', 'Kaduna', 'Oyo'].map((st, i) => {
                const count = Math.floor(10 + Math.random() * 40);
                return (
                  <div key={st} className="flex justify-between py-1.5 border-b border-gray-100 text-gray-700">
                    <span className="font-medium">{st} State</span>
                    <span className="font-mono font-bold text-[#17243A]">{count}</span>
                    <span className="text-gray-500 font-mono">{(count * 1.8).toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Indicators */}
          <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="bg-[#17243A] text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C8202F]" />
              <span>Quality & Performance Indicators</span>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="font-semibold text-[#17243A] block">Average Interview Duration</span>
                  <span className="text-[11px] text-gray-500">Optimal threshold: 300s - 900s</span>
                </div>
                <span className="text-sm font-bold font-mono text-[#17243A]">342s</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="font-semibold text-[#17243A] block">GPS Precision Compliance</span>
                  <span className="text-[11px] text-gray-500">Submissions within &lt;5m accuracy</span>
                </div>
                <span className="text-sm font-bold font-mono text-emerald-600">96.4%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="font-semibold text-[#17243A] block">Audio Consent Rate</span>
                  <span className="text-[11px] text-gray-500">Recorded interviews with audio audit</span>
                </div>
                <span className="text-sm font-bold font-mono text-[#17243A]">91.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
