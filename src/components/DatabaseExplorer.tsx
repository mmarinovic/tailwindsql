'use client';

/**
 * TailwindSQL Database Explorer
 * 
 * A DBeaver-like interface for exploring database tables.
 */

import { useState, useEffect } from 'react';

interface TableInfo {
  name: string;
  columns: { name: string; type: string }[];
  rowCount: number;
  data: Record<string, unknown>[];
}

interface SchemaData {
  tables: TableInfo[];
}

export function DatabaseExplorer() {
  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [activeTable, setActiveTable] = useState<string>('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchema() {
      try {
        const response = await fetch('/api/schema');
        const data = await response.json();
        setSchema(data);
        if (data.tables?.length > 0) {
          setActiveTable(data.tables[0].name);
        }
      } catch (error) {
        console.error('Failed to fetch schema:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSchema();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="text-red-400 text-center py-8">
        Failed to load database schema
      </div>
    );
  }

  const currentTable = schema.tables.find(t => t.name === activeTable);

  return (
    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 min-h-[400px] sm:min-h-[500px]">
      {/* Sidebar - Table List */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-slate-300">Tables</span>
            </div>
          </div>
          <div className="p-2">
            {schema.tables.map((table) => (
              <button
                key={table.name}
                onClick={() => setActiveTable(table.name)}
                className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-mono transition-all flex items-center justify-between group ${
                  activeTable === table.name
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-300 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-1.5 sm:gap-2 truncate">
                  <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{table.name}</span>
                </span>
                <span className="text-xs opacity-60 ml-2 flex-shrink-0">{table.rowCount}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {currentTable && (
          <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden h-full flex flex-col">
            {/* Table Header */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-base sm:text-lg font-semibold text-white">{currentTable.name}</span>
                <span className="text-xs text-slate-500 bg-white/10 px-2 py-1 rounded-full">
                  {currentTable.rowCount} rows
                </span>
              </div>
              <code className="text-xs text-purple-400 bg-black/40 px-2 py-1 rounded font-mono break-all">
                db-{currentTable.name}
              </code>
            </div>

            {/* Column Schema */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {currentTable.columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1"
                  >
                    <span className="text-cyan-400 font-mono">{col.name}</span>
                    <span className="text-slate-500">:</span>
                    <span className="text-orange-400 font-mono">{col.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 -mx-2 sm:mx-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs sm:text-sm min-w-[600px]">
                  <thead className="sticky top-0">
                    <tr className="bg-slate-900">
                      {currentTable.columns.map((col) => (
                        <th
                          key={col.name}
                          className="border border-white/10 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-cyan-400 bg-white/5 whitespace-nowrap"
                        >
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTable.data.map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        {currentTable.columns.map((col) => (
                          <td
                            key={col.name}
                            className="border border-white/10 px-2 sm:px-3 py-1.5 sm:py-2 text-slate-300 font-mono text-xs break-words max-w-[150px] sm:max-w-none"
                          >
                            {formatValue(row[col.name])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 sm:px-4 py-2 border-t border-white/10 bg-white/[0.02] text-xs text-slate-500">
              Showing {currentTable.data.length} of {currentTable.rowCount} rows
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  const str = String(value);
  if (str.length > 50) {
    return str.slice(0, 47) + '...';
  }
  return str;
}

export default DatabaseExplorer;

