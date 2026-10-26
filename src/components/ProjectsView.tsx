import React, { useState } from 'react';
import { Project } from '../types';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  X, 
  ChevronRight,
  ShieldCheck,
  QrCode
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onAddProject: (newProj: Project) => void;
  onSelectProjectForSimulator: (projId: string) => void;
  onOpenWhatsAppConnect?: (projectCode?: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ 
  projects, 
  onAddProject, 
  onSelectProjectForSimulator,
  onOpenWhatsAppConnect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New project form state
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('CMRG-NEW-2026');
  const [newClient, setNewClient] = useState('');
  const [newSector, setNewSector] = useState<'FMCG' | 'Public Opinion' | 'Agriculture' | 'Healthcare' | 'Financial Services' | 'Energy'>('FMCG');
  const [newTarget, setNewTarget] = useState(1000);
  const [newDesc, setNewDesc] = useState('');

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'All' || p.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClient) return;

    const created: Project = {
      id: `proj-${Date.now()}`,
      code: newCode,
      title: newTitle,
      client: newClient,
      sector: newSector,
      status: 'Draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      targetInterviews: Number(newTarget),
      completedInterviews: 0,
      rejectedInterviews: 0,
      regions: ['Lagos', 'Abuja', 'Kano'],
      assignedEnumeratorsCount: 0,
      questionnaireId: 'quest-1',
      description: newDesc || 'Newly created field research study.'
    };

    onAddProject(created);
    setShowCreateModal(false);
    setNewTitle('');
    setNewClient('');
    setNewDesc('');
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#17243A]">Field Studies & Research Projects</h1>
          <p className="text-xs text-gray-500">Manage ODK questionnaire forms, sampling quotas, and multi-state deployment</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#C8202F] hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Research Study</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects or codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-[#1B2430] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8202F]/20 focus:border-[#C8202F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'FMCG', 'Public Opinion', 'Healthcare', 'Financial Services'].map(sector => (
            <button
              key={sector}
              onClick={() => setSectorFilter(sector)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                sectorFilter === sector
                  ? 'bg-[#17243A] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => {
          const pct = Math.round((proj.completedInterviews / proj.targetInterviews) * 100);
          return (
            <div 
              key={proj.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold bg-gray-100 text-[#17243A] px-2.5 py-1 rounded-md">
                    {proj.code}
                  </span>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                    proj.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                    proj.status === 'Paused' ? 'bg-amber-100 text-amber-800' :
                    proj.status === 'Draft' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#17243A] group-hover:text-[#C8202F] transition-colors line-clamp-2">
                  {proj.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{proj.client}</p>
                <p className="text-[11px] text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-500">Quota Target</span>
                    <span className="text-[#17243A]">{proj.completedInterviews.toLocaleString()} / {proj.targetInterviews.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#C8202F] h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {proj.assignedEnumeratorsCount} enumerators
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C8202F]" />
                    {proj.regions.length} states
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {onOpenWhatsAppConnect && (
                    <button
                      onClick={() => onOpenWhatsAppConnect(proj.code)}
                      className="bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold px-2.5 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                      title="WhatsApp-Style Scan & Connect"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      QR Connect
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-[#17243A] border border-gray-200 text-xs font-semibold py-2 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onSelectProjectForSimulator(proj.id)}
                    className="bg-[#C8202F] hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-xs"
                    title="Test Drive Survey"
                  >
                    Test Drive
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold bg-[#17243A] text-white px-2 py-0.5 rounded">{selectedProject.code}</span>
                <h2 className="text-lg font-bold text-[#17243A] mt-1">{selectedProject.title}</h2>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-500 block">Client Organization</span>
                  <strong className="text-[#17243A] text-sm">{selectedProject.client}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Sector</span>
                  <strong className="text-[#17243A] text-sm">{selectedProject.sector}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Fieldwork Window</span>
                  <strong className="text-[#17243A]">{selectedProject.startDate} to {selectedProject.endDate}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Rejected / Flagged Submissions</span>
                  <strong className="text-[#C8202F]">{selectedProject.rejectedInterviews} audits failed</strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#17243A] text-sm mb-1">Study Description & Methodology</h4>
                <p className="text-gray-600 leading-relaxed">{selectedProject.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#17243A] text-sm mb-2">Target Geopolitical Regions & States</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.regions.map((reg, idx) => (
                    <span key={idx} className="bg-red-50 text-[#C8202F] border border-red-200 px-3 py-1 rounded-lg font-semibold text-xs flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {reg}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
              {onOpenWhatsAppConnect && (
                <button
                  onClick={() => {
                    const code = selectedProject.code;
                    setSelectedProject(null);
                    onOpenWhatsAppConnect(code);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  WhatsApp QR Link Device
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const id = selectedProject.id;
                    setSelectedProject(null);
                    onSelectProjectForSimulator(id);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#C8202F] hover:bg-red-700 text-white font-semibold text-xs shadow-xs"
                >
                  Launch Questionnaire Test Drive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-base font-bold text-[#17243A]">Initialize New Field Research Project</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., National Telecommunication Quality of Service Audit"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Project Code</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sector</label>
                  <select
                    value={newSector}
                    onChange={(e: any) => setNewSector(e.target.value)}
                    className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
                  >
                    <option value="FMCG">FMCG & Retail</option>
                    <option value="Public Opinion">Public Opinion & Governance</option>
                    <option value="Healthcare">Healthcare & Pharma</option>
                    <option value="Financial Services">Financial Services & FinTech</option>
                    <option value="Agriculture">Agriculture & Agribusiness</option>
                    <option value="Energy">Energy & Utilities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Client / Funding Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Nigerian Communications Commission (NCC)"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Sample Size (Interviews)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={newTarget}
                  onChange={(e) => setNewTarget(Number(e.target.value))}
                  className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Methodology & Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe sample design, sampling frames, and GPS tracking requirements..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-2.5 text-[#1B2430]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C8202F] hover:bg-red-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Create Study
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
