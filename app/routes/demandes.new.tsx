import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import Layout from '~/components/layout/Layout';
import { useState } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { requireUserId } from '~/session.server';
import { createDemande } from '~/models/demandes.server';

// Type for the action data returned to the client
type ActionData = {
  errors?: {
    nom_deposant?: string;
    panne_declaree?: string;
    email?: string;
    marque?: string;
    numero_telephone?: string;
    service_affectation?: string;
    type_materiel?: string;
    form?: string;
  };
  success?: boolean;
};

// Server action to handle form submission
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Ensure user is authenticated
    const session = await requireUserId(request);
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
    const errors: ActionData['errors'] = {};
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

    // Return errors if validation fails
    if (Object.keys(errors).length > 0) {
      return json({ errors, success: false }, { status: 400 });
    }

    // Create the payload for the API
    const demandePayload = {
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
    };

    // Use the server function to create the demande
    await createDemande(session.access, demandePayload);

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

export default function RemplirDemandePage() {
  const fetcher = useFetcher<ActionData>();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if form is submitting
  const isSubmitting = fetcher.state !== 'idle';

  // Show success modal when submission is successful
  if (fetcher.data?.success && !showSuccess) {
    setShowSuccess(true);
  }

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-4xl px-4 md:px-0'>
        <div className='rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
          <h2 className='mb-6 text-center text-xl font-bold text-[#1D6BF3]'>
            Remplir une demande
          </h2>

          {/* Display form-level errors */}
          {fetcher.data?.errors?.form && (
            <div className='mb-6 rounded-md bg-red-50 p-4 text-red-600'>
              <p>{fetcher.data.errors.form}</p>
            </div>
          )}

          <fetcher.Form
            method='post'
            className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'
          >
            {/* Nom déposant */}
            <div className='w-full'>
              <label
                htmlFor='nom_deposant'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Nom déposant (e)*
              </label>
              <Input
                id='nom_deposant'
                name='nom_deposant'
                placeholder='Entrez votre nom'
                className={`w-full rounded-md ${fetcher.data?.errors?.nom_deposant ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
              />
              {fetcher.data?.errors?.nom_deposant && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.nom_deposant}
                </p>
              )}
            </div>

            {/* Panne déclarée */}
            <div className='w-full'>
              <label
                htmlFor='panne_declaree'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Panne déclarée*
              </label>
              <textarea
                id='panne_declaree'
                name='panne_declaree'
                rows={1}
                placeholder='Décrivez le problème'
                className={`w-full rounded-md ${fetcher.data?.errors?.panne_declaree ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} px-3 py-2 text-sm focus:outline-none focus:ring-2`}
              />
              {fetcher.data?.errors?.panne_declaree && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.panne_declaree}
                </p>
              )}
            </div>

            {/* Email */}
            <div className='w-full'>
              <label
                htmlFor='email'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Email*
              </label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='votre.email@esi.dz'
                className={`w-full ${fetcher.data?.errors?.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
              />
              {fetcher.data?.errors?.email && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.email}
                </p>
              )}
            </div>

            {/* Type matériel */}
            <div className='w-full'>
              <label
                htmlFor='type_materiel'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Type matériel*
              </label>
              <select
                id='type_materiel'
                name='type_materiel'
                className={`w-full appearance-none rounded-md ${
                  fetcher.data?.errors?.type_materiel
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                } bg-white bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YTRkNTgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==")] bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2`}
                defaultValue=''
              >
                <option value='' disabled>
                  Sélectionner un type
                </option>
                <option value='Ordinateur'>Ordinateur</option>
                <option value='Imprimante'>Imprimante</option>
                <option value='Serveur'>Serveur</option>
                <option value='Autre'>Autre</option>
              </select>
              {fetcher.data?.errors?.type_materiel && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.type_materiel}
                </p>
              )}
            </div>

            {/* Marque et référence */}
            <div className='w-full'>
              <label
                htmlFor='marque'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Marque et référence*
              </label>
              <Input
                id='marque'
                name='marque'
                placeholder='Ex: Brother MFC'
                className={`w-full ${fetcher.data?.errors?.marque ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
              />
              {fetcher.data?.errors?.marque && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.marque}
                </p>
              )}
            </div>

            {/* Numéro de téléphone */}
            <div className='w-full'>
              <label
                htmlFor='numero_telephone'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Numéro de téléphone*
              </label>
              <Input
                id='numero_telephone'
                name='numero_telephone'
                type='tel'
                placeholder='Ex: 0723456789'
                className={`w-full ${fetcher.data?.errors?.numero_telephone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
              />
              {fetcher.data?.errors?.numero_telephone && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.numero_telephone}
                </p>
              )}
            </div>

            {/* N° inventaire */}
            <div className='w-full'>
              <label
                htmlFor='numero_inventaire'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                N° d&apos;inventaire
              </label>
              <Input
                id='numero_inventaire'
                name='numero_inventaire'
                placeholder="Numéro d'inventaire"
                className='w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              />
            </div>

            {/* Service d'affectation */}
            <div className='w-full'>
              <label
                htmlFor='service_affectation'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Service d&apos;affectation*
              </label>
              <select
                id='service_affectation'
                name='service_affectation'
                className={`w-full appearance-none rounded-md ${
                  fetcher.data?.errors?.service_affectation
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                } bg-white bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YTRkNTgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==")] bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2`}
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
                <option value='Service Pédagogique'>Service Pédagogique</option>
                <option value='Service Technique'>Service Technique</option>
              </select>
              {fetcher.data?.errors?.service_affectation && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.service_affectation}
                </p>
              )}
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
                name='status'
                className='w-full appearance-none rounded-md border border-gray-300 bg-white bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YTRkNTgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==")] bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                defaultValue='Etudiant'
              >
                <option value='Etudiant'>Etudiant</option>
                <option value='Enseignant'>Enseignant</option>
                <option value='Employe'>Employe</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className='col-span-full mt-10 flex justify-center'>
              <Button
                type='submit'
                className='rounded-md bg-[#1D6BF3] px-8 font-medium text-white hover:bg-blue-700 disabled:opacity-70'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className='flex items-center gap-2'>
                    <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                    <span>Enregistrement...</span>
                  </div>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </fetcher.Form>

          {/* Success Modal */}
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
                  Un email a été envoyé pour informer l&apos;utilisateur.
                </p>
                <Button
                  onClick={() => navigate('/demandes')}
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
