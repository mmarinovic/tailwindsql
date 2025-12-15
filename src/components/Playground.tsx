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

interface SingleJoin {
  table: string;
  on: string;
  select: string;
  type: 'left' | 'inner' | 'right';
}

interface JoinsState {
  count: 0 | 1 | 2;
  joins: [SingleJoin, SingleJoin];
}

interface ExampleJoins {
  count: 0 | 1 | 2;
  joins?: [Partial<SingleJoin>, Partial<SingleJoin>?];
}

const EXAMPLE_QUERIES: { label: string; value: string; joinConfig: ExampleJoins }[] = [
  { label: 'All users', value: 'db-users', joinConfig: { count: 0 } },
  { label: 'User names', value: 'db-users-name-limit-10', joinConfig: { count: 0 } },
  { label: 'Products by price', value: 'db-products-title-orderby-price-desc-limit-5', joinConfig: { count: 0 } },
  { label: 'Users + Posts', value: 'db-users-name-limit-5', joinConfig: { count: 1, joins: [{ table: 'posts', on: 'id-author_id', select: 'title', type: 'left' }] } },
  { label: 'Posts + Authors', value: 'db-posts-title-limit-5', joinConfig: { count: 1, joins: [{ table: 'users', on: 'author_id-id', select: 'name', type: 'left' }] } },
  { label: 'Posts + User + Role', value: 'db-posts-title-limit-5', joinConfig: { count: 2, joins: [{ table: 'users', on: 'author_id-id', select: 'name', type: 'left' }, { table: 'users', on: 'author_id-id', select: 'role', type: 'left' }] } },
];

const AS_OPTIONS = ['table', 'list', 'json'] as const;
type AsOption = typeof AS_OPTIONS[number];

const JOIN_TYPES = ['left', 'inner', 'right'] as const;

const DEFAULT_JOINS: [SingleJoin, SingleJoin] = [
  { table: 'posts', on: 'id-author_id', select: 'title', type: 'left' },
  { table: 'users', on: 'author_id-id', select: 'role', type: 'left' },
];

