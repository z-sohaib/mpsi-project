import { useState, useEffect } from 'react';
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { useLoaderData, useFetcher, Link, useNavigate } from '@remix-run/react';
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
import { Equipement } from '~/models/equipements.shared';

// Define types for the loader and action data
type ActionData = {
  errors?: {
    panne_trouvee?: string;
    status?: string;
    priorite?: string;
    date_sortie?: string;
    numero_serie?: string;
    form?: string;
  };
  success?: boolean;
  message?: string;
  action?: 'finaliser' | 'irreparable';
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
      const numero_serie = formData.get('numero_serie') as string;

      // Get selected component IDs from the form
      const selectedComposantIds = formData.getAll(
        'composants_utilises',
      ) as string[];

      // Validate fields
      const errors: ActionData['errors'] = {};
      if (!panne_trouvee) errors.panne_trouvee = 'La panne trouvée est requise';
      if (!status) errors.status = 'Le statut est requis';
      if (!priorite) errors.priorite = 'La priorité est requise';

      if (Object.keys(errors).length > 0) {
        return json({ errors, success: false }, { status: 400 });
      }

      // Process selected components
      const selectedComposantsArray = selectedComposantIds.map((id) =>
        parseInt(id),
      );

      // Prepare update data
      const updateData = {
        panne_trouvee,
        priorite,
        status,
        date_sortie: date_sortie || null,
        technicien,
        numero_serie,
        composants_utilises: selectedComposantsArray,
      };

      // Update intervention
      await updateInterventionById(session.access, interventionId, updateData);

      return json({
        success: true,
        message: 'Intervention mise à jour avec succès',
      });
    } else if (action === 'finaliser') {
      // Set status to "Termine" and add a completion date
      const currentDate = new Date().toISOString().split('T')[0];

      await updateInterventionById(session.access, interventionId, {
        status: 'Termine',
        date_sortie: currentDate,
      });

      // Return success with action type for the modal
      return json({
        success: true,
        action: 'finaliser',
        message: 'Intervention finalisée avec succès',
      });
    } else if (action === 'irreparable') {
      // First, get the intervention details and associated demande
      const intervention = await fetchInterventionById(
        session.access,
        interventionId,
      );

      if (!intervention) {
        return json(
          {
            errors: { form: 'Intervention introuvable' },
            success: false,
          },
          { status: 404 },
        );
      }

      let demande = null;
      if (intervention.demande_id) {
        demande = await fetchDemandeById(
          session.access,
          intervention.demande_id.toString(),
        );
      }

      // Create equipment from intervention and demande data
      try {
        // Create new equipment payload
        const equipementPayload: Equipement = {
          model_reference: intervention.numero_serie || '',
          numero_serie: intervention.numero_serie || '',
          designation: demande
            ? `${demande.type_materiel} ${demande.marque}`
            : 'Équipement irréparable',
          observation: `Équipement marqué comme irréparable suite à l'intervention #${interventionId}. Panne: ${intervention.panne_trouvee || 'Non spécifiée'}`,
          numero_inventaire: demande ? demande.numero_inventaire || '' : '',
          created_at: new Date().toISOString(),
        };

        // Call API to create equipment (this function needs to be created)
        await createEquipement(session.access, equipementPayload);

        // Update intervention status to Irreparable
        await updateInterventionById(session.access, interventionId, {
          status: 'Irreparable',
        });

        return json({
          success: true,
          action: 'irreparable',
          message: 'Intervention marquée comme irréparable et équipement créé',
        });
      } catch (error) {
        console.error('Error creating equipment:', error);
        return json(
          {
            errors: {
              form: "Erreur lors de la création de l'équipement irréparable",
            },
            success: false,
          },
          { status: 500 },
        );
      }
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
              : "Une erreur est survenue lors de la mise à jour de l'intervention",
        },
        success: false,
      },
      { status: 500 },
    );
  }
}

