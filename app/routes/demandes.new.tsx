import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import Layout from '~/components/layout/Layout';
import { useState } from 'react';

export default function RemplirDemandePage() {
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-4xl px-4 md:px-0'>
        <div className='rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
          <h2 className='mb-6 text-center text-xl font-bold text-[#1D6BF3]'>
            Remplir une demande
          </h2>

          <form className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
            {/* Nom déposant */}
            <div className='w-full'>
              <label
                htmlFor='nom'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Nom déposant (e)
              </label>
              <Input
                id='nom'
                placeholder='Entrez votre nom'
                className='w-full'
              />
            </div>

            {/* Panne déclarée */}
            <div className='w-full'>
              <label
                htmlFor='panne-declaree'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Panne déclarée
              </label>
              <textarea
                id='panne-declaree'
                rows={1}
                placeholder='Décrivez le problème'
                className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Email */}
            <div className='w-full'>
              <label
                htmlFor='email'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Email
              </label>
              <Input
                id='email'
                type='email'
                placeholder='votre.email@esi.dz'
                className='w-full'
              />
            </div>

            {/* Type matériel */}
            <div className='w-full'>
              <label
                htmlFor='type-materiel'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Type matériel
              </label>
              <select
                id='type-materiel'
                className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Sélectionner un type</option>
                <option value='ordinateur'>Ordinateur</option>
                <option value='imprimante'>Imprimante</option>
                <option value='ecran'>Écran</option>
                <option value='tablette'>Tablette</option>
              </select>
            </div>

            {/* Marque et référence */}
            <div className='w-full'>
              <label
                htmlFor='marque'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Marque et référence
              </label>
              <Input
                id='marque'
                placeholder='Ex: Dell Latitude 5420'
                className='w-full'
              />
            </div>

            {/* Date acquisition */}
            <div className='w-full'>
              <label
                htmlFor='date-acquisition'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Date d&apos;acquisition
              </label>
              <Input id='date-acquisition' type='date' className='w-full' />
            </div>

            {/* N° série */}
            <div className='w-full'>
              <label
                htmlFor='numero-serie'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                N° série
              </label>
              <Input
                id='numero-serie'
                placeholder='Numéro de série'
                className='w-full'
              />
            </div>

            {/* Priorité */}
            <div className='w-full'>
              <label
                htmlFor='priorite'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Priorité
              </label>
              <select
                id='priorite'
                className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Sélectionner une priorité</option>
                <option value='haute'>Haute</option>
                <option value='moyenne'>Moyenne</option>
                <option value='basse'>Basse</option>
              </select>
            </div>

            {/* N° inventaire */}
            <div className='w-full'>
              <label
                htmlFor='numero-inventaire'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                N° d&apos;inventaire
              </label>
              <Input
                id='numero-inventaire'
                placeholder="Numéro d'inventaire"
                className='w-full'
              />
            </div>

            {/* Service d'affectation */}
            <div className='w-full'>
              <label
                htmlFor='service'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Service d&apos;affectation
              </label>
              <select
                id='service'
                className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Sélectionner un service</option>
                <option value='informatique'>Service Informatique</option>
                <option value='administratif'>Service Administratif</option>
                <option value='pedagogique'>Service Pédagogique</option>
                <option value='technique'>Service Technique</option>
              </select>
            </div>
          </form>

          {/* Button */}
          <div className='mt-10 flex justify-center'>
            <Button
              className='bg-[#1D6BF3] px-8 hover:bg-blue-700'
              onClick={() => setShowSuccess(true)}
            >
              Enregistrer
            </Button>
          </div>

          {/* ✅ Success Modal */}
          {showSuccess && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm'>
              <div className='w-[90%] max-w-lg rounded-lg border border-blue-400 bg-white p-8 text-center shadow-lg'>
                <img
                  src='/check.png'
                  alt='Success'
                  className='mx-auto mb-4 w-14'
                />
                <h3 className='mb-2 text-lg font-semibold text-black'>
                  Demande enregistrée avec succès
                </h3>
                <p className='mb-6 text-sm text-gray-600'>
                  Un email a été envoyé à{' '}
                  <span className='font-medium'>kn_bouzidi@esi.dz</span> pour
                  l&apos;informer.
                </p>
                <Button
                  onClick={() => setShowSuccess(false)}
                  className='mx-auto bg-[#1D6BF3] hover:bg-blue-700'
                >
                  OK
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
