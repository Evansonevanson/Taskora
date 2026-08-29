import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/theme-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://taskora.app'),
  title: 'Taskora — Client Task & Deliverable Management',
  description:
    'Manage client tasks, deliverables, project files, feedback, and revisions in one secure workspace with Taskora.',
  openGraph: {
    title: 'Taskora — Client Task & Deliverable Management',
    description:
      'Manage client tasks, deliverables, project files, feedback, and revisions in one secure workspace with Taskora.',
    url: 'https://taskora.app',
    siteName: 'Taskora',
    images: [
      {
        url: '/brand/logo-icon-square.png',
        width: 512,
        height: 512,
        alt: 'Taskora Logo',
      },
    ],
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/brand/logo-icon.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('taskora-theme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (!stored && systemDark) || (stored === 'system' && systemDark);
    var root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-[var(--color-bg)] font-sans text-[var(--color-text-primary)] antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
