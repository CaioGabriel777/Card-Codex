import { Link } from '@/i18n/navigation';

interface NavLink {
  href: '/showcase' | '/collection' | '/banlist' | '/decks';
  label: string;
  active: boolean;
}

interface SectionNavProps {
  links: NavLink[];
}

/** Left-sidebar section nav (Showcase/Collection/Banlist/Decks), shared across catalog pages. */
export default function SectionNav({ links }: SectionNavProps) {
  return (
    <nav className="space-y-0">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`block px-4 py-2.5 text-sm font-body no-underline transition-colors ${
            link.active
              ? 'bg-brand-gold/10 text-brand-gold border-l-2 border-brand-gold font-semibold'
              : 'text-brand-text-dim hover:text-brand-text hover:bg-brand-surface/50 border-l-2 border-transparent'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