export function Playground() {
  const [className, setClassName] = useState('db-users-name-limit-5');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderAs, setRenderAs] = useState<AsOption>('table');
  const [joinsState, setJoinsState] = useState<JoinsState>({
    count: 0,
    joins: DEFAULT_JOINS,
  });

  const fetchData = useCallback(async (query: string, joins: JoinsState) => {
    if (!query.startsWith('db-')) {
      setResult({ error: 'Query must start with "db-"' });
      return;
    }

    setLoading(true);
    try {
      let url = `/api/query?className=${encodeURIComponent(query)}`;
      
      // Add join parameters if enabled
      for (let i = 0; i < joins.count; i++) {
        const j = joins.joins[i];
        if (j.table) {
          const joinParam = `${j.table}:${j.on}:${j.select}:${j.type}`;
          url += `&join=${encodeURIComponent(joinParam)}`;
        }
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

  // Debounced fetch on className or joins change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (className) {
        fetchData(className, joinsState);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [className, joinsState, fetchData]);

  const applyExample = (example: typeof EXAMPLE_QUERIES[0]) => {
    setClassName(example.value);
    const jc = example.joinConfig;
    if (jc.count > 0 && jc.joins) {
      const newJoins: [SingleJoin, SingleJoin] = [...DEFAULT_JOINS];
      jc.joins.forEach((j, i) => {
        if (j && i < 2) {
          newJoins[i] = { ...DEFAULT_JOINS[i], ...j };
        }
      });
      setJoinsState({ count: jc.count, joins: newJoins });
    } else {
      setJoinsState(prev => ({ ...prev, count: 0 }));
    }
  };

  const updateJoin = (index: 0 | 1, updates: Partial<SingleJoin>) => {
    setJoinsState(prev => {
      const newJoins: [SingleJoin, SingleJoin] = [...prev.joins];
      newJoins[index] = { ...newJoins[index], ...updates };
      return { ...prev, joins: newJoins };
    });
  };

  const toggleJoinCount = () => {
    setJoinsState(prev => ({
      ...prev,
      count: ((prev.count + 1) % 3) as 0 | 1 | 2,
    }));
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

    const headers = Object.keys(result.results[0]);

    switch (renderAs) {
      case 'json':
        return (
          <pre className="bg-black/40 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            {JSON.stringify(result.results, null, 2)}
          </pre>
        );

      case 'list':
        return (
          <ul className="space-y-2">
            {result.results.map((row, i) => (
              <li key={i} className="bg-white/5 rounded-lg p-3 text-slate-300">
                {headers.length === 1 
                  ? String(row[headers[0]])
                  : headers.map(h => `${h}: ${row[h]}`).join(' • ')
                }
              </li>
            ))}
          </ul>
        );

      case 'table':
      default:
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-white/5">
                  {headers.map((h) => (
                    <th key={h} className="border border-white/10 px-3 py-2 text-left font-semibold text-cyan-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.results.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    {headers.map((h) => (
                      <td key={h} className="border border-white/10 px-3 py-2 text-slate-300">
                        {String(row[h] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  const renderJoinComponent = (index: 0 | 1) => {
    const join = joinsState.joins[index];
    return (
      <div key={index} className="flex flex-wrap items-center gap-1 ml-4 mt-2">
        <span className="text-purple-400">&lt;Join</span>
        
        {/* table prop */}
        <span className="text-cyan-400 ml-2">table</span>
        <span className="text-white">=</span>
        <span className="text-green-400">&quot;</span>
        <input
          type="text"
          value={join.table}
          onChange={(e) => updateJoin(index, { table: e.target.value })}
          className="bg-transparent text-green-400 outline-none border-b border-green-400/30 focus:border-green-400 transition-colors w-20"
          placeholder="posts"
        />
        <span className="text-green-400">&quot;</span>
        
        {/* on prop */}
        <span className="text-cyan-400 ml-2">on</span>
        <span className="text-white">=</span>
        <span className="text-yellow-400">&quot;</span>
        <input
          type="text"
          value={join.on}
          onChange={(e) => updateJoin(index, { on: e.target.value })}
          className="bg-transparent text-yellow-400 outline-none border-b border-yellow-400/30 focus:border-yellow-400 transition-colors w-28"
          placeholder="id-author_id"
        />
        <span className="text-yellow-400">&quot;</span>
        
        {/* select prop */}
        <span className="text-cyan-400 ml-2">select</span>
        <span className="text-white">=</span>
        <span className="text-green-400">&quot;</span>
        <input
          type="text"
          value={join.select}
          onChange={(e) => updateJoin(index, { select: e.target.value })}
          className="bg-transparent text-green-400 outline-none border-b border-green-400/30 focus:border-green-400 transition-colors w-20"
          placeholder="title"
        />
        <span className="text-green-400">&quot;</span>
        
        {/* type prop */}
        <span className="text-cyan-400 ml-2">type</span>
        <span className="text-white">=</span>
        <span className="text-orange-400">&quot;</span>
        <select
          value={join.type}
          onChange={(e) => updateJoin(index, { type: e.target.value as 'left' | 'inner' | 'right' })}
          className="bg-transparent text-orange-400 outline-none border-b border-orange-400/30 focus:border-orange-400 cursor-pointer"
        >
          {JOIN_TYPES.map((type) => (
            <option key={type} value={type} className="bg-slate-900 text-orange-400">
              {type}
            </option>
          ))}
        </select>
        <span className="text-orange-400">&quot;</span>
        
        <span className="text-purple-400 ml-1">/&gt;</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Component Input - looks like JSX */}
      <div className="space-y-4">
        <div className="bg-black/50 border border-white/20 rounded-xl p-4 font-mono text-sm md:text-base overflow-x-auto">
          {/* DB Component */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-pink-400">&lt;DB</span>
            
            {/* className prop */}
            <span className="text-cyan-400 ml-2">className</span>
            <span className="text-white">=</span>
            <span className="text-green-400">&quot;</span>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="bg-transparent text-green-400 outline-none border-b border-green-400/30 focus:border-green-400 transition-colors min-w-[180px] md:min-w-[280px]"
              placeholder="db-users-name"
              style={{ width: `${Math.max(180, className.length * 9)}px` }}
            />
            <span className="text-green-400">&quot;</span>
            
            {/* as prop */}
            <span className="text-cyan-400 ml-2">as</span>
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
            
            <span className="text-pink-400 ml-1">{joinsState.count > 0 ? '>' : '/>'}</span>
          </div>
          
          {/* Join Components (if enabled) */}
          {joinsState.count >= 1 && renderJoinComponent(0)}
          {joinsState.count >= 2 && renderJoinComponent(1)}
          
          {joinsState.count > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-pink-400">&lt;/DB&gt;</span>
            </div>
          )}
        </div>

        {/* Join Toggle & Quick Examples */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleJoinCount}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              joinsState.count > 0
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            <span>{joinsState.count === 0 ? '+' : joinsState.count === 1 ? '++' : '−'}</span>
            <span>Join{joinsState.count === 2 ? 's' : ''} ({joinsState.count})</span>
          </button>
          
          <div className="h-4 w-px bg-white/10" />
          
          <span className="text-xs text-slate-500 uppercase tracking-wide">Try:</span>
          {EXAMPLE_QUERIES.map((example) => (
            <button
              key={example.label}
              onClick={() => applyExample(example)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                className === example.value && example.joinConfig.count === joinsState.count
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-300'
              }`}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generated SQL */}
      {result?.query && (
        <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Generated SQL:</div>
          <code className="text-purple-400 break-all">{result.query}</code>
          {result.params && result.params.length > 0 && (
            <span className="text-slate-500 ml-2">
              [{result.params.join(', ')}]
            </span>
          )}
        </div>
      )}

      {/* Result count */}
      {result?.count !== undefined && !result.error && (
        <div className="text-xs text-slate-500">
          {result.count} result{result.count !== 1 ? 's' : ''}
        </div>
      )}

      {/* Results */}
      <div className={`min-h-[200px] rounded-xl border border-white/10 bg-white/5 p-4 ${loading ? 'opacity-50' : ''}`}>
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
