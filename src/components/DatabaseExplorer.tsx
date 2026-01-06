import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';

const TableSchema = z.object({
  name: z.string(),
  columns: z.array(z.object({
    name: z.string(),
    type: z.string(),
  })),
  rowCount: z.number(),
  data: z.array(z.record(z.unknown())),
});

const SchemaData = z.object({
  tables: z.array(TableSchema),
});

type TableInfo = z.infer<typeof TableSchema>;
type SchemaData = z.infer<typeof SchemaData>;

export function DatabaseExplorer() {
  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [activeTable, setActiveTable] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const rowsPerPage = 10;

  useEffect(() => {
    async function fetchSchema() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/schema', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          credentials: 'same-origin',
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const rawData = await response.json();
        const validatedData = SchemaData.parse(rawData);
        
        setSchema(validatedData);
        if (validatedData.tables?.length > 0) {
          setActiveTable(validatedData.tables[0].name);
        }
      } catch (err) {
        console.error('Failed to fetch schema:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchSchema();
  }, []);

  const currentTable = useMemo(() => 
    schema?.tables.find(t => t.name === activeTable), 
    [schema, activeTable]
  );

  const filteredAndSortedData = useMemo(() => {
    if (!currentTable) return [];
    
    let filteredData = currentTable.data;
    
    if (searchTerm) {
      filteredData = currentTable.data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    if (sortColumn) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }
    
    return filteredData;
  }, [currentTable, searchTerm, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    if (!currentTable) return;
    
    const csvContent = [
      currentTable.columns.map(col => col.name).join(','),
      ...currentTable.data.map(row => 
        currentTable.columns.map(col => {
          const value = row[col.name];
          if (value === null || value === undefined) return 'NULL';
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
          return String(value);
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTable.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-8">
        Error: {error}
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
                onClick={() => {
                  setActiveTable(table.name);
                  setCurrentPage(1);
                  setSearchTerm('');
                  setSortColumn('');
                }}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-2 py-1 rounded transition-colors"
                >
                  Export CSV
                </button>
                <code className="text-xs text-purple-400 bg-black/40 px-2 py-1 rounded font-mono break-all">
                  db-{currentTable.name}
                </code>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-3 sm:px-4 py-2 border-b border-white/10 bg-white/[0.02]">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
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
                          onClick={() => handleSort(col.name)}
                          className="border border-white/10 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-cyan-400 bg-white/5 whitespace-nowrap cursor-pointer hover:bg-white/10"
                        >
                          <div className="flex items-center gap-1">
                            {col.name}
                            {sortColumn === col.name && (
                              <span className="text-xs">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, i) => (
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

            {/* Pagination */}
            <div className="px-3 sm:px-4 py-2 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Showing {paginatedData.length} of {filteredAndSortedData.length} rows
                {filteredAndSortedData.length !== currentTable.rowCount && (
                  <span> (filtered from {currentTable.rowCount} total)</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
                >
                  Previous
                </button>
                <span className="px-2 py-1 text-xs text-slate-400">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-2 py-1 text-xs rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
                >
                  Next
                </button>
              </div>
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
