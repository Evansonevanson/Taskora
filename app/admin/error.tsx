'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service if available
    console.error('Admin route error boundary captured error:', error);
  }, [error]);

  return (
    <div className="animate-in fade-in-50 flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-stone-200/80 bg-white/80 p-8 text-center shadow-sm duration-200 dark:border-stone-800 dark:bg-stone-900/40">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950/50 dark:text-red-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
        Something went wrong
      </h2>
      <p className="mt-1.5 max-w-md text-xs text-stone-600 dark:text-stone-400">
        An error occurred while loading administrative dashboard data. You can
        try refreshing the view.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[10px] text-stone-500">
          Digest: {error.digest}
        </p>
      )}
      <div className="mt-6 flex items-center gap-3">
        <Button
          onClick={() => reset()}
          variant="primary"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </Button>
      </div>
    </div>
  );
}
