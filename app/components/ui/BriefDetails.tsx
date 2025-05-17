import { useState } from 'react';
export default function BriefDetails() {
  const [afficherPreferences, setAfficherPreferences] = useState(false);

  return (
    <div className='mx-auto max-w-md rounded-2xl border border-mpsi bg-white p-6 shadow-lg'>
      <h2 className='mb-4 text-2xl font-bold text-mpsi'>Informations brèves</h2>

      <div className='space-y-2 text-gray-700'>
        <p>
          <span className='font-semibold'>Nom :</span> Random BRK
        </p>
        <p>
          <span className='font-semibold'>Email :</span> randombrk@gmail.com
        </p>
        <p>
          <span className='font-semibold'>Téléphone :</span> 0540896295
        </p>
        <p>
          <span className='font-semibold'>Plan :</span> ??
        </p>
      </div>

      <button
        className='mt-4 rounded bg-mpsi px-4 py-2 text-white hover:bg-blue-600'
        onClick={() => setAfficherPreferences(!afficherPreferences)}
      >
        {afficherPreferences
          ? 'Masquer les préférences'
          : 'Afficher les préférences'}
      </button>

      {afficherPreferences && (
        <div className='mt-4 border-t border-gray-200 pt-4'>
          <h3 className='mb-2 text-lg font-semibold text-mpsi'>Préférences</h3>
          <p>
            <span className='font-semibold'>Plan préféré :</span> hh
          </p>
        </div>
      )}
    </div>
  );
}
