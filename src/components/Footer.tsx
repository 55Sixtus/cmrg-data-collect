import React from 'react';
import { Code2, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#17243A] text-white py-3 px-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs gap-2 shrink-0 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#C8202F]"></span>
        <span className="font-semibold text-gray-300">CMRG Data Collect Enterprise v4.8</span>
        <span className="hidden md:inline text-gray-500">•</span>
        <span className="hidden md:inline text-gray-400">Communication and Marketing Research Group Ltd.</span>
      </div>

      <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg border border-white/10">
        <Code2 className="w-3.5 h-3.5 text-[#C8202F]" />
        <span className="font-extrabold uppercase tracking-wide text-white">SIXTUS TECH HUB</span>
        <span className="text-[#C8202F] font-bold">•</span>
        <span className="font-mono font-bold text-emerald-400">08120678052</span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-300 font-bold uppercase text-[10px]">APP DEVELOPER</span>
      </div>
    </footer>
  );
};
