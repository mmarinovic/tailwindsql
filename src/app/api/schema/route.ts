/**
 * TailwindSQL Schema API
 * 
 * Returns database schema information including tables, columns, and sample data.
 */

import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: unknown;
  pk: number;
}

export async function GET() {
  try {
    // Get all tables
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as { name: string }[];

    const tableInfos = tables.map((table) => {
      // Get column info
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all() as ColumnInfo[];
      
      // Get row count
      const countResult = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
      
      // Get sample data (first 20 rows)
      const data = db.prepare(`SELECT * FROM ${table.name} LIMIT 20`).all();

      return {
        name: table.name,
        columns: columns.map(col => ({
          name: col.name,
          type: col.type || 'TEXT',
        })),
        rowCount: countResult.count,
        data,
      };
    });

    return NextResponse.json({ tables: tableInfos });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch schema';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

