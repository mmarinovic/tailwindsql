/**
 * TailwindSQL Class Name Parser
 * 
 * Parses Tailwind-style class names into SQL query configurations.
 * 
 * Syntax: db-{table}-{column}-where-{field}-{value}-limit-{n}-orderby-{field}-{asc|desc}
 * 
 * Examples:
 * - db-users → SELECT * FROM users
 * - db-users-name → SELECT name FROM users
 * - db-users-where-id-1 → SELECT * FROM users WHERE id = 1
 * - db-posts-title-limit-10 → SELECT title FROM posts LIMIT 10
 * - db-products-orderby-price-desc → SELECT * FROM products ORDER BY price DESC
 */

export interface JoinConfig {
  table: string;
  parentColumn: string;
  childColumn: string;
  columns: string[];
  type: 'INNER' | 'LEFT' | 'RIGHT';
}

export interface QueryConfig {
  table: string;
  columns: string[];
  where: Record<string, string>;
  limit?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  joins?: JoinConfig[];
}

type ParserState = 'table' | 'column' | 'where_field' | 'where_value' | 'limit' | 'orderby_field' | 'orderby_dir';

export function parseClassName(className: string): QueryConfig | null {
  // Must start with 'db-'
  if (!className.startsWith('db-')) {
    return null;
  }

  const parts = className.slice(3).split('-'); // Remove 'db-' prefix
  
  if (parts.length === 0 || !parts[0]) {
    return null;
  }

  const config: QueryConfig = {
    table: parts[0],
    columns: [],
    where: {},
  };

  let state: ParserState = 'column';
  let currentWhereField = '';
  let i = 1;

  while (i < parts.length) {
    const part = parts[i];

    if (part === 'where') {
      state = 'where_field';
      i++;
      continue;
    }

    if (part === 'limit') {
      state = 'limit';
      i++;
      continue;
    }

    if (part === 'orderby') {
      state = 'orderby_field';
      i++;
      continue;
    }

    switch (state) {
      case 'column':
        // Check if this looks like a column name (not a keyword)
        if (!['where', 'limit', 'orderby'].includes(part)) {
          config.columns.push(part);
        }
        break;

      case 'where_field':
        currentWhereField = part;
        state = 'where_value';
        break;

      case 'where_value':
        config.where[currentWhereField] = part;
        state = 'where_field'; // Allow multiple where conditions
        break;

      case 'limit':
        const limit = parseInt(part, 10);
        if (!isNaN(limit)) {
          config.limit = limit;
        }
        state = 'column'; // Reset state
        break;

      case 'orderby_field':
        config.orderBy = {
          field: part,
          direction: 'asc',
        };
        state = 'orderby_dir';
        break;

      case 'orderby_dir':
        if (part === 'asc' || part === 'desc') {
          config.orderBy!.direction = part;
        }
        state = 'column'; // Reset state
        break;
    }

    i++;
  }

  return config;
}

/**
 * Parse multiple class names and return the first valid TailwindSQL query
 */
export function parseClassNames(classNames: string): QueryConfig | null {
  const classes = classNames.split(/\s+/);
  
  for (const className of classes) {
    const config = parseClassName(className.trim());
    if (config) {
      return config;
    }
  }
  
  return null;
}

