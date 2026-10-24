import React, { useState } from 'react';
import { AuditLog } from '../types';
import { perfMonitor } from '../services/performanceMonitor';
import { 
  Settings, 
  Shield, 
  Users, 
  Database, 
  Key, 
  History, 
  Activity,
  Zap,
  CheckCircle2, 
  Server,
  Rocket,
  Cloud,
  Lock
} from 'lucide-react';

interface SettingsViewProps {
  auditLogs: AuditLog[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({ auditLogs }) => {
  const [avgLatency, setAvgLatency] = useState(perfMonitor.getAverageLatency());
  const [records, setRecords] = useState(perfMonitor.getRecords());

  const handleRefreshMetrics = () => {
    setAvgLatency(perfMonitor.getAverageLatency());
    setRecords(perfMonitor.getRecords());
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#17243A]">Enterprise Settings, Roles & System Health</h1>
        <p className="text-xs text-gray-500">Manage user access permissions, ODK Aggregate bridge, and real-time performance telemetry</p>
      </div>

      {/* NEW: System Health & Performance Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#C8202F]" />
            <h2 className="text-sm font-bold text-[#17243A]">System Health & DataService Performance API</h2>
          </div>
          <button
            onClick={handleRefreshMetrics}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-[#C8202F]" />
            <span>Refresh Metrics</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Average Response Time</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#17243A]">{avgLatency}</span>
              <span className="text-xs text-gray-500">ms</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Optimal Performance (&lt;50ms)</span>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Tracked API Calls</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#17243A]">{records.length}</span>
              <span className="text-xs text-gray-500">requests</span>
            </div>
            <span className="text-[10px] text-blue-600 font-semibold block mt-1">Performance API Active</span>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Database Status</span>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-[#17243A]">Supabase Cloud (99.9%)</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Project: kmwzmyupvqjitugpckzp</span>
          </div>
        </div>

        {/* Latency Log Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
          <div className="bg-[#17243A] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between">
            <span>Recent DataService Latency Log (Performance API)</span>
            <span className="text-[10px] text-gray-300 font-mono">Max 50 Records</span>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 text-xs">
            {records.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No telemetry records yet. Try switching tabs or refreshing data.</div>
            ) : (
              records.map((r, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                  <span className="font-mono font-semibold text-[#17243A]">{r.operation}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-gray-600">{r.durationMs} ms</span>
                    <span className="text-gray-400 text-[11px] font-mono">{r.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Organization Profile */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#17243A]">Organization Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Company Legal Name</label>
            <input
              type="text"
              disabled
              value="Communication and Marketing Research Group Limited (CMRG Ltd.)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Headquarters</label>
            <input
              type="text"
              disabled
              value="Victoria Island, Lagos State, Nigeria"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Platform Edition</label>
            <input
              type="text"
              disabled
              value="CMRG Data Collect Enterprise v4.8 (ODK/SurveyCTO Compatible)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Data Storage & Encryption</label>
            <input
              type="text"
              disabled
              value="AES-256 Cloud SQL PostgreSQL with Automated Geo-Redundancy"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Cloud Deployment & Retention Policy Architecture */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#C8202F]" />
            <h2 className="text-sm font-bold text-[#17243A]">Cloud Deployment & Retention Policy Architecture</h2>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            Production Retention Locked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="font-semibold text-gray-500 text-[11px] block">Production URL</span>
            <span className="font-mono font-bold text-[#17243A] block mt-0.5">cmrg-data-collect.vercel.app</span>
            <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Vercel Build Cache Active</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="font-semibold text-gray-500 text-[11px] block">Vercel Deployment Retention</span>
            <span className="font-mono font-bold text-[#17243A] block mt-0.5">Prod: Unlimited / Preview: 30d</span>
            <span className="text-[10px] text-blue-600 font-medium mt-1 block">Rollback Snapshots Preserved</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="font-semibold text-gray-500 text-[11px] block">Regulatory Retention Standard</span>
            <span className="font-mono font-bold text-[#17243A] block mt-0.5">NDPR & GDPR Art. 5(1)(e)</span>
            <span className="text-[10px] text-purple-600 font-medium mt-1 block">Automated Archival Daemon</span>
          </div>
        </div>
      </div>

      {/* Role & Permission Matrix */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#17243A]">Role-Based Access Control (RBAC) Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#17243A] text-white uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Role Designation</th>
                <th className="p-3">Questionnaire Design</th>
                <th className="p-3">Field Deployment</th>
                <th className="p-3">Data Quality Review</th>
                <th className="p-3">Dataset Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="p-3 font-bold text-[#17243A]">Research Director / Admin</td>
                <td className="p-3 text-emerald-600 font-semibold">Full Control</td>
                <td className="p-3 text-emerald-600 font-semibold">Full Control</td>
                <td className="p-3 text-emerald-600 font-semibold">Full Control</td>
                <td className="p-3 text-emerald-600 font-semibold">Full Control</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-3 font-bold text-[#17243A]">Field Supervisor</td>
                <td className="p-3 text-amber-600">View Only</td>
                <td className="p-3 text-emerald-600 font-semibold">Manage Zone</td>
                <td className="p-3 text-emerald-600 font-semibold">Approve / Reject</td>
                <td className="p-3 text-amber-600">CSV Only</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-3 font-bold text-[#17243A]">Data Analyst</td>
                <td className="p-3 text-gray-400">No Access</td>
                <td className="p-3 text-gray-400">No Access</td>
                <td className="p-3 text-gray-400">No Access</td>
                <td className="p-3 text-emerald-600 font-semibold">Full Export</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-3 font-bold text-[#17243A]">Field Enumerator</td>
                <td className="p-3 text-gray-400">No Access</td>
                <td className="p-3 text-emerald-600 font-semibold">Tablet Sync Only</td>
                <td className="p-3 text-gray-400">No Access</td>
                <td className="p-3 text-gray-400">No Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Logs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#17243A]">Immutable System Audit Trail</h2>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <History className="w-3.5 h-3.5 text-[#C8202F]" />
            Encrypted Log Registry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-500">{log.timestamp}</td>
                  <td className="p-3 font-semibold text-[#17243A]">{log.user}</td>
                  <td className="p-3 text-[#C8202F] font-semibold">{log.action}</td>
                  <td className="p-3 text-gray-700">{log.details}</td>
                  <td className="p-3 text-gray-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
