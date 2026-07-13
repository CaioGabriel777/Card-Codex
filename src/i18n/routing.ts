import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ja', 'pt-BR'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/showcase': {
      en: '/showcase',
      ja: '/showcase',
      'pt-BR': '/vitrine',
    },
    '/card/[slug]': {
      en: '/card/[slug]',
      ja: '/card/[slug]',
      'pt-BR': '/carta/[slug]',
    },
    '/collection': {
      en: '/collection',
      ja: '/collection',
      'pt-BR': '/colecao',
    },
    '/collection/[slug]': {
      en: '/collection/[slug]',
      ja: '/collection/[slug]',
      'pt-BR': '/colecao/[slug]',
    },
    '/banlist': '/banlist',
    '/decks': '/decks',
    '/decks/[slug]': '/decks/[slug]',
  },
});

export type Locale = (typeof routing.locales)[number];
