import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ygoprodeck.com",
        pathname: "/images/cards/**",
      },
      {
        protocol: "https",
        hostname: "images.ygoprodeck.com",
        pathname: "/images/cards_small/**",
      },
      {
        protocol: "https",
        hostname: "images.ygoprodeck.com",
        pathname: "/images/cards_cropped/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  output: "standalone" as const,
};

export default withNextIntl(nextConfig);