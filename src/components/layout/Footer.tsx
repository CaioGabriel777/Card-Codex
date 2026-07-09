import { getTranslations } from 'next-intl/server';

const GITHUB_URL = 'https://github.com/CaioGabriel777/Card-Codex';

/**
 * Site footer with branding, disclaimer and a link to the open-source repo.
 */
export default async function Footer() {
  const t = await getTranslations('footer');

  return (
    <footer className="border-t border-brand-border">
      <div className="container-max py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
          <span className="font-display font-bold text-sm tracking-[0.15em]">
            <span className="text-brand-text">CARD</span>{' '}
            <span className="text-brand-gold">CODEX</span>
          </span>
          <span className="font-mono text-[0.7rem] text-brand-text-dim">
            © {new Date().getFullYear()} · {t('disclaimer')}
          </span>
        </div>

        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-[0.8rem] text-brand-text-dim hover:text-brand-gold transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
            />
          </svg>
          {t('openSource')}
        </a>
      </div>
    </footer>
  );
}
