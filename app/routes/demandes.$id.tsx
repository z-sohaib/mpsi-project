import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import Layout from '~/components/layout/Layout';
import { useState, useEffect } from 'react';
import {
  useLoaderData,
  useNavigate,
  useFetcher,
  useActionData,
} from '@remix-run/react';
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  data,
  redirect,
} from '@remix-run/node';
import { requireUserId } from '~/session.server';
import { fetchDemandeById, updateDemandeById } from '~/models/demandes.server';
import { createInterventionFromDemande } from '~/models/interventions.server';
import {
  sendRequestAcceptedEmail,
  sendRequestRejectedEmail,
} from '~/utils/email.server';

// Types for the API data
type PrioriteType = 'Haute' | 'Moyenne' | 'Basse';
type StatusDemandeType =
  | 'Acceptee'
  | 'EnAttente'
  | 'Rejetee'
  | 'Terminee'
  | 'Nouvelle';

// Define a proper type for components used in interventions
interface Composant {
  id: number;
  nom: string;
  description?: string;
  quantite: number;
}

interface Intervention {
  id: number;
  composants_utilises: Composant[];
  created_at: string;
  numero_serie: string;
  priorite: PrioriteType;
  panne_trouvee: string;
  status: string;
  date_sortie: string | null;
  demande_id: number;
  technicien: number;
}

interface Demande {
  id: number;
  interventions: Intervention[];
  type_materiel: string;
  marque: string;
  numero_inventaire: string;
  service_affectation: string;
  date_depot: string;
  nom_deposant: string;
  numero_telephone: string;
  email: string;
  status: string;
  panne_declaree: string;
  status_demande: StatusDemandeType;
  rejection_reason?: string | null;
  panne_trouvee?: string;
  materiels_installes?: string;
}

// Updated loader function
export async function loader({ params, request }: LoaderFunctionArgs) {
  try {
    // Check if user is authenticated, this will throw a redirect if not
    const session = await requireUserId(request);
    const demandeId = params.id;

    if (!demandeId) {
      throw new Response('Demande ID is required', { status: 400 });
    }

    try {
      const demande = await fetchDemandeById(session.access, demandeId);

      if (!demande) {
        throw new Response('Demande not found', { status: 404 });
      }

      return data({ demande });
    } catch (error) {
      console.error('Error fetching demande:', error);

      if (error instanceof Response) {
        throw error;
      }

      throw data(
        { error: 'Failed to load demande data. Please try again later.' },
        { status: 500 },
      );
    }
  } catch (error) {
    // Handle authentication redirect
    if (error instanceof Response && error.status === 302) {
      throw error;
    }

    // Pass through Response objects with specific status codes
    if (error instanceof Response) {
      throw error;
    }

    // Other errors
    console.error('Authentication error:', error);
    throw redirect('/auth');
  }
}

// Updated action function to handle intervention creation when accepting a demande
export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const session = await requireUserId(request);
    const demandeId = params.id;

    if (!demandeId) {
      return data({ error: 'Demande ID is required' }, { status: 400 });
    }

    const formData = await request.formData();
    const action = formData.get('action') as string;

    if (!action) {
      return data({ error: 'Action is required' }, { status: 400 });
    }

    try {
      // Get the detailed demande to use for sending emails
      const demande = await fetchDemandeById(session.access, demandeId);

      if (!demande) {
        throw new Error('Demande not found');
      }

      // Handle different action types
      switch (action) {
        case 'accept': {
          // First update the demande status
          await updateDemandeById(session.access, demandeId, {
            status_demande: 'Acceptee',
          });

          // Create intervention based on demande
          const intervention = await createInterventionFromDemande(
            session.access,
            Number(demandeId),
            {
              panne_trouvee: (formData.get('panneTrouvee') as string) || '',
            },
          );

          // Send email notification about acceptance
          if (demande.email && demande.nom_deposant) {
            await sendRequestAcceptedEmail(
              session.access,
              demande.email,
              demande.nom_deposant,
              demande.numero_inventaire || '',
            );
          }

          // Return success with the intervention ID for redirection
          return data({
            success: true,
            action: 'accept',
            interventionId: intervention.id,
          });
        }

        case 'reject': {
          const rejectionReason = formData.get('rejectionReason') as string;

          // Update demande status with rejection reason
          await updateDemandeById(session.access, demandeId, {
            status_demande: 'Rejetee',
            rejection_reason: rejectionReason,
          });

          // Send rejection email with the cause
          if (demande.email && demande.nom_deposant) {
            await sendRequestRejectedEmail(
              session.access,
              demande.email,
              demande.nom_deposant,
              demande.numero_inventaire || '',
              rejectionReason || 'Non spécifiée',
            );
          }

          return data({ success: true, action: 'reject' });
        }

        case 'save':
          {
            const panneTrouvee = formData.get('panneTrouvee') as string;
            const materielsInstalles = formData.get(
              'materielsInstalles',
            ) as string;

            await updateDemandeById(session.access, demandeId, {
              panne_trouvee: panneTrouvee,
              materiels_installes: materielsInstalles,
            });
          }

          return data({
            success: true,
            action: 'save',
            message: 'Modifications enregistrées!',
          });

        default:
          return data({ error: 'Invalid action' }, { status: 400 });
      }
    } catch (error) {
      console.error('Error updating demande:', error);
      return data(
        { error: 'Failed to process the request. Please try again.' },
        { status: 500 },
      );
    }
  } catch (error) {
    // Handle authentication redirect
    if (error instanceof Response && error.status === 302) {
      throw error;
    }

    // Other errors
    console.error('Authentication error:', error);
    throw redirect('/auth');
  }
}

