import type { MetaFunction, LinksFunction } from '@remix-run/node';
import ProfileDetails from '../components/ui/ProfileDetails';
import BriefDetails from '../components/ui/BriefDetails';
import PhotoProfile from '../components/ui/PhotoProfile';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

export const meta: MetaFunction = () => [
  { title: 'MPSI Frontend - Settings / Profile' },
  { name: 'description', content: 'Edit your profile settings.' },
];

export const links: LinksFunction = () => [];

export default function SettingsProfile() {
  const user = {
    firstName: 'REHMANIA',
    lastName: 'Karim',
    email: 'k_rehamnia@esi.dz',
    imageSrc: '/user.png',
    tel: '0540896295',
    plan: 'Premium',
    preferences: 'Advanced settings enabled',
  };

  const profileDetails = {
    name: `${user.firstName} ${user.lastName}`,
    username: 'rehamnia_karim',
    email: user.email,
    password: '**********',
    dateOfBirth: '25 January 1990',
    permanentAddress: 'San Jose, California, Alger',
    country: 'Alger',
  };

  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className='flex flex-1 flex-col'>
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <div className='min-h-full bg-white p-6'>
          <h1 className='mb-6 text-xl font-semibold text-blue-500'>Profile</h1>
          <div className='flex justify-center gap-6'>
            <div className='flex w-1/4 flex-col gap-6'>
              <PhotoProfile
                firstName={user.firstName}
                lastName={user.lastName}
                email={user.email}
                imageSrc={user.imageSrc}
                onEditClick={() => console.log('Edit photo clicked')}
              />

              <BriefDetails
                name={`${user.firstName} ${user.lastName}`}
                email={user.email}
                tel={user.tel}
                plan={user.plan}
                preferences={user.preferences}
              />
            </div>
            <div className='w-3/4'>
              <ProfileDetails initialData={profileDetails} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
