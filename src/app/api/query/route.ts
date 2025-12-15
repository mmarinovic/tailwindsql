/**
 * TailwindSQL Query API
 * 
 * Executes TailwindSQL queries and returns results as JSON.
 * Used by the interactive playground.
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseClassNames, JoinConfig } from '@/lib/parser';
import { buildQuery } from '@/lib/query-builder';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const className = searchParams.get('className');

  if (!className) {
    return NextResponse.json(
      { error: 'Missing className parameter' },
      { status: 400 }
    );
  }

  // Parse the className
  const config = parseClassNames(className);
  
  if (!config) {
    return NextResponse.json(
      { error: `Invalid TailwindSQL class: ${className}` },
      { status: 400 }
    );
  }

  // Parse join parameter if provided
  const joinParam = searchParams.get('join');
  if (joinParam) {
    const joinParts = joinParam.split(':');
    
    if (joinParts.length >= 2) {
      const [table, onClause, selectCols, joinType] = joinParts;
      const [parentCol, childCol] = (onClause || 'id-id').split('-');
      
      const typeMap: Record<string, 'INNER' | 'LEFT' | 'RIGHT'> = {
        inner: 'INNER',
        left: 'LEFT',
        right: 'RIGHT',
      };
      
      config.joins = [{
        table: table,
        parentColumn: parentCol || 'id',
        childColumn: childCol || `${table}_id`,
        columns: selectCols ? selectCols.split(',').map(c => c.trim()) : [],
        type: typeMap[joinType || 'left'] || 'LEFT',
      }];
    }
  }

  try {
    // Build and execute the query
    const { sql, params } = buildQuery(config);
    const stmt = db.prepare(sql);
    const results = stmt.all(...params);

    return NextResponse.json({
      success: true,
      query: sql,
      params,
      results,
      count: results.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Query failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
