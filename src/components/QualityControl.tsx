import React, { useState } from 'react';
import { Submission } from '../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  MapPin, 
  Clock, 
  Volume2, 
  Eye, 
  Check, 
  X,
  FileText,
  WifiOff,
  Database
} from 'lucide-react';

interface QualityControlProps {
  submissions: Submission[];
  onUpdateSubmissionStatus: (subId: string, newStatus: 'Approved' | 'Flagged' | 'Rejected', reason?: string) => void;
}

export const QualityControl: React.FC<QualityControlProps> = ({ submissions, onUpdateSubmissionStatus }) => {
  const [filter, setFilter] = useState<'All' | 'Flagged' | 'Approved' | 'Pending' | 'Rejected'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const filteredSubmissions = submissions.filter(s => {
    const matchesFilter = filter === 'All' || s.status === filter;
    const matchesSearch = s.enumeratorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.state.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#17243A]">Data Quality Control & Audit Queue</h1>
          <p className="text-xs text-gray-500">Automated fraud detection (speeders, GPS outliers) and supervisor review workflow</p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Flagged', 'Pending', 'Approved', 'Rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-[#17243A] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f}
              {f === 'Flagged' && submissions.filter(s => s.status === 'Flagged').length > 0 && (
                <span className="ml-1.5 bg-[#C8202F] text-white px-1.5 py-0.2 rounded-full text-[10px]">
                  {submissions.filter(s => s.status === 'Flagged').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by enumerator name, project title, or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-[#1B2430] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8202F]/20 focus:border-[#C8202F]"
          />
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#17243A] text-white uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">ID / Date</th>
                <th className="p-3.5">Project</th>
                <th className="p-3.5">Enumerator</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Audit Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubmissions.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3.5 font-mono font-semibold text-[#17243A]">
                    <div className="flex items-center gap-1.5">
                      <span>{sub.id}</span>
                      {sub.is_offline && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                          <WifiOff className="w-2.5 h-2.5 text-amber-700" />
                          Offline
                        </span>
                      )}
                    </div>
                    <span className="block text-[10px] text-gray-400 font-normal">{sub.submittedAt}</span>
                  </td>
                  <td className="p-3.5 font-medium text-gray-800 max-w-xs truncate">{sub.projectTitle}</td>
                  <td className="p-3.5 font-semibold text-[#17243A]">{sub.enumeratorName} <span className="text-[10px] text-gray-400 block font-normal">{sub.enumeratorId}</span></td>
                  <td className="p-3.5 text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C8202F]" />
                      {sub.state}, {sub.lga}
                    </span>
                  </td>
                  <td className="p-3.5 text-gray-600">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {sub.durationSeconds}s
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      sub.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      sub.status === 'Flagged' ? 'bg-amber-100 text-amber-800' :
                      sub.status === 'Rejected' ? 'bg-red-100 text-[#C8202F]' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {sub.status === 'Flagged' && <AlertTriangle className="w-3 h-3" />}
                      {sub.status}
                    </span>
                    {sub.flagReason && (
                      <span className="text-[10px] text-amber-600 block mt-0.5 truncate max-w-xs">{sub.flagReason}</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => setSelectedSub(sub)}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors inline-flex items-center gap-1"
                      title="Inspect Submission Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    {sub.status !== 'Approved' && (
                      <button
                        onClick={() => onUpdateSubmissionStatus(sub.id, 'Approved')}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Approve Submission"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {sub.status !== 'Rejected' && (
                      <button
                        onClick={() => onUpdateSubmissionStatus(sub.id, 'Rejected', 'Manual supervisor rejection')}
                        className="p-1.5 bg-[#C8202F] hover:bg-red-700 text-white rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Reject Submission"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold bg-[#17243A] text-white px-2 py-0.5 rounded">Submission ID: {selectedSub.id}</span>
                <h2 className="text-lg font-bold text-[#17243A] mt-1">{selectedSub.projectTitle}</h2>
              </div>
              <button onClick={() => setSelectedSub(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-500 block">Enumerator</span>
                  <strong className="text-[#17243A] text-sm">{selectedSub.enumeratorName} ({selectedSub.enumeratorId})</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">GPS Coordinates & Accuracy</span>
                  <strong className="text-[#17243A] font-mono">Lat: {selectedSub.gps.lat}, Lng: {selectedSub.gps.lng} (±{selectedSub.gps.accuracy}m)</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Interview Duration</span>
                  <strong className="text-[#17243A]">{selectedSub.durationSeconds} seconds</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Storage & Data Channel</span>
                  <strong className="text-[#17243A] flex items-center gap-1.5 mt-0.5">
                    {selectedSub.is_offline ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        <WifiOff className="w-3 h-3" /> IndexedDB Offline Queue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Live Synced (Supabase)
                      </span>
                    )}
                  </strong>
                </div>
              </div>

              {selectedSub.flagReason && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Flag Reason</strong>
                    <span className="text-[11px]">{selectedSub.flagReason}</span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold text-[#17243A] text-sm mb-3">Survey Answers Payload</h4>
                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {Object.entries(selectedSub.answers).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-gray-200/60 last:border-0">
                      <span className="font-mono text-gray-500">{key}:</span>
                      <span className="font-semibold text-[#17243A] text-right">
                        {typeof val === 'string' && val.startsWith('http') ? (
                          <a href={val} target="_blank" rel="noreferrer" className="text-[#C8202F] underline">View Media Attachment</a>
                        ) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-xs"
              >
                Close
              </button>
              {selectedSub.status !== 'Approved' && (
                <button
                  onClick={() => {
                    onUpdateSubmissionStatus(selectedSub.id, 'Approved');
                    setSelectedSub(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                >
                  Approve Submission
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