// Define the type returned by the loader and action
type LoaderData = {
  demande: Demande;
  error?: string;
};

type ActionData = {
  success?: boolean;
  action?: 'accept' | 'reject' | 'save';
  message?: string;
  error?: string;
  interventionId?: number;
};

export default function DemandeDetailleePage() {
  const { demande, error: loaderError } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const acceptFetcher = useFetcher<ActionData>();
  const rejectFetcher = useFetcher<ActionData>();
  const saveFetcher = useFetcher<ActionData>();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(loaderError || null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modified, setModified] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  // Track fetcher states for loading indicators
  const isSaveLoading = saveFetcher.state !== 'idle';
  const isAcceptLoading = acceptFetcher.state !== 'idle';
  const isRejectLoading = rejectFetcher.state !== 'idle';
  const isAnyLoading = isSaveLoading || isAcceptLoading || isRejectLoading;

  // Watch for successful save actions to show toast
  useEffect(() => {
    if (saveFetcher.data?.success && saveFetcher.data.action === 'save') {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (saveFetcher.data?.error) {
      setError(saveFetcher.data.error);
    }
  }, [saveFetcher.data]);

  // Watch for rejectFetcher success to close modal and navigate
  useEffect(() => {
    if (rejectFetcher.data?.success && rejectFetcher.state === 'idle') {
      setShowFailure(false);
      navigate('/demandes');
    } else if (rejectFetcher.data?.error) {
      setError(rejectFetcher.data.error);
      setShowFailure(false); // Close the modal on error
    }
  }, [rejectFetcher.data, rejectFetcher.state, navigate]);

  // Watch for acceptFetcher success to either redirect or show success modal
  useEffect(() => {
    if (acceptFetcher.data?.success && acceptFetcher.state === 'idle') {
      setShowSuccess(true);
    } else if (acceptFetcher.data?.error) {
      setError(acceptFetcher.data.error);
    }
  }, [acceptFetcher.data, acceptFetcher.state]);

  // Watch for actionData errors
  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error);
    }
  }, [actionData]);

  // Clear error after a timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Clear error after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Format the date for input fields
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-4xl px-4 md:px-0'>
        {/* Toast notification */}
        {showToast && (
          <div className='fixed bottom-4 right-4 z-50 rounded-md bg-green-500 px-4 py-2 text-white shadow-lg'>
            {actionData?.message || saveFetcher.data?.message}
          </div>
        )}

        <div className='rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
          <h2 className='mb-6 text-center text-xl font-bold text-[#1D6BF3]'>
            Demande détaillée
          </h2>

          {isAnyLoading && (
            <div className='flex justify-center py-4'>
              <div className='size-8 animate-spin rounded-full border-b-2 border-mpsi'></div>
            </div>
          )}

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

          <saveFetcher.Form className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
            <input type='hidden' name='action' value='save' />

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
                value={demande.nom_deposant || ''}
                readOnly
                className='w-full bg-gray-100'
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
                value={demande.panne_declaree || ''}
                readOnly
                className='w-full rounded-md border bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                value={demande.email || ''}
                readOnly
                className='w-full bg-gray-100'
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
              <Input
                id='type-materiel'
                value={demande.type_materiel || ''}
                readOnly
                className='w-full bg-gray-100'
              />
            </div>

            {/* Matériels installés */}
            <div className='w-full'>
              <label
                htmlFor='status'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Type déposant
              </label>
              <Input
                id='status'
                name='status'
                value={demande.status || ''}
                readOnly
                className='w-full bg-gray-100'
              />
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
                value={demande.marque || ''}
                readOnly
                className='w-full bg-gray-100'
              />
            </div>

            {/* Date dépôt */}
            <div className='w-full'>
              <label
                htmlFor='date-depot'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Date dépôt
              </label>
              <Input
                id='date-depot'
                type='date'
                value={formatDateForInput(demande.date_depot)}
                readOnly
                className='w-full bg-gray-100'
              />
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
                value={demande.numero_inventaire || ''}
                readOnly
                className='w-full bg-gray-100'
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
              <Input
                id='service'
                value={demande.service_affectation || ''}
                readOnly
                className='w-full bg-gray-100'
              />
            </div>

            {/* Status demande */}
            <div className='w-full'>
              <label
                htmlFor='status'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Statut actuel
              </label>
              <Input
                id='status'
                value={
                  demande.status_demande === 'Acceptee'
                    ? 'Acceptée'
                    : demande.status_demande === 'EnAttente'
                      ? 'En Attente'
                      : demande.status_demande === 'Rejetee'
                        ? 'Rejetée'
                        : demande.status_demande === 'Terminee'
                          ? 'Terminée'
                          : demande.status_demande || ''
                }
                readOnly
                className='w-full bg-gray-100'
              />
            </div>

            {/* Submit button for saving changes */}
            <div className='col-span-full mt-10 flex justify-center'>
              {modified && (
                <Button
                  type='submit'
                  className='flex items-center gap-2 bg-blue-500 px-8 hover:bg-blue-600'
                  disabled={isAnyLoading}
                >
                  {saveFetcher.state !== 'idle' ? (
                    <>
                      <span className='inline-block size-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent'></span>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='size-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path d='M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h-2v5.586l-1.293-1.293z' />
                        <path d='M3 15a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z' />
                      </svg>
                      <span>Enregistrer</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </saveFetcher.Form>

          {demande.status_demande === 'Nouvelle' && (
            <div className='mt-6 flex justify-center gap-6'>
              {/* Button to open reject modal */}
              <Button
                className='bg-red-500 px-8 hover:bg-red-600'
                onClick={() => setShowFailure(true)}
                disabled={isAnyLoading}
                type='button'
              >
                Refuser
              </Button>

              {/* Form for acceptance */}
              <acceptFetcher.Form method='post'>
                <input type='hidden' name='action' value='accept' />
                <Button
                  type='submit'
                  className='bg-green-500 px-8 hover:bg-green-600'
                  disabled={isAnyLoading}
                >
                  {isAcceptLoading ? (
                    <div className='flex items-center gap-2'>
                      <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                      <span>Traitement...</span>
                    </div>
                  ) : (
                    'Accepter'
                  )}
                </Button>
              </acceptFetcher.Form>
            </div>
          )}

          {/* Success Modal - Shown after acceptance */}
          {showSuccess && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm'>
              <div className='w-[90%] max-w-lg rounded-lg border border-blue-400 bg-white p-8 text-center shadow-lg'>
                <img
                  src='/check.png'
                  alt='Success'
                  className='mx-auto mb-4 w-14'
                />
                <h3 className='mb-2 text-lg font-semibold text-black'>
                  Demande acceptée avec succès
                </h3>
                <p className='mb-6 text-sm text-gray-600'>
                  Un email a été envoyé à{' '}
                  <span className='font-medium'>{demande.email}</span> pour
                  l&apos;informer.
                </p>
                <Button
                  onClick={() => {
                    if (acceptFetcher.data?.interventionId) {
                      navigate(
                        `/interventions/${acceptFetcher.data.interventionId}`,
                      );
                    } else {
                      navigate('/demandes');
                    }
                  }}
                  className='mx-auto rounded-md bg-[#1D6BF3] font-medium text-white hover:bg-blue-700'
                >
                  OK
                </Button>
              </div>
            </div>
          )}

          {/* Rejection Modal - Updated to use rejectFetcher */}
          {showFailure && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm'>
              <div className='w-[90%] max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xl'>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100'>
                  <svg
                    className='size-10 text-red-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </div>

                <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                  Refuser cette demande
                </h3>

                <p className='mb-4 text-sm text-gray-600'>
                  Un email sera envoyé à{' '}
                  <span className='font-medium'>{demande.email}</span> pour
                  l&apos;informer.
                </p>

                <rejectFetcher.Form method='post'>
                  <div>
                    <input type='hidden' name='action' value='reject' />
                    <textarea
                      name='rejectionReason'
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className='mb-6 w-full rounded-md border border-gray-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                      placeholder='Introduire une raison de refus...'
                      rows={3}
                    />
                  </div>

                  <div className='flex justify-center gap-4'>
                    <Button
                      onClick={() => setShowFailure(false)}
                      type='button'
                      className='rounded-lg bg-gray-200 px-5 py-2.5 font-medium text-gray-800 transition-all duration-200 hover:bg-gray-300'
                      disabled={isRejectLoading}
                    >
                      Annuler
                    </Button>

                    <Button
                      type='submit'
                      className='rounded-lg bg-[#1D6BF3] px-5 py-2.5 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg'
                      disabled={isRejectLoading}
                    >
                      {isRejectLoading ? (
                        <div className='flex items-center gap-2'>
                          <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                          <span>Traitement...</span>
                        </div>
                      ) : (
                        'Confirmer'
                      )}
                    </Button>
                  </div>
                </rejectFetcher.Form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
