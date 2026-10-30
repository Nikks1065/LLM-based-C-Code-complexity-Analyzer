/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Network,
  Layout,
  Server,
  Database,
  Globe,
  Settings,
  ArrowRight,
  FileCode,
} from 'lucide-react';
import { ArchitectureMapData } from '../types/repomind';

interface ArchitectureViewProps {
  architecture: ArchitectureMapData;
  onOpenFileInExplorer: (path: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  architecture,
  onOpenFileInExplorer,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(architecture.nodes[0]?.id || null);

  const filteredNodes = filterType === 'all'
    ? architecture.nodes
    : architecture.nodes.filter(n => n.type === filterType);

  const selectedNode = architecture.nodes.find(n => n.id === selectedNodeId);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'frontend':
        return <Layout className="h-4 w-4 text-indigo-400" />;
      case 'backend':
        return <Server className="h-4 w-4 text-emerald-400" />;
      case 'api':
        return <Globe className="h-4 w-4 text-cyan-400" />;
      case 'database':
        return <Database className="h-4 w-4 text-amber-400" />;
      default:
        return <Settings className="h-4 w-4 text-purple-400" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'frontend':
        return 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300';
      case 'backend':
        return 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
      case 'api':
        return 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300';
      case 'database':
        return 'border-amber-500/40 bg-amber-950/20 text-amber-300';
      default:
        return 'border-purple-500/40 bg-purple-950/20 text-purple-300';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Network className="h-4 w-4" />
          System Architecture & Dependency Map
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Module Topology & Execution Boundaries
        </h1>
        <p className="mt-1 text-sm text-slate-400 leading-relaxed max-w-3xl">
          Visualizes real component interactions, backend domain services, REST/API gateways, and storage boundaries extracted directly from the codebase.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Architectural Blueprint Summary
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {architecture.summary}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3">
            <span className="text-[10px] uppercase font-bold text-indigo-400 block">Frontend UI</span>
            <span className="text-lg font-bold text-white">{architecture.frontendModules.length}</span>
            <span className="text-[10px] text-slate-400 block">components</span>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Backend Core</span>
            <span className="text-lg font-bold text-white">{architecture.backendModules.length}</span>
            <span className="text-[10px] text-slate-400 block">modules</span>
          </div>
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block">API Gateways</span>
            <span className="text-lg font-bold text-white">{architecture.apiRoutes.length}</span>
            <span className="text-[10px] text-slate-400 block">routes</span>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Database / Schema</span>
            <span className="text-lg font-bold text-white">{architecture.databaseFiles.length}</span>
            <span className="text-[10px] text-slate-400 block">files</span>
          </div>
          <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-3">
            <span className="text-[10px] uppercase font-bold text-purple-400 block">Config / Tooling</span>
            <span className="text-lg font-bold text-white">{architecture.configFiles.length}</span>
            <span className="text-[10px] text-slate-400 block">configs</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium mr-1">Filter Layer:</span>
        {['all', 'frontend', 'backend', 'api', 'database', 'config'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filterType === type
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Extracted Architecture Nodes ({filteredNodes.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click a node to inspect details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/30 shadow-md ring-1 ring-indigo-500/50'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getNodeIcon(node.type)}
                      <span className="font-mono text-xs font-bold text-white truncate max-w-[140px]">
                        {node.label}
                      </span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase font-mono ${getNodeColor(node.type)}`}>
                      {node.type}
                    </span>
                  </div>

                  <p className="font-mono text-[11px] text-slate-400 truncate mb-2">
                    {node.path}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>Active in dependency graph</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenFileInExplorer(node.path);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      View &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {architecture.edges.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">
                Data Flow Connections:
              </h4>
              <div className="space-y-1.5">
                {architecture.edges.map((edge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/60"
                  >
                    <span className="text-slate-200">{edge.from}</span>
                    <span className="text-indigo-400 font-semibold px-1 text-[10px] rounded bg-indigo-500/10 border border-indigo-500/20">
                      {edge.label || 'connects'}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-200">{edge.to}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Node Inspector
          </h3>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  {getNodeIcon(selectedNode.type)}
                  <span className="font-mono font-bold text-white text-sm">{selectedNode.label}</span>
                </div>
                <div className="font-mono text-slate-400 text-[11px] break-all">
                  {selectedNode.path}
                </div>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${getNodeColor(selectedNode.type)}`}>
                  Layer: {selectedNode.type}
                </span>
              </div>

              <div className="space-y-2 text-slate-300 leading-relaxed">
                <p>
                  This module participates in the <strong>{selectedNode.type}</strong> subsystem of the application.
                </p>
                <p className="text-slate-400 text-[11px]">
                  All communications into this file are indexed in the RAG vector space and can be queried directly via the AI chat.
                </p>
              </div>

              <button
                onClick={() => onOpenFileInExplorer(selectedNode.path)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
              >
                <FileCode className="h-3.5 w-3.5" />
                Open File in Code Explorer
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Select any node on the left to inspect.</p>
          )}
        </div>
      </div>
    </div>
  );
};
