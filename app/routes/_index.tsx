import type { MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import { useState, useEffect } from 'react';
import { useFetcher, Link } from '@remix-run/react';
import { json } from '@remix-run/node';

export const meta: MetaFunction = () => [
  { title: 'Demande de Réparation - ESI' },
  {
    name: 'description',
    content: 'Formulaire de demande de réparation pour matériel informatique',
  },
];

// Action function to handle form submission
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();

    // Extract form values
    const nom_deposant = formData.get('nom_deposant') as string;
    const panne_declaree = formData.get('panne_declaree') as string;
    const email = formData.get('email') as string;
    const marque = formData.get('marque') as string;
    const numero_telephone = formData.get('numero_telephone') as string;
    const service_affectation = formData.get('service_affectation') as string;
    const status = formData.get('status') as string;
    const type_materiel = formData.get('type_materiel') as string;
    const numero_inventaire = formData.get('numero_inventaire') as string;

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!nom_deposant) errors.nom_deposant = 'Le nom du déposant est requis';
    if (!panne_declaree)
      errors.panne_declaree = 'La panne déclarée est requise';
    if (!email) errors.email = "L'email est requis";
    if (!marque) errors.marque = 'La marque est requise';
    if (!numero_telephone)
      errors.numero_telephone = 'Le numéro de téléphone est requis';
    if (!service_affectation)
      errors.service_affectation = "Le service d'affectation est requis";
    if (!type_materiel) errors.type_materiel = 'Le type de matériel est requis';

    if (Object.keys(errors).length > 0) {
      return json({ errors, success: false }, { status: 400 });
    }

    // Make the request to the API
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/demandes/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom_deposant,
          panne_declaree,
          email,
          marque,
          numero_telephone,
          service_affectation,
          status: status || 'Etudiant',
          type_materiel,
          numero_inventaire,
          status_demande: 'Nouvelle',
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `Error ${response.status}: ${response.statusText}`,
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error submitting demande:', error);
    return json(
      {
        errors: {
          form:
            error instanceof Error
              ? error.message
              : 'Une erreur est survenue lors de la création de la demande',
        },
        success: false,
      },
      { status: 500 },
    );
  }
}

interface FetcherData {
  success?: boolean;
  errors?: Record<string, string>;
}

