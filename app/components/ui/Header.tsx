import SignIn from './SignIn';
import PreviousAccounts from './PrevuiosAccounts';

export default function Header() {
  return (
    <div className='relative'>
      <div className='h-screen'>
        <div className='relative h-2/5 bg-blue-500'>
          <div className='absolute left-16 top-16 z-10'>
            <img src='/esi.png' alt='ESI Logo' className='mb-4 h-20' />
            <h1 className='mb-2 text-4xl font-bold text-white'>Sign in to</h1>
            <h2 className='mb-2 text-2xl text-white'>
              Système de gestion de maintenance
            </h2>
            <p className='max-w-md text-white opacity-90'>
              Plateforme dédiée à la gestion, au suivi et à l&apos;optimisation
              des demandes de maintenance au sein de l&apos;ESI.
            </p>
          </div>

          <div className='absolute right-1/3 top-1/4 z-10 mb-8 mr-12'>
            <img
              src='/saroukh.png'
              alt='Illustration de fusée'
              className='h-64'
            />
          </div>
        </div>

        <div className='relative h-3/5 bg-white'>
          <div className='absolute left-16 top-6 z-10'>
            <PreviousAccounts />
          </div>
        </div>
      </div>

      <div className='absolute right-16 top-1/2 z-20 -translate-y-1/2'>
        <SignIn />
      </div>
    </div>
  );
}
