import type { MetaFunction, LinksFunction } from '@remix-run/node';
import PreviousAccounts from '../components/ui/PrevuiosAccounts';
import Header from '../components/ui/Header';

export const meta: MetaFunction = () => [
  { title: 'ESI – Système de gestion de maintenance' },
  {
    name: 'description',
    content:
      'Connectez-vous à la plateforme de gestion de maintenance de l’ESI.',
  },
];

export const links: LinksFunction = () => [
  // si vous avez des styles ou fonts supplémentaires, importez-les ici
  // { rel: 'stylesheet', href: '/build/tailwind.css' },
];

export default function Auth() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Banner */}
      <Header />

      {/* Main content */}
      <div className='mx-auto max-w-7xl bg-white px-4 py-8 lg:flex lg:space-x-8'>
        {/* Left column: previous accounts */}
        <div className='space-y-6 lg:w-1/2'>
          <PreviousAccounts />
        </div>

        {/* Right column: sign-in form */}
      </div>
    </div>
  );
}
