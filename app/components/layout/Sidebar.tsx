import {
  Home,
  List,
  Wrench,
  Puzzle,
  Monitor,
  HelpCircle,
  ChevronRight,
  Users,
} from 'lucide-react';
import { NavLink } from '@remix-run/react';

const sections = [
  {
    title: 'Demandes',
    icon: <List className='size-4' />,
    links: [
      { name: 'Nouvelles demandes', path: '/demandes' },
      { name: 'Liste des demandes', path: '/demandes/all' },
      { name: 'Remplir une demande', path: '/demandes/new' },
    ],
  },
  {
    title: 'Interventions',
    icon: <Wrench className='size-4' />,
    links: [
      { name: 'Liste des interventions', path: '/interventions' },
      { name: 'Interventions terminées', path: '/interventions/done' },
    ],
  },
  {
    title: 'Composants',
    icon: <Puzzle className='size-4' />,
    links: [
      { name: 'Liste des composants', path: '/composants' },
      { name: 'Ajouter un composant', path: '/composants/new' }, // Updated to correct path
    ],
  },
  {
    title: 'Équipements',
    icon: <Monitor className='size-4' />,
    links: [
      { name: 'Liste des équipements', path: '/equipements' }, // Placeholder, update if needed
      { name: 'Ajouter un équipement', path: '/equipements/new' }, // Placeholder, update if needed
    ],
  },
  {
    title: 'Help',
    icon: <HelpCircle className='size-4' />,
    links: [
      { name: 'FAQs', path: '/faq' }, // Placeholder, update if needed
    ],
  },
  {
    title: 'Utilisateurs',
    icon: <Users className='size-4' />,
    links: [{ name: 'Liste des utilisateurs', path: '/users' }],
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
        to='/dashboard'
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
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 hover:text-mpsi ${
                    isActive ? 'text-mpsi font-semibold' : ''
                  }`
                }
                end
              >
                <ChevronRight className='size-3.5' />
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
