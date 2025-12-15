/**
 * TailwindSQL DB Component
 * 
 * A React Server Component that parses Tailwind-style class names,
 * executes SQL queries, and renders the results.
 * 
 * Usage:
 *   <DB className="db-users-name-where-id-1" />
 *   <DB className="db-products-title-limit-5" as="ul" />
 *   <DB className="db-posts" as="table" />
 *   
 *   With JOIN:
 *   <DB className="db-users-name-limit-5">
 *     <Join table="posts" on="id-author_id" select="title" />
 *   </DB>
 */

import { parseClassNames, JoinConfig } from '@/lib/parser';
import { buildQuery } from '@/lib/query-builder';
import db from '@/lib/db';
import { ReactNode, ReactElement, Children, isValidElement } from 'react';
import { JoinProps } from './Join';

type RenderAs = 'span' | 'div' | 'ul' | 'ol' | 'table' | 'json' | 'code';

interface DBProps {
  className: string;
  as?: RenderAs;
  style?: React.CSSProperties;
  children?: ReactNode;
}

function parseJoinChild(props: JoinProps): JoinConfig {
  const [parentColumn, childColumn] = props.on.split('-');
  
  const columns = props.select 
    ? props.select.split(',').map(c => c.trim())
    : [];

  const typeMap = {
    inner: 'INNER' as const,
    left: 'LEFT' as const,
    right: 'RIGHT' as const,
  };

  return {
    table: props.table,
    parentColumn: parentColumn || 'id',
    childColumn: childColumn || `${props.table}_id`,
    columns,
    type: typeMap[props.type || 'left'],
  };
}

export async function DB({ className, as = 'span', style, children }: DBProps): Promise<JSX.Element> {
  // Parse the className to extract query config
  const config = parseClassNames(className);
  
  if (!config) {
    return (
      <span className="text-red-400 font-mono text-sm bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
        ⚠️ Invalid TailwindSQL class: {className}
      </span>
    );
  }

  // Extract Join children
  const joins: JoinConfig[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && (child.type as { name?: string }).name === 'Join') {
      const joinElement = child as ReactElement<JoinProps>;
      joins.push(parseJoinChild(joinElement.props));
    }
  });

  if (joins.length > 0) {
    config.joins = joins;
  }

  try {
    // Build the SQL query
    const { sql, params } = buildQuery(config);
    
    // Execute the query
    const stmt = db.prepare(sql);
    const results = stmt.all(...params) as Record<string, unknown>[];
    
    // Determine columns to display (including join columns)
    let displayColumns = [...config.columns];
    if (config.joins) {
      for (const join of config.joins) {
        displayColumns.push(...join.columns);
      }
    }
    
    // Render the results
    return renderResults(results, displayColumns, as, style);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return (
      <span className="text-orange-400 font-mono text-sm bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded">
        🔥 Query error: {errorMessage}
      </span>
    );
  }
}

function renderResults(
  results: Record<string, unknown>[],
  columns: string[],
  as: RenderAs,
  style?: React.CSSProperties
): JSX.Element {
  if (results.length === 0) {
    return (
      <span className="text-gray-400 italic" style={style}>
        No results
      </span>
    );
  }

  // If selecting a single column and single row, just return the value
  if (columns.length === 1 && results.length === 1) {
    const value = results[0][columns[0]];
    return (
      <span style={style}>
        {String(value)}
      </span>
    );
  }

  // If selecting a single column with multiple rows
  if (columns.length === 1) {
    const values = results.map(row => row[columns[0]]);
    
    switch (as) {
      case 'ul':
        return (
          <ul className="list-disc list-inside" style={style}>
            {values.map((v, i) => (
              <li key={i}>{String(v)}</li>
            ))}
          </ul>
        );
      case 'ol':
        return (
          <ol className="list-decimal list-inside" style={style}>
            {values.map((v, i) => (
              <li key={i}>{String(v)}</li>
            ))}
          </ol>
        );
      case 'json':
      case 'code':
        return (
          <code className="font-mono text-xs sm:text-sm bg-black/40 text-green-400 p-2 sm:p-3 rounded block overflow-x-auto" style={style}>
            {JSON.stringify(values, null, 2)}
          </code>
        );
      default:
        return (
          <span style={style}>
            {values.map(String).join(', ')}
          </span>
        );
    }
  }

  // Multiple columns - render as table or JSON
  switch (as) {
    case 'table':
      const headers = columns.length > 0 ? columns : Object.keys(results[0]);
      return (
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="border-collapse border border-white/10 text-xs sm:text-sm w-full min-w-[400px]" style={style}>
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
              {results.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  {headers.map((h) => (
                    <td key={h} className="border border-white/10 px-2 sm:px-3 py-1.5 sm:py-2 text-slate-300 break-words max-w-[150px] sm:max-w-none">
                      {String(row[h] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'json':
    case 'code':
      return (
        <code className="font-mono text-xs sm:text-sm bg-black/40 text-green-400 p-2 sm:p-3 rounded block whitespace-pre overflow-x-auto" style={style}>
          {JSON.stringify(results, null, 2)}
        </code>
      );

    case 'ul':
      return (
        <ul className="list-disc list-inside" style={style}>
          {results.map((row, i) => (
            <li key={i}>{JSON.stringify(row)}</li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol className="list-decimal list-inside" style={style}>
          {results.map((row, i) => (
            <li key={i}>{JSON.stringify(row)}</li>
          ))}
        </ol>
      );

    default:
      // Default: show first row's values comma-separated
      const allHeaders = columns.length > 0 ? columns : Object.keys(results[0]);
      return (
        <div style={style}>
          {results.map((row, i) => (
            <div key={i}>
              {allHeaders.map(h => String(row[h] ?? '')).join(', ')}
            </div>
          ))}
        </div>
      );
  }
}

export default DB;
