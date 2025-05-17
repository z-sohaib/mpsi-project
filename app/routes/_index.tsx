import type { MetaFunction } from '@remix-run/node';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Demande de Réparation - ESI' },
    {
      name: 'description',
      content: 'Formulaire de demande de réparation pour matériel informatique',
    },
  ];
};

export default function Repair() {
  // State for form data and modal
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    type: '',
    ref: '',
  });
  const [showModal, setShowModal] = useState(false);

  // Handle all input changes
  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Handle form submit
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowModal(true);
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-white font-sans'>
      {/* Top half blue background */}
      <div className='absolute left-0 top-0 z-0 h-[48%] w-full bg-[#007bff]' />

      {/* Man Illustration - enlarged and shifted right */}
      <img
        src='/kahina/illus.png'
        alt='Illustration'
        className='absolute bottom-0  left-10 z-0 h-72 w-[500px] md:w-[540px]'
      />

      {/* Curve - bottom right behind form */}
      <img
        src='/kahina/curve.png'
        alt='curve'
        className='absolute -right-8 bottom-0 z-0 h-64 w-40'
      />

      {/* Top-left welcome content */}
      <div className='absolute left-7 top-4 z-10 max-w-md text-white'>
        <img src='/kahina/esi.png' alt='ESI Logo' className='mb-4 w-20' />
        <h1 className='mb-2 text-3xl font-bold'>
          Bienvenue au Service Maintenance
        </h1>
        <p className=' w-96 text-sm font-thin leading-relaxed'>
          Un problème technique ? Signalez-le ici et bénéficiez d&apos;une prise
          en charge rapide avec suivi en temps réel de votre demande !
        </p>
      </div>

      {/* Form */}
      <div className='relative z-10 flex min-h-screen items-center justify-end  pr-6'>
        <div className='relative w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl'>
          <h2 className='mb-8 text-center text-3xl font-bold text-[#007bff]'>
            Demande de réparation
          </h2>

          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='flex flex-col gap-6 md:flex-row'>
              {/* Left Column - Inputs */}
              <div className='flex w-full flex-col gap-4 md:w-1/2'>
                <div>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='name'
                  >
                    Nom déposant (e)
                  </label>
                  <input
                    type='text'
                    name='name'
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder='Veuillez entrer votre nom'
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  />
                </div>

                <div>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='email'
                  >
                    Email
                  </label>
                  <input
                    type='email'
                    name='email'
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder='Veuillez entrer votre email'
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  />
                </div>

                <div>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='type'
                  >
                    Type matériel
                  </label>
                  <input
                    type='text'
                    required
                    name='type'
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder='Ordinateur'
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  />
                </div>

                <div>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='ref'
                  >
                    Marque et référence
                  </label>
                  <input
                    type='text'
                    name='ref'
                    required
                    value={formData.ref}
                    onChange={handleInputChange}
                    placeholder='DELL Inspiron 15'
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  />
                </div>
              </div>

              {/* Right Column - Description (now required) */}
              <div className='w-full md:w-1/2'>
                <label
                  className='mb-1 block text-sm font-medium text-black'
                  htmlFor='description'
                >
                  Description de la panne *
                </label>
                <textarea
                  name='description'
                  rows={10}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Décrivez en détail la panne que vous rencontrez...'
                  className='h-[92%] w-full resize-none rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  required
                />
                <p className='mt-1  text-xs font-light text-gray-500'>
                  Ce champ est obligatoire*{' '}
                </p>
              </div>
            </div>

            {/* Submit button */}
            <div className='mt-4 text-center'>
              <button
                type='submit'
                className='rounded-md bg-[#007bff] px-6 py-2 font-semibold text-white shadow-md hover:bg-[#005fd3]'
              >
                Envoyer demande
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal Popup */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black opacity-40'>
          <div className='w-full max-w-md animate-[fadeIn_0.3s_ease-out_forwards] rounded-xl bg-white p-3 text-center shadow-lg'>
            {/* Check icon */}
            <div className='mb-6 flex justify-center'>
              <img
                src='/kahina/check.png'
                alt='Success checkmark'
                className='size-20 animate-[bounceIn_0.5s]'
              />
            </div>

            {/* Title with gradient text */}
            <h2 className='mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-3xl font-extrabold text-transparent'>
              Demande envoyée avec succès
            </h2>

            {/* Content with better spacing and styling */}
            <div className='mb-6 space-y-4'>
              <p className='text-gray-600'>
                Vous serez informé par email : <br />
                <span className='font-semibold text-gray-800'>
                  {formData.email}
                </span>
              </p>

              <div className='space-y-2 rounded-lg bg-gray-50 p-4 text-left'>
                <p className='text-gray-700'>
                  <span className='font-bold text-gray-800'>Nom:</span>{' '}
                  {formData.name}
                </p>
                <p className='text-gray-700'>
                  <span className='font-bold text-gray-800'>Description:</span>{' '}
                  {formData.description || 'Aucune description fournie'}
                </p>
                <p className='text-gray-700'>
                  <span className='font-bold text-gray-800'>Type:</span>{' '}
                  {formData.type}
                </p>
                <p className='text-gray-700'>
                  <span className='font-bold text-gray-800'>Référence:</span>{' '}
                  {formData.ref}
                </p>
              </div>
            </div>

            {/* OK button with better styling */}
            <button
              onClick={() => setShowModal(false)}
              className='rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-blue-700'
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
