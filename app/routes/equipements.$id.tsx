import { useState, useEffect } from 'react';
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';

import Layout from '~/components/layout/Layout';
import { requireUserId } from '~/session.server';
import { fetchEquipementById } from '~/models/equipements.server';
import {
  Equipement,
  formatDate,
  updateEquipementById,
} from '~/models/equipements.shared';

// Define types for the loader and action data
type ActionData = {
  errors?: {
    model_reference?: string;
    numero_serie?: string;
    designation?: string;
    observation?: string;
    numero_inventaire?: string;
    form?: string;
  };
  success?: boolean;
  message?: string;
};

type LoaderData = {
  equipement: Equipement;
  error?: string;
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  try {
    const session = await requireUserId(request);
    const equipementId = params.id;

    if (!equipementId) {
      throw new Response('Equipment ID is required', { status: 400 });
    }

    const equipement = await fetchEquipementById(session.access, equipementId);

    if (!equipement) {
      throw new Response('Equipment not found', { status: 404 });
    }

    return json({ equipement });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Loader error:', error);
    throw redirect('/auth');
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const session = await requireUserId(request);
    const equipementId = params.id;

    if (!equipementId) {
      return json(
        { errors: { form: 'Equipment ID is required' } },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const action = formData.get('action') as string;

    if (action === 'update') {
      // Extract form values
      const model_reference = formData.get('model_reference') as string;
      const numero_serie = formData.get('numero_serie') as string;
      const designation = formData.get('designation') as string;
      const observation = formData.get('observation') as string;
      const numero_inventaire = formData.get('numero_inventaire') as string;

      // Validate fields
      const errors: ActionData['errors'] = {};
      if (!model_reference)
        errors.model_reference = 'Le modèle/référence est requis';
      if (!numero_serie) errors.numero_serie = 'Le numéro de série est requis';
      if (!designation) errors.designation = 'La désignation est requise';

      if (Object.keys(errors).length > 0) {
        return json({ errors, success: false }, { status: 400 });
      }

      // Prepare update data
      const updateData = {
        model_reference,
        numero_serie,
        designation,
        observation,
        numero_inventaire,
      };

      // Update equipment
      // Note: you'll need to implement the updateEquipementById function in your server file
      await updateEquipementById(session.access, equipementId, updateData);

      return json({
        success: true,
        message: 'Équipement mis à jour avec succès',
      });
    }

    return json({ errors: { form: 'Action non reconnue' } }, { status: 400 });
  } catch (error) {
    console.error('Action error:', error);
    return json(
      {
        errors: {
          form:
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de la mise à jour de l'équipement",
        },
        success: false,
      },
      { status: 500 },
    );
  }
}

export default function EquipementDetailsPage() {
  const { equipement, error: loaderError } = useLoaderData<LoaderData>();
  const fetcher = useFetcher<ActionData>();

  const [modelReference, setModelReference] = useState(
    equipement.model_reference || '',
  );
  const [numeroSerie, setNumeroSerie] = useState(equipement.numero_serie || '');
  const [designation, setDesignation] = useState(equipement.designation || '');
  const [observation, setObservation] = useState(equipement.observation || '');
  const [numeroInventaire, setNumeroInventaire] = useState(
    equipement.numero_inventaire || '',
  );

  const [modified, setModified] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(loaderError || null);

  // Track if the form has been modified
  useEffect(() => {
    setModified(
      modelReference !== (equipement.model_reference || '') ||
        numeroSerie !== (equipement.numero_serie || '') ||
        designation !== (equipement.designation || '') ||
        observation !== (equipement.observation || '') ||
        numeroInventaire !== (equipement.numero_inventaire || ''),
    );
  }, [
    modelReference,
    numeroSerie,
    designation,
    observation,
    numeroInventaire,
    equipement,
  ]);

  // Show toast notification on successful update
  useEffect(() => {
    if (fetcher.data?.success) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (fetcher.data?.errors?.form) {
      setError(fetcher.data.errors.form);
    }
  }, [fetcher.data]);

  // Format date for display
  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return 'Non définie';
    return formatDate(dateString);
  };

  // Check if form is submitting
  const isSubmitting = fetcher.state !== 'idle';

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-4xl px-4 md:px-0'>
        {/* Toast notification */}
        {showToast && (
          <div className='fixed bottom-4 right-4 z-50 rounded-md bg-green-500 px-4 py-2 text-white shadow-lg'>
            {fetcher.data?.message || 'Équipement mis à jour avec succès'}
          </div>
        )}

        <div className='rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
          <h2 className='mb-6 text-center text-xl font-bold text-[#1D6BF3]'>
            Détails de l&apos;équipement #{equipement.id}
          </h2>

          {error && (
            <div className='mb-4 rounded-md bg-red-100 p-4 text-red-700'>
              {error}
              <button
                onClick={() => setError(null)}
                className='ml-2 font-bold'
                aria-label='Dismiss error'
              >
                ×
              </button>
            </div>
          )}

          <fetcher.Form
            method='post'
            className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'
          >
            <input type='hidden' name='action' value='update' />

            {/* Equipment details */}
            <div className='w-full'>
              <label
                htmlFor='created_at'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Date de création
              </label>
              <Input
                id='created_at'
                value={formatDateForDisplay(equipement.created_at)}
                readOnly
                className='w-full bg-gray-100'
              />
            </div>

            <div className='w-full'>
              <label
                htmlFor='model_reference'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Modèle / Référence*
              </label>
              <Input
                id='model_reference'
                name='model_reference'
                value={modelReference}
                onChange={(e) => setModelReference(e.target.value)}
                className={`w-full ${
                  fetcher.data?.errors?.model_reference
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder='Ex: DELL-PowerEdge-R740'
              />
              {fetcher.data?.errors?.model_reference && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.model_reference}
                </p>
              )}
            </div>

            <div className='w-full'>
              <label
                htmlFor='numero_serie'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Numéro de série*
              </label>
              <Input
                id='numero_serie'
                name='numero_serie'
                value={numeroSerie}
                onChange={(e) => setNumeroSerie(e.target.value)}
                className={`w-full ${
                  fetcher.data?.errors?.numero_serie
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder='Ex: DELL-SRV-010'
              />
              {fetcher.data?.errors?.numero_serie && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.numero_serie}
                </p>
              )}
            </div>

            <div className='w-full'>
              <label
                htmlFor='designation'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Désignation*
              </label>
              <Input
                id='designation'
                name='designation'
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className={`w-full ${
                  fetcher.data?.errors?.designation
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder='Ex: Dell PowerEdge R740'
              />
              {fetcher.data?.errors?.designation && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.designation}
                </p>
              )}
            </div>

            <div className='w-full'>
              <label
                htmlFor='numero_inventaire'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Numéro d&apos;inventaire
              </label>
              <Input
                id='numero_inventaire'
                name='numero_inventaire'
                value={numeroInventaire}
                onChange={(e) => setNumeroInventaire(e.target.value)}
                className='w-full border-gray-300'
                placeholder='Ex: INV-2023-010'
              />
            </div>

            <div className='col-span-full'>
              <label
                htmlFor='observation'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Observations
              </label>
              <textarea
                id='observation'
                name='observation'
                rows={4}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: Multiple disques durs endommagés, carte mère défectueuse...'
              />
            </div>

            {/* Submit button - only visible if modified */}
            <div className='col-span-full mt-6 flex justify-center'>
              {modified && (
                <Button
                  type='submit'
                  className='bg-mpsi px-8 py-2 text-white hover:bg-mpsi/90 disabled:opacity-70'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className='flex items-center gap-2'>
                      <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                      <span>Enregistrement...</span>
                    </div>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              )}
            </div>
          </fetcher.Form>

          {/* Status badge */}
          <div className='mt-8 flex flex-col items-center'>
            <div
              className={`rounded-full px-4 py-1 text-sm font-semibold ${
                equipement.status === 'Irreparable'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {equipement.status || 'Fonctionnel'}
            </div>
          </div>

          {/* Related data section - This could be used to show interventions linked to this equipment */}
          <div className='mt-6'>
            <Link
              to='/equipements'
              className='inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200'
            >
              ← Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
