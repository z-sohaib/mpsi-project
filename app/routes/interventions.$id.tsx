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
import {
  fetchInterventionById,
  updateInterventionById,
} from '~/models/interventions.server';
import { fetchDemandeById } from '~/models/demandes.server';
import { Intervention } from '~/models/interventions.shared';
import { fetchComposants, Composant } from '~/models/composant.server';

// const statusColors = {
//   Termine: 'bg-green-100/50 text-green-700',
//   enCours: 'bg-blue-100/50 text-blue-700',
//   Irreparable: 'bg-red-100/50 text-red-700',
// };

// const priorityColors = {
//   Haute: 'bg-red-100/50 text-red-700',
//   Moyenne: 'bg-yellow-100/50 text-yellow-700',
//   Basse: 'bg-blue-100/50 text-blue-700',
// };

// Define types for the loader and action data
type ActionData = {
  errors?: {
    panne_trouvee?: string;
    status?: string;
    priorite?: string;
    date_sortie?: string;
    form?: string;
  };
  success?: boolean;
  message?: string;
};

type LoaderData = {
  intervention: Intervention;
  demandeName?: string;
  composants: Composant[];
  error?: string;
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  try {
    const session = await requireUserId(request);
    const interventionId = params.id;

    if (!interventionId) {
      throw new Response('Intervention ID is required', { status: 400 });
    }

    const [intervention, composants] = await Promise.all([
      fetchInterventionById(session.access, interventionId),
      fetchComposants(session.access),
    ]);

    if (!intervention) {
      throw new Response('Intervention not found', { status: 404 });
    }

    // Get basic demande info if available
    let demandeName = '';
    if (intervention.demande_id) {
      try {
        const demande = await fetchDemandeById(
          session.access,
          intervention.demande_id.toString(),
        );
        if (demande) {
          demandeName = `${demande.nom_deposant} - ${demande.type_materiel} ${demande.marque}`;
        }
      } catch (error) {
        console.error('Error fetching demande:', error);
      }
    }

    return json({ intervention, demandeName, composants });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Loader error:', error);
    throw redirect('/auth');
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const session = await requireUserId(request);
    const interventionId = params.id;

    if (!interventionId) {
      return json(
        { errors: { form: 'Intervention ID is required' } },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const action = formData.get('action') as string;

    if (action === 'update') {
      // Extract form values
      const panne_trouvee = formData.get('panne_trouvee') as string;
      const priorite = formData.get('priorite') as
        | 'Haute'
        | 'Moyenne'
        | 'Basse';
      const status = formData.get('status') as
        | 'Termine'
        | 'enCours'
        | 'Irreparable';
      const date_sortie = formData.get('date_sortie') as string;
      const technicien = Number(formData.get('technicien') || 1);

      // Validate fields
      const errors: ActionData['errors'] = {};
      if (!panne_trouvee) errors.panne_trouvee = 'La panne trouvée est requise';
      if (!status) errors.status = 'Le statut est requis';
      if (!priorite) errors.priorite = 'La priorité est requise';

      if (Object.keys(errors).length > 0) {
        return json({ errors, success: false }, { status: 400 });
      }

      // Prepare update data
      const updateData = {
        panne_trouvee,
        priorite,
        status,
        date_sortie: date_sortie || null,
        technicien,
      };

      // Update intervention
      await updateInterventionById(session.access, interventionId, updateData);

      return json({
        success: true,
        message: 'Intervention mise à jour avec succès',
      });
    } else if (action === 'finaliser') {
      // TODO: Implement logic for finalizing the intervention
      // This would typically set status to "Termine" and add a completion date

      const currentDate = new Date().toISOString().split('T')[0];

      await updateInterventionById(session.access, interventionId, {
        status: 'Termine',
        date_sortie: currentDate,
      });

      return json({
        success: true,
        message: 'Intervention finalisée avec succès',
      });
    } else if (action === 'irreparable') {
      // TODO: Implement logic for marking the intervention as irreparable
      // This would typically set status to "Irreparable" and might require a reason

      await updateInterventionById(session.access, interventionId, {
        status: 'Irreparable',
      });

      return json({
        success: true,
        message: 'Intervention marquée comme irréparable',
      });
    }

    return json({ errors: { form: 'Action non reconnue' } }, { status: 400 });
  } catch (error) {
    console.error('Action error:', error);
    return json(
      {
        errors:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la mise à jour de l'intervention",
        success: false,
      },
      { status: 500 },
    );
  }
}

export default function InterventionDetailsPage() {
  const {
    intervention,
    demandeName,
    composants,
    error: loaderError,
  } = useLoaderData<LoaderData>();
  const fetcher = useFetcher<ActionData>();

  const [panneTrouvee, setPanneTrouvee] = useState(
    intervention.panne_trouvee || '',
  );
  const [priorite, setPriorite] = useState(intervention.priorite || 'Moyenne');
  const [status, setStatus] = useState(intervention.status || 'enCours');
  const [dateSortie, setDateSortie] = useState(intervention.date_sortie || '');
  const [technicien] = useState(intervention.technicien || 1);
  const [modified, setModified] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(loaderError || null);
  const [showConfirmModal, setShowConfirmModal] = useState<
    'finaliser' | 'irreparable' | null
  >(null);

  // Track if the form has been modified
  useEffect(() => {
    setModified(
      panneTrouvee !== (intervention.panne_trouvee || '') ||
        priorite !== (intervention.priorite || 'Moyenne') ||
        status !== (intervention.status || 'enCours') ||
        dateSortie !== (intervention.date_sortie || ''),
    );
  }, [panneTrouvee, priorite, status, dateSortie, intervention]);

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

  // Format date for input fields
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    return dateString.split('T')[0]; // Extract YYYY-MM-DD
  };

  // Check if form is submitting
  const isSubmitting = fetcher.state !== 'idle';

  // Handle confirm action
  const handleConfirmAction = (action: 'finaliser' | 'irreparable') => {
    setShowConfirmModal(null);
    const formData = new FormData();
    formData.append('action', action);
    fetcher.submit(formData, { method: 'post' });
  };

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-4xl px-4 md:px-0'>
        {/* Toast notification */}
        {showToast && (
          <div className='fixed bottom-4 right-4 z-50 rounded-md bg-green-500 px-4 py-2 text-white shadow-lg'>
            {fetcher.data?.message || 'Intervention mise à jour avec succès'}
          </div>
        )}

        <div className='rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
          <h2 className='mb-6 text-center text-xl font-bold text-[#1D6BF3]'>
            Détails de l&apos;intervention #{intervention.id}
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
            <input type='hidden' name='technicien' value={technicien} />

            {/* Demande info with link */}
            <div className='col-span-full mb-4 border-b border-gray-200 pb-4'>
              <label
                className='mb-1 block text-sm font-medium text-gray-700'
                htmlFor='demande_id'
              >
                Demande associée
              </label>
              <div className='flex items-center justify-between'>
                <div className='text-base font-medium'>
                  Demande #{intervention.demande_id}{' '}
                  {demandeName && `- ${demandeName}`}
                </div>
                <Link
                  to={`/demandes/${intervention.demande_id}`}
                  className='ml-2 inline-flex items-center justify-center rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100'
                >
                  Aller à la demande
                </Link>
              </div>
            </div>

            {/* Intervention details */}
            <div className='w-full'>
              <label
                htmlFor='created_at'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Date de création
              </label>
              <Input
                id='created_at'
                value={formatDateForInput(intervention.created_at)}
                readOnly
                className='w-full bg-gray-100'
              />
            </div>

            <div className='w-full'>
              <label
                htmlFor='numero_serie'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Numéro de série
              </label>
              <Input
                id='numero_serie'
                value={intervention.numero_serie || ''}
                readOnly
                className='w-full bg-gray-100'
              />
            </div>

            <div className='w-full'>
              <label
                htmlFor='panne_trouvee'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Panne trouvée*
              </label>
              <textarea
                id='panne_trouvee'
                name='panne_trouvee'
                rows={3}
                value={panneTrouvee}
                onChange={(e) => setPanneTrouvee(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fetcher.data?.errors?.panne_trouvee
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {fetcher.data?.errors?.panne_trouvee && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.panne_trouvee}
                </p>
              )}
            </div>

            <div className='w-full'>
              <label
                htmlFor='priorite'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Priorité*
              </label>
              <select
                id='priorite'
                name='priorite'
                value={priorite}
                onChange={(e) =>
                  setPriorite(e.target.value as 'Haute' | 'Moyenne' | 'Basse')
                }
                className={`w-full rounded-md border px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fetcher.data?.errors?.priorite
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value='Haute'>Haute</option>
                <option value='Moyenne'>Moyenne</option>
                <option value='Basse'>Basse</option>
              </select>
              {fetcher.data?.errors?.priorite && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.priorite}
                </p>
              )}
            </div>

            <div className='w-full'>
              <label
                htmlFor='status'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Statut*
              </label>
              <select
                id='status'
                name='status'
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as 'Termine' | 'enCours' | 'Irreparable',
                  )
                }
                className={`w-full rounded-md border px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fetcher.data?.errors?.status
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value='enCours'>En cours</option>
                <option value='Termine'>Terminé</option>
                <option value='Irreparable'>Irréparable</option>
              </select>
              {fetcher.data?.errors?.status && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.status}
                </p>
              )}
            </div>

            <div className='w-full'>
              <label
                htmlFor='date_sortie'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Date de sortie
              </label>
              <Input
                id='date_sortie'
                name='date_sortie'
                type='date'
                value={formatDateForInput(dateSortie)}
                onChange={(e) => setDateSortie(e.target.value)}
                className='w-full border-gray-300'
              />
            </div>

            {/* Composants section */}
            <div className='col-span-full mt-4'>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                Composants utilisés
              </h3>
              <div className='mb-4 rounded-md bg-gray-50 p-4'>
                {intervention.composants_utilises &&
                intervention.composants_utilises.length > 0 ? (
                  <ul className='space-y-2'>
                    {intervention.composants_utilises.map(
                      (composant: Composant) => {
                        const composantId: number | undefined = composants.find(
                          (c) => c.id === composantId,
                        )?.id;
                        return (
                          <li
                            key={composantId}
                            className='flex items-center justify-between'
                          >
                            <span>
                              {composant?.nom || `Composant #${composantId}`}
                            </span>
                            <Link
                              to={`/composants/${composantId}`}
                              className='text-sm text-blue-600 hover:underline'
                            >
                              Voir détails
                            </Link>
                          </li>
                        );
                      },
                    )}
                  </ul>
                ) : (
                  <p className='text-gray-500'>
                    Aucun composant utilisé pour cette intervention
                  </p>
                )}
              </div>
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

          {/* Action buttons for finalizing or marking as irreparable */}
          <div className='mt-8 flex justify-center space-x-4'>
            <Button
              onClick={() => setShowConfirmModal('irreparable')}
              className='bg-red-600 px-8 py-2 text-white hover:bg-red-700 disabled:opacity-70'
              disabled={isSubmitting || intervention.status === 'Irreparable'}
            >
              Irréparable
            </Button>
            <Button
              onClick={() => setShowConfirmModal('finaliser')}
              className='bg-green-600 px-8 py-2 text-white hover:bg-green-700 disabled:opacity-70'
              disabled={isSubmitting || intervention.status === 'Termine'}
            >
              Finaliser
            </Button>
          </div>
        </div>

        {/* Confirmation Modal for actions */}
        {showConfirmModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
            <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
              <h3 className='mb-4 text-lg font-bold text-gray-900'>
                {showConfirmModal === 'finaliser'
                  ? "Finaliser l'intervention"
                  : 'Marquer comme irréparable'}
              </h3>
              <p className='mb-6 text-gray-600'>
                {showConfirmModal === 'finaliser'
                  ? "Êtes-vous sûr de vouloir finaliser cette intervention ? L'état sera changé à 'Terminé' et la date de sortie sera définie à aujourd'hui."
                  : 'Êtes-vous sûr de vouloir marquer cette intervention comme irréparable ? Cette action ne peut pas être annulée.'}
              </p>
              <div className='flex justify-end space-x-4'>
                <Button
                  variant='outline'
                  onClick={() => setShowConfirmModal(null)}
                  className='border-gray-300'
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => handleConfirmAction(showConfirmModal)}
                  className={`${
                    showConfirmModal === 'finaliser'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className='flex items-center gap-2'>
                      <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                      <span>Traitement...</span>
                    </div>
                  ) : (
                    'Confirmer'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
