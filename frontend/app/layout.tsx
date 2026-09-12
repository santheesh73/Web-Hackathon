import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'LIFE RPG — Real-Life Productivity Gamification',
    template: '%s | LIFE RPG',
  },
  description:
    'Transform real-life goals, habits, and tasks into an immersive RPG progression ecosystem featuring XP, non-linear levels, streaks, attributes, quest chains, epic boss battles, and rewards.',
  keywords: [
    'LIFE RPG',
    'Gamified Productivity',
    'Habit Tracker RPG',
    'Goal Progression',
    'Gamification',
    'Task Management',
    'RPG Habit System',
  ],
  authors: [{ name: 'LIFE RPG Team' }],
  creator: 'LIFE RPG',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'LIFE RPG — Real-Life Productivity Gamification',
    description:
      'Transform real-life goals, habits, and tasks into an immersive RPG progression ecosystem.',
    siteName: 'LIFE RPG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LIFE RPG — Real-Life Productivity Gamification',
    description:
      'Transform real-life goals, habits, and tasks into an immersive RPG progression ecosystem.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
