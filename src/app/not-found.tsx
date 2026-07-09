import './globals.css';

export const metadata = {
  title: '404: Card Not Found | CardCodex',
};

/**
 * Root-level fallback for entirely unmatched URLs (e.g. no locale prefix).
 * Next.js always renders this one — bypassing [locale]/not-found.tsx — for
 * paths that don't match any route, so it needs its own <html>/<body> since
 * the root layout is a passthrough (the real shell lives in [locale]/layout.tsx).
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Public+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-brand-bg text-brand-text font-body antialiased min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-gold opacity-5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 py-20 max-w-lg">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-brand-gold mb-4">
            Error · Card Not Found
          </span>
          <h1 className="font-display font-bold text-7xl md:text-8xl leading-none tracking-wide mb-6">
            404
          </h1>
          <h2 className="font-display font-bold text-xl md:text-2xl uppercase tracking-wide mb-4">
            This card isn&apos;t in the codex
          </h2>
          <p className="font-body text-brand-text-dim mb-10">
            The page you&apos;re looking for has been banished to the Graveyard, moved, or never existed.
          </p>
          <a href="/" className="btn-gold">
            Back to Home
          </a>
        </div>
      </body>
    </html>
  );
}
