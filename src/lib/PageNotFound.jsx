import React from 'react';
import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-center px-4">
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Link to="/app" className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        Back to dashboard
      </Link>
    </div>
  );
}
