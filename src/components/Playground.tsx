'use client';

/**
 * TailwindSQL Interactive Playground
 * 
 * A client component that lets users experiment with TailwindSQL queries in real-time.
 * Now with JOIN support!
 */

import { useState, useEffect, useCallback } from 'react';

interface QueryResult {
  success?: boolean;
  query?: string;
  params?: (string | number)[];
  results?: Record<string, unknown>[];
  count?: number;
  error?: string;
}

interface JoinState {
  enabled: boolean;
  table: string;
  on: string;
  select: string;
  type: 'left' | 'inner' | 'right';
}

const EXAMPLE_QUERIES = [
  { label: 'All users', value: 'db-users', join: null },
  { label: 'User names', value: 'db-users-name-limit-10', join: null },
  { label: 'Products by price', value: 'db-products-title-orderby-price-desc-limit-5', join: null },
  { label: 'Users + Posts', value: 'db-users-name-limit-5', join: { table: 'posts', on: 'id-author_id', select: 'title', type: 'left' as const } },
  { label: 'Posts + Authors', value: 'db-posts-title-limit-5', join: { table: 'users', on: 'author_id-id', select: 'name', type: 'left' as const } },
];

const AS_OPTIONS = ['table', 'list', 'json'] as const;
type AsOption = typeof AS_OPTIONS[number];

const JOIN_TYPES = ['left', 'inner', 'right'] as const;

const ITEMS_PER_PAGE = 20;

