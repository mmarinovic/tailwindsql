/**
 * TailwindSQL Join Component
 * 
 * A child component that defines JOIN operations for the parent <DB /> component.
 * 
 * Usage:
 *   <DB className="db-users">
 *     <Join table="posts" on="id-author_id" />
 *   </DB>
 * 
 *   <DB className="db-users-name">
 *     <Join table="posts" on="id-author_id" select="title" type="left" />
 *   </DB>
 */

export interface JoinProps {
  /** The table to join */
  table: string;
  /** 
   * Join condition in format "parentCol-childCol"
   * e.g., "id-author_id" becomes "parent.id = child.author_id"
   */
  on: string;
  /** Columns to select from the joined table (comma-separated or single) */
  select?: string;
  /** Join type: inner, left, right */
  type?: 'inner' | 'left' | 'right';
}

export interface JoinConfig {
  table: string;
  parentColumn: string;
  childColumn: string;
  columns: string[];
  type: 'INNER' | 'LEFT' | 'RIGHT';
}

/**
 * Parse Join props into a JoinConfig
 */
export function parseJoinProps(props: JoinProps): JoinConfig {
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

/**
 * Join component - used as a child of <DB /> to specify JOIN operations.
 * This component doesn't render anything by itself.
 */
export function Join(_props: JoinProps): null {
  // This component doesn't render anything
  // It's just a declarative way to pass join config to parent <DB />
  return null;
}

export default Join;