export default function Repair() {
  // Use a fetcher instead of useState for form data
  const fetcher = useFetcher<FetcherData>();
  const [showModal, setShowModal] = useState(false);
  const [modalAnimation, setModalAnimation] = useState('scale-0 opacity-0');

  // Modal animations
  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        setModalAnimation('scale-100 opacity-100');
      }, 50);
    } else {
      setModalAnimation('scale-0 opacity-0');
    }
  }, [showModal]);

  // Show success modal when submission is successful
  useEffect(() => {
    if (fetcher.data?.success && !showModal) {
      setShowModal(true);
    }
  }, [fetcher.data, showModal]);

  // Handle form reset
  const resetForm = () => {
    // Close modal first
    closeModal();
    // Reset form
    fetcher.submit({}, { method: 'GET' });
  };

  // Close modal with animation
  function closeModal() {
    setModalAnimation('scale-0 opacity-0');
    setTimeout(() => {
      setShowModal(false);
    }, 300);
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-white font-sans'>
      {/* Top half blue background - reduced height */}
      <div className='absolute left-0 top-0 z-0 h-2/5 w-full bg-[#007bff]' />

      {/* Employee access button */}
      <div className='absolute left-28 top-6 z-20'>
        <Link
          to='/auth'
          className='flex items-center rounded-md bg-white px-4 py-2 font-medium text-[#007bff] shadow-md transition-all hover:bg-blue-50'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='mr-2 size-5'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
            <circle cx='9' cy='7' r='4' />
            <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
            <path d='M16 3.13a4 4 0 0 1 0 7.75' />
          </svg>
          Accès employé
        </Link>
      </div>

      {/* Man Illustration - positioned lower */}
      <img
        src='/kahina/illus.png'
        alt='Illustration'
        className='absolute bottom-0 left-10 z-0 h-64 w-[420px] md:w-[460px]'
      />

      {/* Curve - bottom right behind form */}
      <img
        src='/kahina/curve.png'
        alt='curve'
        className='absolute -right-8 bottom-0 z-0 h-64 w-40'
      />

      {/* Top-left welcome content - slightly smaller */}
      <div className='absolute left-7 top-4 z-10 max-w-md text-white'>
        <img src='/kahina/esi.png' alt='ESI Logo' className='mb-3 w-16' />
        <h1 className='mb-2 text-2xl font-bold'>
          Bienvenue au Service Maintenance
        </h1>
        <p className='w-80 text-xs font-thin leading-relaxed md:text-sm'>
          Un problème technique ? Signalez-le ici et bénéficiez d&apos;une prise
          en charge rapide avec suivi en temps réel de votre demande !
        </p>
      </div>

      {/* Form - positioned at right center */}
      <div className='flex min-h-screen items-center justify-end pr-6 md:pr-12 lg:pr-24'>
        <div className='relative w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl sm:p-6 md:p-8'>
          <h2 className='mb-4 text-center text-2xl font-bold text-[#007bff] sm:text-3xl'>
            Demande de réparation
          </h2>

          <fetcher.Form method='post' className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4 md:flex-row'>
              {/* Left Column - Inputs with reduced spacing */}
              <div className='flex w-full flex-col gap-3 md:w-1/2'>
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
                    placeholder='Veuillez entrer votre nom'
                    className={`w-full rounded-md border ${fetcher.data?.errors?.nom_deposant ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]`}
                  />
                  {fetcher.data?.errors?.nom_deposant && (
                    <p className='mt-1 text-xs text-red-500'>
                      {fetcher.data.errors.nom_deposant}
                    </p>
                  )}
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
                    placeholder='Veuillez entrer votre email'
                    className={`w-full rounded-md border ${fetcher.data?.errors?.email ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]`}
                  />
                  {fetcher.data?.errors?.email && (
                    <p className='mt-1 text-xs text-red-500'>
                      {fetcher.data.errors.email}
                    </p>
                  )}
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
                    placeholder='0617392646'
                    className={`w-full rounded-md border ${fetcher.data?.errors?.numero_telephone ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]`}
                  />
                  {fetcher.data?.errors?.numero_telephone && (
                    <p className='mt-1 text-xs text-red-500'>
                      {fetcher.data.errors.numero_telephone}
                    </p>
                  )}
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
                    defaultValue='Etudiant'
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]'
                  >
                    <option value='Etudiant'>Etudiant</option>
                    <option value='Enseignant'>Enseignant</option>
                    <option value='Employe'>Employe</option>
                  </select>
                </div>
              </div>

              {/* Right Column with reduced spacing */}
              <div className='flex w-full flex-col gap-3 md:w-1/2'>
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
                    defaultValue='Ordinateur'
                    className={`w-full rounded-md border ${fetcher.data?.errors?.type_materiel ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]`}
                  >
                    <option value='Ordinateur'>Ordinateur</option>
                    <option value='Imprimante'>Imprimante</option>
                    <option value='Serveur'>Serveur</option>
                    <option value='Autre'>Autre</option>
                  </select>
                  {fetcher.data?.errors?.type_materiel && (
                    <p className='mt-1 text-xs text-red-500'>
                      {fetcher.data.errors.type_materiel}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='numero_inventaire'
                  >
                    Numéro d&apos;inventaire
                  </label>
                  <input
                    type='text'
                    name='numero_inventaire'
                    placeholder="Entrez le numéro d'inventaire"
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
                    required
                    placeholder='DELL Inspiron 15'
                    className={`w-full rounded-md border ${fetcher.data?.errors?.marque ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]`}
                  />
                  {fetcher.data?.errors?.marque && (
                    <p className='mt-1 text-xs text-red-500'>
                      {fetcher.data.errors.marque}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='service_affectation'
                  >
                    Service d&apos;affectation*
                  </label>
                  <select
                    id='service_affectation'
                    name='service_affectation'
                    className={`w-full appearance-none rounded-md border ${
                      fetcher.data?.errors?.service_affectation
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#007bff]'
                    } bg-white bg-no-repeat px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2`}
                    defaultValue=''
                  >
                    <option value='' disabled>
                      Sélectionner un service
                    </option>
                    <option value='Service comptabilité'>
                      Service comptabilité
                    </option>
                    <option value='Service Informatique'>
                      Service Informatique
                    </option>
                    <option value='Service Administratif'>
                      Service Administratif
                    </option>
                    <option value='Service Pédagogique'>
                      Service Pédagogique
                    </option>
                    <option value='Service Technique'>Service Technique</option>
                  </select>
                  {fetcher.data?.errors?.service_affectation && (
                    <p className='mt-1 text-xs text-red-500'>
                      {fetcher.data.errors.service_affectation}
                    </p>
                  )}
                </div>

                {/* Description field with reduced height */}
                <div className='grow'>
                  <label
                    className='mb-1 block text-sm font-medium text-black'
                    htmlFor='panne_declaree'
                  >
                    Description de la panne *
                  </label>
                  <textarea
                    name='panne_declaree'
                    rows={4}
                    placeholder='Décrivez en détail la panne que vous rencontrez...'
                    className={`w-full resize-none rounded-md border ${fetcher.data?.errors?.panne_declaree ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#007bff]`}
                    required
                  />
                  {fetcher.data?.errors?.panne_declaree ? (
                    <p className='mt-1 text-xs text-red-500'>
                      {fetcher.data.errors.panne_declaree}
                    </p>
                  ) : (
                    <p className='mt-1 text-xs font-light text-gray-500'>
                      Ce champ est obligatoire*{' '}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* General Form Error */}
            {fetcher.data?.errors?.form && (
              <div className='mx-auto rounded-md bg-red-50 px-4 py-2 text-center text-red-600'>
                {fetcher.data.errors.form}
              </div>
            )}

            {/* Submit button */}
            <div className='mt-4 text-center'>
              <button
                type='submit'
                disabled={fetcher.state === 'submitting'}
                className='rounded-md bg-[#007bff] px-6 py-2 font-semibold text-white shadow-md transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-[#005fd3] disabled:bg-gray-400'
              >
                {fetcher.state === 'submitting'
                  ? 'Envoi en cours...'
                  : 'Envoyer demande'}
              </button>
            </div>
          </fetcher.Form>
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
              {fetcher.data?.success ? 'Demande envoyée avec succès' : 'Erreur'}
            </h2>

            {/* Simple Email Info */}
            {fetcher.data?.success && (
              <div className='mb-12 text-center'>
                <p className='text-lg text-gray-500'>
                  Vous serez informé par email
                </p>
              </div>
            )}

            {/* Simple OK Button */}
            <div className='flex justify-center'>
              <button
                onClick={resetForm}
                className='w-full rounded-lg bg-[#0088ff] py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-[#0077ee]'
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
