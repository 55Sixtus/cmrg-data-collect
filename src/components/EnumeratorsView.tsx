import React, { useState } from 'react';
import { Enumerator } from '../types';
import { 
  Users, 
  Smartphone, 
  Battery, 
  MapPin, 
  Search, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  Star,
  X
} from 'lucide-react';

interface EnumeratorsViewProps {
  enumerators: Enumerator[];
}

export const EnumeratorsView: React.FC<EnumeratorsViewProps> = ({ enumerators }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [selectedEnum, setSelectedEnum] = useState<Enumerator | null>(null);
  const [dispatchMsg, setDispatchMsg] = useState('');
  const [dispatchSent, setDispatchSent] = useState(false);

  const filteredEnumerators = enumerators.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = zoneFilter === 'All' || e.zone === zoneFilter;
    return matchesSearch && matchesZone;
  });

  const handleSendDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchMsg) return;
    setDispatchSent(true);
    setTimeout(() => {
      setDispatchSent(false);
      setDispatchMsg('');
      setSelectedEnum(null);
    }, 1500);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#17243A]">Field Enumerator Roster & Device Telemetry</h1>
          <p className="text-xs text-gray-500">Monitor Android device status, battery levels, sync timestamps, and regional performance</p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'South-West', 'North-West', 'North-Central', 'South-South'].map(zone => (
            <button
              key={zone}
              onClick={() => setZoneFilter(zone)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                zoneFilter === zone
                  ? 'bg-[#17243A] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {zone}
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
            placeholder="Search enumerators by name, state, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-[#1B2430] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8202F]/20 focus:border-[#C8202F]"
          />
        </div>
      </div>

      {/* Enumerators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEnumerators.map((enu) => (
          <div key={enu.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold bg-[#17243A] text-white px-2.5 py-1 rounded-md">
                  {enu.id}
                </span>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                  enu.status === 'Active in Field' ? 'bg-emerald-100 text-emerald-800' :
                  enu.status === 'Offline' ? 'bg-red-100 text-[#C8202F]' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {enu.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#17243A]">{enu.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C8202F]" />
                {enu.state} ({enu.zone} Zone)
              </p>

              <div className="mt-4 space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200/60 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    Device Model:
                  </span>
                  <span className="font-semibold text-[#17243A]">{enu.deviceModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-600" />
                    Battery Level:
                  </span>
                  <span className="font-semibold text-[#17243A]">{enu.batteryLevel}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Completed Today:</span>
                  <span className="font-bold text-[#C8202F]">{enu.completedToday} interviews</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{enu.rating}</span>
              </div>
              <button
                onClick={() => setSelectedEnum(enu)}
                className="bg-[#C8202F] hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-xs"
              >
                Dispatch Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Message Modal */}
      {selectedEnum && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-[10px] font-mono bg-[#17243A] text-white px-2 py-0.5 rounded">{selectedEnum.id}</span>
                <h2 className="text-base font-bold text-[#17243A] mt-1">Dispatch Instructions to {selectedEnum.name}</h2>
              </div>
              <button onClick={() => setSelectedEnum(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {dispatchSent ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#17243A]">Dispatch Sent via Push / SMS!</h3>
                <p className="text-xs text-gray-500">Enumerator tablet notified successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSendDispatch} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Instruction Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g., Please proceed to Alaba Market Sector 4 for quota re-balancing..."
                    value={dispatchMsg}
                    onChange={(e) => setDispatchMsg(e.target.value)}
                    className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg p-3 text-[#1B2430]"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setSelectedEnum(null)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#C8202F] hover:bg-red-700 text-white font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Dispatch</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
