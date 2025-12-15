/**
 * TailwindSQL Query Builder
 * 
 * Transforms parsed query configs into safe SQL queries with parameterized values.
 */

import { QueryConfig } from './parser';

export interface BuiltQuery {
  sql: string;
  params: (string | number)[];
}

// Whitelist of allowed table and column names to prevent SQL injection
// In a real app, you'd want to validate against actual schema
const SAFE_IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function sanitizeIdentifier(name: string): string {
  if (!SAFE_IDENTIFIER_REGEX.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return name;
}

export function buildQuery(config: QueryConfig): BuiltQuery {
  const params: (string | number)[] = [];
  
  // Sanitize table name
  const table = sanitizeIdentifier(config.table);
  const hasJoins = config.joins && config.joins.length > 0;
  
  // Build SELECT clause
  let selectColumns: string[] = [];
  
  if (config.columns.length > 0) {
    // If we have joins, prefix columns with table name
    if (hasJoins) {
      selectColumns = config.columns.map(c => `${table}.${sanitizeIdentifier(c)}`);
    } else {
      selectColumns = config.columns.map(c => sanitizeIdentifier(c));
    }
  } else {
    selectColumns = hasJoins ? [`${table}.*`] : ['*'];
  }
  
  // Add columns from joins
  if (config.joins) {
    for (const join of config.joins) {
      const joinTable = sanitizeIdentifier(join.table);
      if (join.columns.length > 0) {
        for (const col of join.columns) {
          selectColumns.push(`${joinTable}.${sanitizeIdentifier(col)}`);
        }
      } else {
        selectColumns.push(`${joinTable}.*`);
      }
    }
  }
  
  const columns = selectColumns.join(', ');
  
  // Start building the query
  let sql = `SELECT ${columns} FROM ${table}`;
  
  // Build JOIN clauses
  if (config.joins) {
    for (const join of config.joins) {
      const joinTable = sanitizeIdentifier(join.table);
      const parentCol = sanitizeIdentifier(join.parentColumn);
      const childCol = sanitizeIdentifier(join.childColumn);
      
      sql += ` ${join.type} JOIN ${joinTable} ON ${table}.${parentCol} = ${joinTable}.${childCol}`;
    }
  }
  
  // Build WHERE clause
  const whereEntries = Object.entries(config.where);
  if (whereEntries.length > 0) {
    const conditions = whereEntries.map(([field, value]) => {
      const sanitizedField = sanitizeIdentifier(field);
      params.push(value);
      // If we have joins, prefix with main table
      const fieldRef = hasJoins ? `${table}.${sanitizedField}` : sanitizedField;
      return `${fieldRef} = ?`;
    });
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  // Build ORDER BY clause
  if (config.orderBy) {
    const field = sanitizeIdentifier(config.orderBy.field);
    const direction = config.orderBy.direction.toUpperCase();
    // If we have joins, prefix with main table
    const fieldRef = hasJoins ? `${table}.${field}` : field;
    sql += ` ORDER BY ${fieldRef} ${direction}`;
  }
  
  // Build LIMIT clause
  if (config.limit !== undefined) {
    sql += ` LIMIT ?`;
    params.push(config.limit);
  }
  
  return { sql, params };
}
