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

          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <span className="badge badge-cyan">React Server Components</span>
            <span className="badge badge-pink">SQLite</span>
            <span className="badge badge-purple">Zero Runtime</span>
            <span className="badge badge-green">Type Safe*</span>
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

