# TailwindSQL 🎨

> Like TailwindCSS, but for SQL queries in React Server Components.

[![GitHub](https://img.shields.io/badge/GitHub-View%20on%20GitHub-blue?logo=github)](https://github.com/mmarinovic/tailwindsql)

⚠️ **This is a fun experiment - don't use in production!**

## What is this?

TailwindSQL lets you write SQL queries using Tailwind-style class names. Just use `className` to query your database directly in React Server Components!

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

## Features

- 🎨 **Tailwind-style syntax** - Write SQL queries using familiar class names
- ⚡ **React Server Components** - Zero client-side JavaScript for queries
- 🔒 **SQLite** - Built on better-sqlite3 for fast, local database access
- 🎯 **Zero Runtime** - Queries are parsed and executed at build/render time
- 🎭 **Multiple Render Modes** - Render as text, lists, tables, or JSON

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
# Clone the repository
git clone https://github.com/mmarinovic/tailwindsql.git
cd tailwindsql

# Install dependencies
npm install

# Seed the database with demo data
npm run seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo and interactive playground!

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

## Project Structure

```
tailwindsql/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Landing page
│   │   └── api/          # API routes
│   ├── components/        # React components
│   │   ├── DB.tsx        # Main DB component
│   │   ├── Example.tsx   # Example components
│   │   └── Playground.tsx # Interactive playground
│   └── lib/              # Core logic
│       ├── parser.ts     # Class name parser
│       ├── query-builder.ts # SQL query builder
│       └── db.ts         # Database connection
└── README.md
```

## Why?

Because it's fun! This project was built to explore:
- React Server Components and their capabilities
- Novel approaches to data fetching in React
- The absurdity of CSS-driven databases
- Pushing the boundaries of what's possible with className

## Contributing

Contributions are welcome! This is a fun experiment, so feel free to:
- Open issues for bugs or feature ideas
- Submit pull requests for improvements
- Share your wild ideas for extending the syntax

## License

MIT - Do whatever you want with it (except deploy to production 😅)

---

Built with 💜 using Next.js, SQLite, and questionable decisions
