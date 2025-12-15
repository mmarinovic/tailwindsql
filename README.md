# TailwindSQL 🎨

> Like TailwindCSS, but for SQL queries in React Server Components.

⚠️ **This is a fun experiment - don't use in production!**

## What is this?

TailwindSQL lets you write SQL queries using Tailwind-style class names:

```jsx
// Fetch and render a user's name
<DB className="db-users-name-where-id-1" />
// Renders: "Ada Lovelace"

// Render products as a list
<DB className="db-products-title-limit-5" as="ul" />
// Renders: <ul><li>Mechanical Keyboard</li>...</ul>

// Order by price and show as table
<DB className="db-products-orderby-price-desc" as="table" />
```

## Syntax

```
db-{table}-{column}-where-{field}-{value}-limit-{n}-orderby-{field}-{asc|desc}
```

### Examples

| Class Name | SQL Query |
|------------|-----------|
| `db-users` | `SELECT * FROM users` |
| `db-users-name` | `SELECT name FROM users` |
| `db-users-where-id-1` | `SELECT * FROM users WHERE id = 1` |
| `db-posts-title-limit-10` | `SELECT title FROM posts LIMIT 10` |
| `db-products-orderby-price-desc` | `SELECT * FROM products ORDER BY price DESC` |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Seed the database with demo data
npm run seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo!

## How It Works

1. **Parser** (`src/lib/parser.ts`) - Parses class names into query configurations
2. **Query Builder** (`src/lib/query-builder.ts`) - Transforms configs into safe SQL queries
3. **DB Component** (`src/components/DB.tsx`) - React Server Component that executes queries and renders results

## Render Modes

The `as` prop controls how results are rendered:

| Value | Description |
|-------|-------------|
| `span` | Inline text (default) |
| `div` | Block element |
| `ul` | Unordered list |
| `ol` | Ordered list |
| `table` | HTML table |
| `json` | JSON code block |

## Why?

Because it's fun! This project was built to explore:
- React Server Components
- Novel approaches to data fetching
- The absurdity of CSS-driven databases

## License

MIT - Do whatever you want with it (except deploy to production 😅)

# tailwindsql
