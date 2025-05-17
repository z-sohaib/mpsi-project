import type { MetaFunction, LinksFunction } from '@remix-run/node';
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
      <Header />
    </div>
  );
}
