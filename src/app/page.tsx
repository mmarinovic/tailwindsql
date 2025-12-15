import { DB } from '@/components/DB';
import { 
  UserNameExample,
  ProductListExample,
  OrderedPostsExample,
  JoinExample,
} from '@/components/Example';
import { Playground } from '@/components/Playground';

export default function Home() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            TailwindSQL
          </h1>
          
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Like TailwindCSS, but for SQL queries.
            <br />
            <span className="text-[var(--accent-cyan)]">className</span> your way to database queries!
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <span className="badge badge-cyan">React Server Components</span>
            <span className="badge badge-pink">SQLite</span>
            <span className="badge badge-purple">Zero Runtime</span>
            <span className="badge badge-green">Type Safe*</span>
          </div>

          {/* GitHub Link */}
          <div className="flex justify-center mb-12">
            <a
              href="https://github.com/mmarinovic/tailwindsql"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg hover:border-[var(--accent-cyan)] transition-colors text-[var(--text-primary)] hover:text-[var(--accent-cyan)]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">View on GitHub</span>
            </a>
          </div>

          {/* Hero Example */}
          <div className="glow-card p-8 max-w-2xl mx-auto text-left">
            <div className="code-block text-base md:text-lg">
              <pre>
                <span className="token-tag">&lt;DB</span>
                <span className="token-attr"> className</span>=
                <span className="token-string">&quot;db-users-name-where-id-1&quot;</span>
                <span className="token-tag"> /&gt;</span>
              </pre>
            </div>
            <div className="mt-4 text-center">
              <span className="text-[var(--text-secondary)]">→ Renders: </span>
              <span className="text-2xl font-semibold text-[var(--accent-green)]">
                <DB className="db-users-name-where-id-1" />
              </span>
            </div>
          </div>
        </div>

        {/* Syntax Reference */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="text-[var(--accent-cyan)]">Syntax</span> Reference
          </h2>
          
          <div className="glow-card p-6 max-w-3xl mx-auto">
            <div className="code-block text-sm md:text-base overflow-x-auto">
              <pre className="text-[var(--accent-purple)]">
db-&#123;table&#125;-&#123;column&#125;-where-&#123;field&#125;-&#123;value&#125;-limit-&#123;n&#125;-orderby-&#123;field&#125;-&#123;asc|desc&#125;
              </pre>
            </div>
          </div>
        </section>

        {/* Interactive Playground */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4 text-center">
            <span className="text-[var(--accent-orange)]">Interactive</span> Playground
          </h2>
          <p className="text-center text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Type a TailwindSQL query and see results update in real-time
          </p>
          
          <div className="glow-card p-6 md:p-8">
            <Playground />
          </div>
        </section>

        {/* More Examples */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4 text-center">
            <span className="text-[var(--accent-cyan)]">More</span> Examples
          </h2>
          <p className="text-center text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Different ways to query and render data with TailwindSQL
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <UserNameExample />
            <ProductListExample />
            <OrderedPostsExample />
            <JoinExample />
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-[var(--text-secondary)] text-sm space-y-4">
          <div className="inline-flex items-center gap-2 badge-orange">
            <span>⚠️</span>
            <span>For fun only - don&apos;t use in production!</span>
          </div>
          <p>
            Built with 💜 using Next.js, SQLite, and questionable decisions
          </p>
          <p>
            <span className="text-[var(--accent-pink)]">*</span> Type safety not actually included
          </p>
        </footer>
      </div>
    </main>
  );
}

