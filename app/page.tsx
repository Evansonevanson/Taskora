import { CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Taskora
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Role-based task management and client portal. Initializing project
          foundation.
        </p>
      </div>
    </main>
  );
}
