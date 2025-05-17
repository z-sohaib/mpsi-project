// Fixed Header.tsx
import SignIn from './SignIn';

export default function Header() {
  return (
    <header
      className='relative h-96 overflow-hidden bg-blue-500'
      style={{
        backgroundImage: "url('/back.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className='absolute left-16 top-16 z-10 flex items-start space-x-5'>
        <div>
          <img src='/esi.png' alt='ESI Logo' className='mb-4 h-20' />
          <h1 className='mb-2 text-4xl font-bold text-white'>
            Système de gestion de maintenance
          </h1>
          <h2 className='mb-2 text-2xl italic text-white'>
            École Nationale Supérieure d&apos;Informatique (ESI)
          </h2>
          <p className='max-w-md text-white opacity-90'>
            Plateforme dédiée à la gestion, au suivi et à l&apos;optimisation
            des demandes de maintenance au sein de l&apos;ESI.
          </p>
        </div>

        <img src='/saroukh.png' alt='Illustration de fusée' className='h-80' />
      </div>

      <div className='absolute right-16 top-1/2 z-20 -translate-y-1/2'>
        <SignIn />
      </div>
    </header>
  );
}
