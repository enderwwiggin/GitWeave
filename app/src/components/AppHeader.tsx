import { useState } from 'react';
import { Search, Bell, Command } from 'lucide-react';
import { teamMembers } from '@/data/mockData';

export default function AppHeader() {
  const [searchFocused, setSearchFocused] = useState(false);
  const displayMembers = teamMembers.filter((m) => m.id !== 'm9'); // exclude 小组协作

  return (
    <header className="glass-header sticky top-0 z-50 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="GitWeave" className="w-8 h-8" />
        <span className="text-lg font-semibold tracking-tight text-[#f4f4f5]">
          GitWeave
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`relative flex items-center transition-all duration-300 ${
            searchFocused ? 'w-80' : 'w-64'
          }`}
        >
          <Search className="absolute left-3 w-4 h-4 text-[#969699]" />
          <input
            type="text"
            placeholder="搜索任务、提交、问题..."
            className="w-full h-9 pl-9 pr-10 rounded bg-[#111113] border border-[#1f1f22] text-sm text-[#f4f4f5] placeholder-[#969699] focus:outline-none focus:border-[#1868d6]/50 transition-colors"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="absolute right-3 flex items-center gap-0.5 text-xs text-[#969699] font-mono">
            <Command className="w-3 h-3" />
            <span>/</span>
          </kbd>
        </div>

        <button className="relative p-2 rounded hover:bg-[#111113] transition-colors">
          <Bell className="w-5 h-5 text-[#969699]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#d7244b]" />
        </button>

        <div className="flex items-center -space-x-2">
          {displayMembers.slice(0, 6).map((member) => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full border-2 border-[#050507] flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: member.color }}
              title={member.name}
            >
              {member.initials}
            </div>
          ))}
          {displayMembers.length > 6 && (
            <div className="w-8 h-8 rounded-full border-2 border-[#050507] bg-[#1f1f22] flex items-center justify-center text-xs text-[#969699] font-mono">
              +{displayMembers.length - 6}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
