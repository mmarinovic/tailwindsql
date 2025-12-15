/**
 * TailwindSQL Example Component
 * 
 * A beautifully styled component that demonstrates TailwindSQL usage
 * with side-by-side code and live results.
 */

import { DB } from './DB';
import { Join } from './Join';
import { ReactNode } from 'react';

interface ExampleProps {
  title: string;
  description?: string;
  className: string;
  as?: 'span' | 'div' | 'ul' | 'ol' | 'table' | 'json' | 'code';
  children?: ReactNode;
  codePreview?: ReactNode;
}

export function Example({ title, description, className, as, children, codePreview }: ExampleProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-400">{description}</p>
          )}
        </div>

        {/* Code block */}
        <div className="mb-3 sm:mb-4 overflow-x-auto rounded-lg bg-black/50 p-3 sm:p-4 font-mono text-xs sm:text-sm">
          {codePreview || (
            <div className="flex flex-wrap items-baseline gap-x-1">
              <span className="text-pink-400">&lt;DB</span>
              <span>
                <span className="text-slate-300">className=</span>
                <span className="text-green-400">&quot;{className}&quot;</span>
              </span>
              {as && (
                <span>
                  <span className="text-slate-300">as=</span>
                  <span className="text-green-400">&quot;{as}&quot;</span>
                </span>
              )}
              <span className="text-pink-400">/&gt;</span>
            </div>
          )}
        </div>

        {/* Result */}
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 sm:p-4 overflow-x-auto">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-cyan-400">
            Output
          </div>
          <div className="text-white text-sm sm:text-base">
            <DB className={className} as={as}>
              {children}
            </DB>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pre-built example configurations for common use cases
 */
export function UserNameExample() {
  return (
    <Example
      title="Get User Name"
      description="Fetch a single user's name by ID"
      className="db-users-name-where-id-1"
    />
  );
}

export function UserEmailByRoleExample() {
  return (
    <Example
      title="Admin Email"
      description="Find admin user's email"
      className="db-users-email-where-role-admin"
    />
  );
}

export function ProductListExample() {
  return (
    <Example
      title="Product List"
      description="Display products as an unordered list"
      className="db-products-title-limit-5"
      as="ul"
    />
  );
}

export function OrderedPostsExample() {
  return (
    <Example
      title="Top Posts by Likes"
      description="Posts ordered by popularity"
      className="db-posts-title-orderby-likes-desc-limit-3"
      as="ol"
    />
  );
}

export function ProductTableExample() {
  return (
    <Example
      title="Product Catalog"
      description="Full product details in a table"
      className="db-products-limit-5"
      as="table"
    />
  );
}

export function JSONExample() {
  return (
    <Example
      title="Raw JSON Data"
      description="Output data as formatted JSON"
      className="db-users-where-id-3"
      as="json"
    />
  );
}

export function JoinExample() {
  return (
    <Example
      title="Users with Posts (JOIN)"
      description="Join users with their posts"
      className="db-users-name-limit-5"
      as="table"
      codePreview={
        <div className="flex flex-col">
          {/* DB opening tag with props */}
          <div className="flex flex-wrap items-baseline gap-x-1">
            <span className="text-pink-400">&lt;DB</span>
            <span>
              <span className="text-slate-300">className=</span>
              <span className="text-green-400">&quot;db-users-name-limit-5&quot;</span>
            </span>
            <span>
              <span className="text-slate-300">as=</span>
              <span className="text-green-400">&quot;table&quot;</span>
            </span>
            <span className="text-pink-400">&gt;</span>
          </div>
          {/* Join component with props */}
          <div className="flex flex-wrap items-baseline gap-x-1 pl-4">
            <span className="text-purple-400">&lt;Join</span>
            <span>
              <span className="text-slate-300">table=</span>
              <span className="text-green-400">&quot;posts&quot;</span>
            </span>
            <span>
              <span className="text-slate-300">on=</span>
              <span className="text-yellow-400">&quot;id-author_id&quot;</span>
            </span>
            <span>
              <span className="text-slate-300">select=</span>
              <span className="text-green-400">&quot;title&quot;</span>
            </span>
            <span className="text-purple-400">/&gt;</span>
          </div>
          {/* DB closing tag */}
          <span className="text-pink-400">&lt;/DB&gt;</span>
        </div>
      }
    >
      <Join table="posts" on="id-author_id" select="title" />
    </Example>
  );
}

export default Example;
