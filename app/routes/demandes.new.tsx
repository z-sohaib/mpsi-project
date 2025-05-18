import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import Layout from '~/components/layout/Layout';
import { useState } from 'react';

export default function RemplirDemandePage() {
  const [showSuccess, setShowSuccess] = useState(false);
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
    status_demande: 'Nouvelle',
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id.replace('-', '_')]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const demandePayload = {
        nom_deposant: formData.nom_deposant,
        panne_declaree: formData.panne_declaree,
        email: formData.email,
        marque: formData.marque,
        numero_telephone: formData.numero_telephone,
        service_affectation: formData.service_affectation,
        status: formData.status,
        type_materiel: formData.type_materiel,
        numero_inventaire: formData.numero_inventaire,
        status_demande: formData.status_demande,
      };

      const response = await fetch(
        'https://itms-mpsi.onrender.com/api/demandes/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(demandePayload),
        },
      );

      if (response.ok) {
        setShowSuccess(true);
      } else {
        console.error(
          'Failed to submit demande:',
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error('Error submitting demande:', error);
    }
  };

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-4xl px-4 md:px-0'>
        <div className='rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
          <h2 className='mb-6 text-center text-xl font-bold text-[#1D6BF3]'>
            Remplir une demande
          </h2>

          <form
            id='demande-form'
            className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'
            onSubmit={handleSubmit}
          >
            {/* Nom déposant */}
            <div className='w-full'>
              <label
                htmlFor='nom-deposant'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Nom déposant (e)
              </label>
              <Input
                id='nom-deposant'
                placeholder='Entrez votre nom'
                className='w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                value={formData.nom_deposant}
                onChange={handleInputChange}
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
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={formData.panne_declaree}
                onChange={handleInputChange}
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
                className='w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                value={formData.email}
                onChange={handleInputChange}
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
                className='w-full appearance-none rounded-md border border-gray-300 bg-white bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YTRkNTgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==")] bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={formData.type_materiel}
                onChange={handleInputChange}
              >
                <option value='' disabled>
                  Sélectionner un type
                </option>
                <option value='Ordinateur'>Ordinateur</option>
                <option value='Imprimante'>Imprimante</option>
                <option value='Serveur'>Serveur</option>
                <option value='Autre'>Autre</option>
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
                placeholder='Ex: Brother MFC'
                className='w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                value={formData.marque}
                onChange={handleInputChange}
              />
            </div>

            {/* Numéro de téléphone */}
            <div className='w-full'>
              <label
                htmlFor='numero-telephone'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Numéro de téléphone
              </label>
              <Input
                id='numero-telephone'
                type='tel'
                placeholder='Ex: 0723456789'
                className='w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                value={formData.numero_telephone}
                onChange={handleInputChange}
              />
            </div>

            {/* N° inventaire */}
            <div className='w-full'>
              <label
                htmlFor='numero-inventaire'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                N° d’inventaire
              </label>
              <Input
                id='numero-inventaire'
                placeholder='Numéro d’inventaire'
                className='w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                value={formData.numero_inventaire}
                onChange={handleInputChange}
              />
            </div>

            {/* Service d'affectation */}
            <div className='w-full'>
              <label
                htmlFor='service-affectation'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Service d&apos;affectation
              </label>
              <select
                id='service-affectation'
                className='w-full appearance-none rounded-md border border-gray-300 bg-white bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YTRkNTgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==")] bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={formData.service_affectation}
                onChange={handleInputChange}
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
                <option value='Service Pédagogique'>Service Pédagogique</option>
                <option value='Service Technique'>Service Technique</option>
              </select>
            </div>

            {/* Type déposant */}
            <div className='w-full'>
              <label
                htmlFor='status'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Type déposant
              </label>
              <select
                id='status'
                className='w-full appearance-none rounded-md border border-gray-300 bg-white bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YTRkNTgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==")] bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value='' disabled>
                  Sélectionner un type
                </option>
                <option value='Etudiant'>Etudiant</option>
                <option value='Enseignant'>Enseignant</option>
                <option value='Employe'>Employe</option>
              </select>
            </div>
          </form>

          {/* Button */}
          <div className='mt-10 flex justify-center'>
            <Button
              className='rounded-md bg-[#1D6BF3] px-8 font-medium text-white hover:bg-blue-700'
              type='submit'
              form='demande-form'
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
                  <span className='font-medium'>{formData.email}</span> pour
                  l’informer.
                </p>
                <Button
                  onClick={() => setShowSuccess(false)}
                  className='mx-auto rounded-md bg-[#1D6BF3] font-medium text-white hover:bg-blue-700'
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
