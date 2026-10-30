/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  SearchCode,
  FolderGit2,
  MessageSquareCode,
  Network,
  Gauge,
  ShieldAlert,
  Boxes,
  FileText,
  Compass,
  GitPullRequest,
  CheckCircle2,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'analyzer'
  | 'explorer'
  | 'chat'
  | 'architecture'
  | 'complexity'
  | 'review'
  | 'dependencies'
  | 'docs'
  | 'onboarding'
  | 'git';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  indexedFilesCount: number;
  findingsCount: number;
  complexityAlerts: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  indexedFilesCount,
  findingsCount,
  complexityAlerts,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string | number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Repository Analyzer', icon: SearchCode, badge: indexedFilesCount > 0 ? `${indexedFilesCount} files` : undefined },
    { id: 'explorer', label: 'Code Explorer', icon: FolderGit2 },
    { id: 'chat', label: 'AI Repository Chat', icon: MessageSquareCode, badge: 'RAG' },
    { id: 'architecture', label: 'Architecture Map', icon: Network },
    { id: 'complexity', label: 'Code Quality', icon: Gauge, badge: complexityAlerts > 0 ? complexityAlerts : undefined, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'review', label: 'AI Code Review', icon: ShieldAlert, badge: findingsCount > 0 ? findingsCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { id: 'dependencies', label: 'Dependency Analysis', icon: Boxes },
    { id: 'docs', label: 'Documentation', icon: FileText },
    { id: 'onboarding', label: 'Developer Onboarding', icon: Compass, badge: '10-Step' },
    { id: 'git', label: 'Git & Push Guide', icon: GitPullRequest },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/90 flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Repository Intelligence
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Static Engine
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">AST Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Grounding answers in actual AST-parsed code with strict untrusted data isolation.
        </p>
      </div>
    </aside>
  );
};
