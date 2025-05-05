// components/layout/Sidebar.tsx
import {
  Home,
  List,
  Wrench,
  Puzzle,
  Monitor,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { NavLink } from '@remix-run/react';

const sections = [
  {
    title: 'Demandes',
    icon: <List className='size-4' />,
    links: ['Nouvelles demandes', 'Liste des demandes', 'Remplir une demande'],
  },
  {
    title: 'Interventions',
    icon: <Wrench className='size-4' />,
    links: ['Liste des interventions', 'Interventions terminées'],
  },
  {
    title: 'Composants',
    icon: <Puzzle className='size-4' />,
    links: ['Liste des composants', 'Ajouter un composant'],
  },
  {
    title: 'Équipements',
    icon: <Monitor className='size-4' />,
    links: ['Liste des équipements', 'Ajouter un équipement'],
  },
  {
    title: 'Help',
    icon: <HelpCircle className='size-4' />,
    links: ['FAQs'],
  },
];

export default function Sidebar() {
  return (
    <aside className='min-h-screen w-64 space-y-6 border-r border-r-mpsi bg-white p-4'>
      {/* Logo */}
      <div className='mb-6 text-center'>
        <img src='/esi-logo.png' alt='ESI logo' className='mx-auto' />
      </div>

      {/* Dashboard */}
      <NavLink
        to='/'
        className='flex items-center gap-2 rounded-md bg-[#1D6BF3] px-3 py-2 font-medium text-white'
      >
        <Home className='size-4' />
        Dashboard
      </NavLink>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.title} className='space-y-1'>
          <div className='flex items-center gap-2 text-sm font-semibold text-mpsi'>
            {section.icon}
            {section.title}
          </div>
          <div className='space-y-1 pl-2 text-sm text-gray-700'>
            {section.links.map((link) => (
              <NavLink
                key={link}
                to='/'
                className='flex items-center gap-2 hover:text-mpsi'
              >
                <ChevronRight className='size-3.5' />
                {link}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
