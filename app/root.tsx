import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { MotionConfig } from 'framer-motion';
import { getUser } from './session.server';

// Import console overrides to silence extension warnings
import './utils/console-overrides';

import './styles/tailwind.css';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ user: await getUser(request) });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        {/* Add a meta tag to silence extension resource warnings */}
        <meta
          name='ext-silence-resources'
          content='pbcpfbcibpcbfbmddogfhcijfpboeaaf'
        />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning={true}>
        {/* The suppressHydrationWarning already helps with this kind of warning */}
        <MotionConfig reducedMotion='user'>{children}</MotionConfig>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
