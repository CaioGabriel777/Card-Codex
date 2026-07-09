<div align="center">
  <h1 align="center">CardCodex</h1>
  <p align="center">
    A modern Yu-Gi-Oh! card catalog and showcase application built with Next.js and Prisma.
  </p>
</div>

<br />

<p align="center">
  <img src="public/showcase.png" alt="CardCodex showcase page" width="100%" />
</p>
<p align="center">
  <img src="public/obelisk-the-tormentor.png" alt="CardCodex card detail page" width="100%" />
</p>

## 🌟 About The Project

CardCodex is a comprehensive Yu-Gi-Oh! card catalog designed to provide a rich, interactive experience for collectors and players. It features detailed card showcases, a premium holographic tilt effect for card previews, rulings, related cards, and deck usage statistics. The application is fully localized (i18n), with English as the default locale alongside Japanese and Portuguese (pt-BR) — including per-locale routes (e.g. `/en/showcase` vs `/pt-BR/vitrine`) for better SEO.

> **Disclaimer:** This is an unofficial fan project. Yu-Gi-Oh! is a trademark of Konami. Card data and images are sourced live from the [YGOPRODeck API](https://ygoprodeck.com/api-guide/) and are neither redistributed nor stored as static assets in this repository.

## ✨ Features

- **Interactive Card Showcase:** Premium UI with holographic tilt effects (`CardTilt`) for an immersive experience.
- **Instant Card Search:** Debounced typeahead in the header and homepage — start typing a card name (in any supported language) and matching cards appear with a thumbnail preview.
- **Detailed Card Information:** Access complete stats, effects, pricing history, and community rulings.
- **Working Showcase Filters:** Filter by card type, combinable with a full-text search query, all reflected in the URL.
- **Internationalization (i18n):** Full support for English (default), Japanese, and Portuguese (pt-BR) locales, with localized routes per language.
- **Automated Data Sync:** Integrates with YGOPRODeck API utilizing a Stale-While-Revalidate pattern for up-to-date pricing and data.
- **Dockerized Environment:** Fully containerized setup ensuring reproducible builds and a smooth developer experience.

## 🛠️ Built With

This project is built using modern web development standards and technologies:

- **[Next.js 15 (App Router)](https://nextjs.org/)** - React Framework
- **[Tailwind CSS v3](https://tailwindcss.com/)** - Utility-first styling
- **[Prisma ORM](https://www.prisma.io/)** - Type-safe database interactions
- **PostgreSQL** - Relational database
- **[next-intl](https://next-intl.dev/)** - Internationalization and localized routing

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Docker and Docker Compose installed on your machine.

### Installation (Recommended via Docker)

This is the recommended approach as it ensures all dependencies (like PostgreSQL) are isolated and match the production environment. It also comes pre-configured with hot-reloading.

1. Clone the repository
   ```bash
   git clone https://github.com/CaioGabriel777/Card-Codex.git
   cd Card-Codex
   ```

2. Copy the environment variables example file
   ```bash
   cp .env.example .env
   ```

3. Start the development environment
   ```bash
   npm run docker:up
   ```

The application will now be running at `http://localhost:3000`. This command builds the image, starts the Postgres database, runs database migrations and seed scripts, and starts the Next.js development server.

To stop the containers, simply run:
```bash
npm run docker:down
```

### Manual Installation (Local Node + Postgres)

If you prefer to run the application natively without Docker:

1. Ensure you have a running PostgreSQL instance.
2. Copy `.env.example` to `.env` and update the `DATABASE_URL` with your connection string.
3. Install NPM packages:
   ```bash
   npm install
   ```
4. Push the Prisma schema to your database and run the seed script:
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 Available Scripts

In the project directory, you can run the following scripts defined in `package.json`:

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server locally |
| `npm run build` | Builds the app for production |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint |
| `npm run db:push` | Pushes the Prisma schema state to the database |
| `npm run db:migrate` | Creates and applies a new Prisma migration |
| `npm run db:generate` | Generates the Prisma Client |
| `npm run db:seed` | Populates the database with initial sample data |
| `npm run db:studio` | Opens Prisma Studio to view and edit database records |
| `npm run docker:up` | Boots up the entire Docker stack (Postgres + Next.js dev server) |
| `npm run docker:down` | Tears down the Docker stack |

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the [PolyForm Shield 1.0.0](./LICENSE) License. You are free to read, run, and modify this code for any purpose that doesn't compete with the product this repository provides.

## 🙏 Acknowledgements

- Data provided by the amazing [YGOPRODeck API](https://ygoprodeck.com/).
