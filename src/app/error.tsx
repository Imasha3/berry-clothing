"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">Something went wrong</p>
      <h1 className="mt-4 font-display text-4xl text-ink">Berry hit a little snag.</h1>
      <p className="mt-4 text-sm leading-7 text-black/60">
        Please try again. The page is protected by an error boundary, so the whole app will not crash.
      </p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
