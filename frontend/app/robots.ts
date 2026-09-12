import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/signup'],
        disallow: [
          '/dashboard',
          '/quests/',
          '/character',
          '/character-creation',
          '/skill-tree',
          '/achievements',
          '/shop',
          '/inventory',
          '/history',
          '/boss-quests/',
          '/api/',
        ],
      },
    ],
    sitemap: 'http://localhost:3000/sitemap.xml',
  };
}