// Create this new function to handle equipment creation
async function createEquipement(token: string, data: Equipement) {
  const response = await fetch(
    'https://itms-mpsi.onrender.com/api/equipements/',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create equipment: ${errorText}`);
  }

  return await response.json();
}

export default function InterventionDetailsPage() {
  const {
    intervention,
    demandeName,
    composants,
    error: loaderError,
  } = useLoaderData<LoaderData>();
  const fetcher = useFetcher<ActionData>();
  const navigate = useNavigate();

  const [panneTrouvee, setPanneTrouvee] = useState(
    intervention.panne_trouvee || '',
  );
  const [priorite, setPriorite] = useState(intervention.priorite || 'Moyenne');
  const [status, setStatus] = useState(intervention.status || 'enCours');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dateSortie, setDateSortie] = useState(intervention.date_sortie || '');
  const [numeroSerie, setNumeroSerie] = useState(
    intervention.numero_serie || '',
  );
  const [technicien] = useState(intervention.technicien || 1);
  const [selectedComponents, setSelectedComponents] = useState<number[]>(
    intervention.composants_utilises?.map((comp) => comp.id) || [],
  );
  const [modified, setModified] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(loaderError || null);
  const [showConfirmModal, setShowConfirmModal] = useState<
    'finaliser' | 'irreparable' | null
  >(null);
  const [actionSuccessModal, setActionSuccessModal] = useState<
    'finaliser' | 'irreparable' | null
  >(null);

  // Track if the form has been modified
  useEffect(() => {
    const originalComponentIds =
      intervention.composants_utilises?.map((comp) => comp.id) || [];
    const componentsChanged =
      selectedComponents.length !== originalComponentIds.length ||
      !selectedComponents.every((id) => originalComponentIds.includes(id));

    setModified(
      panneTrouvee !== (intervention.panne_trouvee || '') ||
        priorite !== (intervention.priorite || 'Moyenne') ||
        status !== (intervention.status || 'enCours') ||
        dateSortie !== (intervention.date_sortie || '') ||
        numeroSerie !== (intervention.numero_serie || '') ||
        componentsChanged,
    );
  }, [
    panneTrouvee,
    priorite,
    status,
    dateSortie,
    numeroSerie,
    selectedComponents,
    intervention,
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

  // Handle component selection
  const handleComponentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value),
    );
    setSelectedComponents(selectedOptions);
  };

  // Watch for action success to show success modal
  useEffect(() => {
    if (
      fetcher.data?.success &&
      fetcher.data.action &&
      fetcher.state === 'idle'
    ) {
      if (fetcher.data.action === 'finaliser') {
        setActionSuccessModal('finaliser');
      } else if (fetcher.data.action === 'irreparable') {
        setActionSuccessModal('irreparable');
      }
    }
  }, [fetcher.data, fetcher.state]);

  // Handle navigation after success
  const handleSuccessClose = () => {
    setActionSuccessModal(null);
    navigate('/interventions');
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
                name='numero_serie'
                value={numeroSerie}
                onChange={(e) => setNumeroSerie(e.target.value)}
                className='w-full border-gray-300'
                placeholder='Entrez le numéro de série'
              />
              {fetcher.data?.errors?.numero_serie && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.numero_serie}
                </p>
              )}
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
                disabled={true}
                className='w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='enCours'>En cours</option>
                <option value='Termine'>Terminé</option>
                <option value='Irreparable'>Irréparable</option>
              </select>
              <p className='mt-1 text-xs text-gray-500'>
                Le statut est modifié par les actions{' '}
                <span className='text-green-700'>Finaliser</span> ou{' '}
                <span className='text-red-700'>Irréparable</span>
              </p>
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
                readOnly
                className='w-full border-gray-300 bg-gray-100'
              />
              <p className='mt-1 text-xs text-gray-500'>
                La date de sortie est définie automatiquement lors de la
                finalisation
              </p>
            </div>

            {/* Composants section */}
            <div className='col-span-full mt-4'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Composants utilisés
              </h3>
              <div className='mb-4 rounded-lg bg-gray-50 p-4 shadow-sm'>
                <label
                  htmlFor='composants_utilises'
                  className='mb-2 block font-medium text-gray-800'
                >
                  Sélectionnez les composants utilisés
                </label>
                <div className='relative'>
                  <select
                    id='composants_utilises'
                    name='composants_utilises'
                    multiple
                    value={selectedComponents.map((id) => id.toString())}
                    onChange={handleComponentChange}
                    className='w-full appearance-none rounded-md border border-blue-200 bg-white px-4 py-3 text-sm shadow-inner focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200/50'
                    size={6}
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#3B82F6 #EFF6FF',
                    }}
                  >
                    {composants.map((composant) => (
                      <option
                        key={composant.id}
                        value={composant.id}
                        className='mb-1 cursor-pointer border-b border-blue-50 px-1 py-2 last:border-0 hover:bg-blue-50'
                      >
                        <span className='font-medium'>
                          {composant.designation}
                        </span>{' '}
                        {composant.model_reference && (
                          <span className='text-gray-500'>
                            ({composant.model_reference})
                          </span>
                        )}{' '}
                        -{' '}
                        <span className='text-blue-600'>
                          {composant.quantity} en stock
                        </span>
                      </option>
                    ))}
                  </select>
                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                    <svg
                      className='size-5 text-blue-400'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      aria-hidden='true'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
                <div className='mt-2 flex items-center gap-2 text-xs text-gray-500'>
                  <span className='flex size-5 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-600'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='size-3'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </span>
                  <span>
                    Maintenez{' '}
                    <kbd className='rounded border border-gray-300 bg-gray-100 px-1 font-sans font-semibold'>
                      Ctrl
                    </kbd>{' '}
                    (ou{' '}
                    <kbd className='rounded border border-gray-300 bg-gray-100 px-1 font-sans font-semibold'>
                      Cmd
                    </kbd>{' '}
                    sur Mac) pour sélectionner plusieurs composants
                  </span>
                </div>
              </div>

              {/* Show selected components in a more stylish way */}
              <div className='mb-4 rounded-lg border border-blue-100 bg-white p-4 shadow'>
                <h4 className='mb-3 border-b border-blue-100 pb-2 font-semibold text-gray-900'>
                  Composants sélectionnés
                </h4>
                {selectedComponents.length > 0 ? (
                  <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                    {selectedComponents.map((id) => {
                      const composant = composants.find((c) => c.id === id);
                      return (
                        <div
                          key={id}
                          className='flex items-center gap-3 rounded-md border border-blue-100 bg-blue-50 p-2 transition hover:bg-blue-100'
                        >
                          <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-200 font-bold text-blue-700'>
                            {composant?.type_composant === 'Nouveau'
                              ? 'N'
                              : 'A'}
                          </div>
                          <div className='grow overflow-hidden'>
                            <p className='truncate font-medium text-gray-800'>
                              {composant?.designation || `Composant #${id}`}
                            </p>
                            <div className='flex justify-between text-xs text-gray-500'>
                              <span>
                                Réf: {composant?.model_reference || 'N/A'}
                              </span>
                              <span>Stock: {composant?.quantity || 0}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className='flex items-center justify-center rounded-md bg-gray-50 py-4 text-gray-500'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='mr-2 size-5 text-gray-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    Aucun composant sélectionné pour cette intervention
                  </div>
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
          {intervention.status === 'enCours' && (
            <div className='mt-8 flex justify-center space-x-4'>
              <Button
                onClick={() => setShowConfirmModal('irreparable')}
                className='bg-red-600 px-8 py-2 text-white hover:bg-red-700 disabled:opacity-70'
                disabled={isSubmitting}
              >
                Irréparable
              </Button>
              <Button
                onClick={() => setShowConfirmModal('finaliser')}
                className='bg-green-600 px-8 py-2 text-white hover:bg-green-700 disabled:opacity-70'
                disabled={isSubmitting}
              >
                Finaliser
              </Button>
            </div>
          )}
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

        {/* Success Modal for Finaliser action */}
        {actionSuccessModal === 'finaliser' && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm'>
            <div className='w-[90%] max-w-lg rounded-lg border border-blue-400 bg-white p-8 text-center shadow-lg'>
              <img
                src='/check.png'
                alt='Success'
                className='mx-auto mb-4 w-14'
              />
              <h3 className='mb-2 text-lg font-semibold text-black'>
                Intervention finalisée avec succès
              </h3>
              <p className='mb-6 text-sm text-gray-600'>
                L&apos;intervention a été marquée comme terminée et la date de
                sortie a été définie à aujourd&apos;hui.
              </p>
              <Button
                onClick={handleSuccessClose}
                className='mx-auto rounded-md bg-[#1D6BF3] font-medium text-white hover:bg-blue-700'
              >
                OK
              </Button>
            </div>
          </div>
        )}

        {/* Success Modal for Irreparable action */}
        {actionSuccessModal === 'irreparable' && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm'>
            <div className='w-[90%] max-w-lg rounded-lg border border-blue-400 bg-white p-8 text-center shadow-lg'>
              <img
                src='/check.png'
                alt='Success'
                className='mx-auto mb-4 w-14'
              />
              <h3 className='mb-2 text-lg font-semibold text-black'>
                Intervention marquée comme irréparable
              </h3>
              <p className='mb-6 text-sm text-gray-600'>
                L&apos;intervention a été marquée comme irréparable et un nouvel
                équipement a été créé avec le statut{' '}
                <b className='text-red-700'>Irréparable</b>.
              </p>
              <Button
                onClick={handleSuccessClose}
                className='mx-auto rounded-md bg-[#1D6BF3] font-medium text-white hover:bg-blue-700'
              >
                OK
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
