import type { MetaFunction } from '@remix-run/node';
import { useState, useEffect } from 'react';

export const meta: MetaFunction = () => [
  { title: 'Demande de Réparation - ESI' },
  {
    name: 'description',
    content: 'Formulaire de demande de réparation pour matériel informatique',
  },
];

export default function Repair() {
  // State for form data and modal
  const [formData, setFormData] = useState({
    nom_deposant: '',
    panne_declaree: '',
    email: '',
    marque: '',
    numero_telephone: '',
    service_affectation: '',
    status: 'Etudiant',
    type_materiel: 'Ordinateur',
    numero_inventaire: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [modalAnimation, setModalAnimation] = useState('scale-0 opacity-0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle modal animations
  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        setModalAnimation('scale-100 opacity-100');
      }, 50);
    } else {
      setModalAnimation('scale-0 opacity-0');
    }
  }, [showModal]);

  // Handle all input changes
  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Handle form submit
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowModal(true);
  }

  // Submit data to API and reset form
  async function submitFormData() {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Make the request without an Authorization header since the backend allows anonymous access
      const response = await fetch(
        'https://itms-mpsi.onrender.com/api/demandes/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Remove Authorization header since the backend is using permissions.AllowAny
          },
          body: JSON.stringify({
            ...formData,
            status_demande: 'Nouvelle',
          }),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.detail ||
            `Error ${response.status}: ${response.statusText}`,
        );
      }

      // Reset form after successful submission
      setFormData({
        nom_deposant: '',
        panne_declaree: '',
        email: '',
        marque: '',
        numero_telephone: '',
        service_affectation: '',
        status: 'Etudiant',
        type_materiel: 'Ordinateur',
        numero_inventaire: '',
      });

      closeModal();
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
      setTimeout(closeModal, 3000);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Close modal with animation
  function closeModal() {
    setModalAnimation('scale-0 opacity-0');
    setTimeout(() => {
      setShowModal(false);
    }, 300);
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-white font-sans'>
      {/* Top half blue background */}
      <div className='absolute left-0 top-0 z-0 h-[48%] w-full bg-[#007bff]' />

      {/* Man Illustration - enlarged and shifted right */}
      <img
        src='/kahina/illus.png'
        alt='Illustration'
        className='absolute bottom-0 left-10 z-0 h-72 w-[500px] md:w-[540px]'
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
        <p className='w-96 text-sm font-thin leading-relaxed'>
          Un problème technique ? Signalez-le ici et bénéficiez d’une prise en
          charge rapide avec suivi en temps réel de votre demande !
        </p>
      </div>

      {/* Form */}
      <div className='relative z-10 flex min-h-screen items-center justify-end pr-6'>
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
                    htmlFor='nom_deposant'
                  >
                    Nom déposant (e)
                  </label>
                  <input
                    type='text'
                    name='nom_deposant'
                    required
                    value={formData.nom_deposant}
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
                    htmlFor='numero_telephone'
                  >
                    Numéro de téléphone
                  </label>
                  <input
                    type='tel'
                    name='numero_telephone'
                    required
                    value={formData.numero_telephone}
                    onChange={handleInputChange}
                    placeholder='0617392646'
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  />
                </div>

                <div>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='status'
                  >
                    Status
                  </label>
                  <select
                    name='status'
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  >
                    <option value='Etudiant'>Etudiant</option>
                    <option value='Enseignant'>Enseignant</option>
                    <option value='Employe'>Employe</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className='flex w-full flex-col gap-4 md:w-1/2'>
                <div>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='type_materiel'
                  >
                    Type de matériel
                  </label>
                  <select
                    name='type_materiel'
                    required
                    value={formData.type_materiel}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  >
                    <option value='Ordinateur'>Ordinateur</option>
                    <option value='Imprimante'>Imprimante</option>
                    <option value='Serveur'>Serveur</option>
                    <option value='Autre'>Autre</option>
                  </select>
                </div>

                <div>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='numero_inventaire'
                  >
                    Numéro d’inventaire
                  </label>
                  <input
                    type='text'
                    name='numero_inventaire'
                    required
                    value={formData.numero_inventaire}
                    onChange={handleInputChange}
                    placeholder='Entrez le numéro d’inventaire'
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  />
                </div>

                <div>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='marque'
                  >
                    Marque et référence
                  </label>
                  <input
                    type='text'
                    name='marque'
                    value={formData.marque}
                    onChange={handleInputChange}
                    placeholder='DELL Inspiron 15'
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  />
                </div>

                <div>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='service_affectation'
                  >
                    Lieu de la panne
                  </label>
                  <input
                    type='text'
                    name='service_affectation'
                    required
                    value={formData.service_affectation}
                    onChange={handleInputChange}
                    placeholder='Bloc pedagogique'
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  />
                </div>

                <div className='grow'>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='panne_declaree'
                  >
                    Description de la panne *
                  </label>
                  <textarea
                    name='panne_declaree'
                    rows={6}
                    value={formData.panne_declaree}
                    onChange={handleInputChange}
                    placeholder='Décrivez en détail la panne que vous rencontrez...'
                    className='h-[92%] w-full resize-none rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                    required
                  />
                  <p className='mt-1 text-xs font-light text-gray-500'>
                    Ce champ est obligatoire*{' '}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className='mt-4 text-center'>
              <button
                type='submit'
                className='rounded-md bg-[#007bff] px-6 py-2 font-semibold text-white shadow-md transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-[#005fd3]'
              >
                Envoyer demande
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modern Success Modal Popup with minimalist design */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300'>
          <div
            className={`w-full max-w-lg rounded-xl border border-blue-100 bg-white p-8 shadow-lg transition-all duration-300 ${modalAnimation}`}
          >
            {/* Blue Check Icon */}
            <div className='mb-8 flex justify-center'>
              <div className='flex size-24 items-center justify-center rounded-full bg-[#0088ff]'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='size-12 animate-[fadeIn_0.5s_ease-out_forwards] text-white'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
            </div>

            {/* Simple Black Title */}
            <h2 className='mb-5 text-center text-4xl font-bold text-black'>
              {submitError ? 'Erreur' : 'Demande envoyée avec succès'}
            </h2>

            {/* Simple Email Info */}
            {!submitError && (
              <div className='mb-12 text-center'>
                <p className='text-lg text-gray-500'>
                  Vous serez informé par email
                </p>
                <p className='text-lg text-gray-500'>{formData.email}</p>
              </div>
            )}

            {/* Error Message if any */}
            {submitError && (
              <div className='mb-4 rounded-md bg-red-50 p-3 text-center text-red-600'>
                {submitError}
              </div>
            )}

            {/* Simple OK Button */}
            <div className='flex justify-center'>
              <button
                onClick={submitFormData}
                disabled={isSubmitting}
                className='w-full rounded-lg bg-[#0088ff] py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-[#0077ee] disabled:bg-gray-400'
              >
                {isSubmitting ? 'Envoi en cours...' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
