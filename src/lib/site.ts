/** Canonical public URL (no trailing slash), used to build absolute URLs for metadata, sitemap.xml, and robots.txt. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