export function Playground() {
  const [className, setClassName] = useState('db-users-name-limit-5');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderAs, setRenderAs] = useState<AsOption>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [join, setJoin] = useState<JoinState>({
    enabled: false,
    table: 'posts',
    on: 'id-author_id',
    select: 'title',
    type: 'left',
  });

  const fetchData = useCallback(async (query: string, joinConfig: JoinState) => {
    if (!query.startsWith('db-')) {
      setResult({ error: 'Query must start with "db-"' });
      return;
    }

    setLoading(true);
    try {
      let url = `/api/query?className=${encodeURIComponent(query)}`;
      
      // Add join parameter if enabled
      if (joinConfig.enabled && joinConfig.table) {
        const joinParam = `${joinConfig.table}:${joinConfig.on}:${joinConfig.select}:${joinConfig.type}`;
        url += `&join=${encodeURIComponent(joinParam)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch on className or join change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (className) {
        fetchData(className, join);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [className, join, fetchData]);

  // Reset to page 1 when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [result?.results]);

  const applyExample = (example: typeof EXAMPLE_QUERIES[0]) => {
    setClassName(example.value);
    if (example.join) {
      setJoin({
        enabled: true,
        table: example.join.table,
        on: example.join.on,
        select: example.join.select,
        type: example.join.type,
      });
    } else {
      setJoin(prev => ({ ...prev, enabled: false }));
    }
  };

  const renderResults = () => {
    if (!result) return null;

    if (result.error) {
      return (
        <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4 font-mono text-sm">
          ⚠️ {result.error}
        </div>
      );
    }

    if (!result.results || result.results.length === 0) {
      return (
        <div className="text-slate-400 italic p-4">
          No results found
        </div>
      );
    }

    // Calculate pagination
    const totalItems = result.results.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedResults = result.results.slice(startIndex, endIndex);

    const headers = Object.keys(result.results[0]);

    switch (renderAs) {
      case 'json':
        return (
          <>
            <pre className="bg-black/40 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {JSON.stringify(paginatedResults, null, 2)}
            </pre>
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  ← Prev
                </button>
                <span className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        );

      case 'list':
        return (
          <>
            <ul className="space-y-2">
              {paginatedResults.map((row, i) => (
                <li key={startIndex + i} className="bg-white/5 rounded-lg p-3 text-slate-300">
                  {headers.length === 1 
                    ? String(row[headers[0]])
                    : headers.map(h => `${h}: ${row[h]}`).join(' • ')
                  }
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  ← Prev
                </button>
                <span className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        );

      case 'table':
      default:
        return (
          <>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full border-collapse text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-white/5">
                    {headers.map((h) => (
                      <th key={h} className="border border-white/10 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-cyan-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((row, i) => (
                    <tr key={startIndex + i} className="hover:bg-white/5 transition-colors">
                      {headers.map((h) => (
                        <td key={h} className="border border-white/10 px-2 sm:px-3 py-1.5 sm:py-2 text-slate-300 break-words max-w-[200px] sm:max-w-none">
                          {String(row[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  ← Prev
                </button>
                <span className="text-xs text-slate-500 text-center">
                  Page {currentPage} of {totalPages}
                  <span className="hidden sm:inline"> ({startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems})</span>
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Component Input - looks like JSX */}
      <div className="space-y-3 sm:space-y-4">
        <div className="bg-black/50 border border-white/20 rounded-xl p-3 sm:p-4 font-mono text-xs sm:text-sm md:text-base overflow-x-auto">
          {/* DB Component */}
          <div className="flex flex-col">
            <span className="text-pink-400">&lt;DB</span>
            
            {/* className prop */}
            <div className="flex items-center gap-1 pl-4">
              <span className="text-cyan-400">className</span>
              <span className="text-white">=</span>
              <span className="text-green-400">&quot;</span>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="bg-transparent text-green-400 outline-none border-b border-green-400/30 focus:border-green-400 transition-colors min-w-[8ch] max-w-full flex-1"
                placeholder="db-users-name"
                style={{ width: `${Math.max(12, Math.min(className.length + 1, 30))}ch` }}
              />
              <span className="text-green-400">&quot;</span>
            </div>
            
            {/* as prop */}
            <div className="flex items-center gap-1 pl-4">
              <span className="text-cyan-400">as</span>
              <span className="text-white">=</span>
              <span className="text-orange-400">&quot;</span>
              <select
                value={renderAs}
                onChange={(e) => setRenderAs(e.target.value as AsOption)}
                className="bg-transparent text-orange-400 outline-none border-b border-orange-400/30 focus:border-orange-400 cursor-pointer"
              >
                {AS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-orange-400">
                    {opt}
                  </option>
                ))}
              </select>
              <span className="text-orange-400">&quot;</span>
            </div>
            
            <span className="text-pink-400">{join.enabled ? '>' : '/>'}</span>
          </div>
          
          {/* Join Component (if enabled) */}
          {join.enabled && (
            <>
              <div className="flex flex-col pl-4 mt-1">
                <span className="text-purple-400">&lt;Join</span>
                
                {/* table prop */}
                <div className="flex items-center gap-1 pl-4">
                  <span className="text-cyan-400">table</span>
                  <span className="text-white">=</span>
                  <span className="text-green-400">&quot;</span>
                  <input
                    type="text"
                    value={join.table}
                    onChange={(e) => setJoin(prev => ({ ...prev, table: e.target.value }))}
                    className="bg-transparent text-green-400 outline-none border-b border-green-400/30 focus:border-green-400 transition-colors min-w-[5ch]"
                    placeholder="posts"
                    style={{ width: `${Math.max(5, Math.min(join.table.length + 1, 15))}ch` }}
                  />
                  <span className="text-green-400">&quot;</span>
                </div>
                
                {/* on prop */}
                <div className="flex items-center gap-1 pl-4">
                  <span className="text-cyan-400">on</span>
                  <span className="text-white">=</span>
                  <span className="text-yellow-400">&quot;</span>
                  <input
                    type="text"
                    value={join.on}
                    onChange={(e) => setJoin(prev => ({ ...prev, on: e.target.value }))}
                    className="bg-transparent text-yellow-400 outline-none border-b border-yellow-400/30 focus:border-yellow-400 transition-colors min-w-[8ch]"
                    placeholder="id-author_id"
                    style={{ width: `${Math.max(10, Math.min(join.on.length + 1, 20))}ch` }}
                  />
                  <span className="text-yellow-400">&quot;</span>
                </div>
                
                {/* select prop */}
                <div className="flex items-center gap-1 pl-4">
                  <span className="text-cyan-400">select</span>
                  <span className="text-white">=</span>
                  <span className="text-green-400">&quot;</span>
                  <input
                    type="text"
                    value={join.select}
                    onChange={(e) => setJoin(prev => ({ ...prev, select: e.target.value }))}
                    className="bg-transparent text-green-400 outline-none border-b border-green-400/30 focus:border-green-400 transition-colors min-w-[5ch]"
                    placeholder="title"
                    style={{ width: `${Math.max(5, Math.min(join.select.length + 1, 15))}ch` }}
                  />
                  <span className="text-green-400">&quot;</span>
                </div>
                
                {/* type prop */}
                <div className="flex items-center gap-1 pl-4">
                  <span className="text-cyan-400">type</span>
                  <span className="text-white">=</span>
                  <span className="text-orange-400">&quot;</span>
                  <select
                    value={join.type}
                    onChange={(e) => setJoin(prev => ({ ...prev, type: e.target.value as 'left' | 'inner' | 'right' }))}
                    className="bg-transparent text-orange-400 outline-none border-b border-orange-400/30 focus:border-orange-400 cursor-pointer"
                  >
                    {JOIN_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-slate-900 text-orange-400">
                        {type}
                      </option>
                    ))}
                  </select>
                  <span className="text-orange-400">&quot;</span>
                </div>
                
                <span className="text-purple-400">/&gt;</span>
              </div>
              <div className="mt-1">
                <span className="text-pink-400">&lt;/DB&gt;</span>
              </div>
            </>
          )}
        </div>

        {/* Join Toggle & Quick Examples */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setJoin(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
              join.enabled
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            <span>{join.enabled ? '−' : '+'}</span>
            <span>Join</span>
          </button>
          
          <div className="hidden sm:block h-4 w-px bg-white/10" />
          
          <span className="text-xs text-slate-500 uppercase tracking-wide hidden sm:inline">Try:</span>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example.label}
                onClick={() => applyExample(example)}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
                  className === example.value && (example.join ? join.enabled : !join.enabled)
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-300'
                }`}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated SQL */}
      {result?.query && (
        <div className="bg-black/40 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Generated SQL:</div>
          <code className="text-purple-400 break-all whitespace-pre-wrap">{result.query}</code>
          {result.params && result.params.length > 0 && (
            <span className="text-slate-500 ml-1 sm:ml-2 block sm:inline mt-1 sm:mt-0">
              [{result.params.join(', ')}]
            </span>
          )}
        </div>
      )}

      {/* Result count */}
      {result?.count !== undefined && !result.error && (
        <div className="text-xs text-slate-500 px-1">
          {result.count} result{result.count !== 1 ? 's' : ''}
          {result.count > ITEMS_PER_PAGE && (
            <span className="ml-1 sm:ml-2">
              (showing {ITEMS_PER_PAGE} per page)
            </span>
          )}
        </div>
      )}

      {/* Results */}
      <div className={`min-h-[200px] rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 ${loading ? 'opacity-50' : ''}`}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
          </div>
        ) : (
          renderResults()
        )}
      </div>
    </div>
  );
}

export default Playground;
