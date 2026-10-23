import React from 'react';
import { AuditLog } from '../types';
import { 
  Settings, 
  Shield, 
  Users, 
  Database, 
  Key, 
  History, 
  CheckCircle2, 
  Server
} from 'lucide-react';

interface SettingsViewProps {
  auditLogs: AuditLog[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({ auditLogs }) => {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#17243A]">Enterprise Settings, Roles & Audit Logs</h1>
        <p className="text-xs text-gray-500">Manage user access permissions, ODK Aggregate bridge, and immutable audit trails</p>
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
