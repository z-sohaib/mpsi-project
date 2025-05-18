import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import Layout from '~/components/layout/Layout';
import { useState, useEffect } from 'react';
import { useLoaderData, useParams, useNavigate } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { motion, AnimatePresence } from 'framer-motion';

// Types for the API data
type PrioriteType = 'Haute' | 'Moyenne' | 'Basse';
type StatusDemandeType = 'Acceptee' | 'EnAttente' | 'Rejetee' | 'Terminee';

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
}

// Loader function to fetch data based on id
export const loader: LoaderFunction = async ({ params }) => {
  console.log('Loader called with params:', params);
  const demandeId = params.id;

  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/demandes/${demandeId}/`,
    );

    if (!response.ok) {
      throw new Response('Demande not found', { status: 404 });
    }

    const demande = await response.json();
    return demande;
  } catch (error) {
    console.error('Error fetching demande:', error);
    throw new Response('Error fetching demande data', { status: 500 });
  }
};

export default function DemandeDetailleePage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panneTrouvee, setPanneTrouvee] = useState('');
  const [materielsInstalles, setMaterielsInstalles] = useState('');
  const [modified, setModified] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);

  const demande = useLoaderData<Demande>();
  const { id } = useParams();
  const navigate = useNavigate();

  // Track if fields are modified
  useEffect(() => {
    setModified(panneTrouvee !== '' || materielsInstalles !== '');
  }, [panneTrouvee, materielsInstalles]);

  // Format the date for input fields
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  // Handle saving modifications
  const handleSaveChanges = async () => {
    setSavingChanges(true);
    try {
      const response = await fetch(
        `https://itms-mpsi.onrender.com/api/demandes/${id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            panne_trouvee: panneTrouvee,
            materiels_installes: materielsInstalles,
            // Add any other modified fields here
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Error updating demande: ${response.status}`);
      }

      setModified(false);
      setSavingChanges(false);
      // Show mini toast
      const toast = document.createElement('div');
      toast.className =
        'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg';
      toast.textContent = 'Modifications enregistrées!';
      document.body.appendChild(toast);
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSavingChanges(false);
    }
  };

  // Handle accepting the demande
  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://itms-mpsi.onrender.com/api/demandes/${id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status_demande: 'Acceptee',
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Error updating demande: ${response.status}`);
      }

      setShowSuccess(true);
      setLoading(false);
      navigate('/demandes/interventions'); // Redirect to the list after rejection
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  // Handle rejecting the demande
  const handleReject = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://itms-mpsi.onrender.com/api/demandes/${id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status_demande: 'Rejetee',
            // You could also send the rejection reason if the API supports it
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Error updating demande: ${response.status}`);
      }

      setShowFailure(false);
      setLoading(false);
      navigate('/demandes/interventions'); // Redirect to the list after rejection
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  // Handle modal close and navigation back to list
  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/demandes');
  };

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-4xl px-4 md:px-0'>
        <div className='rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
          <h2 className='mb-6 text-center text-xl font-bold text-[#1D6BF3]'>
            Demande détaillée
          </h2>

          {loading && (
            <div className='flex justify-center py-4'>
              <div className='size-8 animate-spin rounded-full border-b-2 border-mpsi'></div>
            </div>
          )}

          {error && (
            <div className='mb-4 rounded-md bg-red-100 p-4 text-red-700'>
              {error}
            </div>
          )}

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

            {/* Panne trouvée */}
            <div className='w-full'>
              <label
                htmlFor='panne-trouvee'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Panne trouvée
              </label>
              <textarea
                id='panne-trouvee'
                rows={1}
                value={panneTrouvee}
                onChange={(e) => {
                  setPanneTrouvee(e.target.value);
                }}
                className='w-full rounded-md border px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                htmlFor='materiels-installes'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Matériels installés
              </label>
              <Input
                id='materiels-installes'
                value={materielsInstalles}
                onChange={(e) => {
                  setMaterielsInstalles(e.target.value);
                }}
                className='w-full rounded-md border px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
          </form>

          {/* Buttons */}
          <div className='mt-10 flex justify-center gap-6'>
            {modified && (
              <Button
                className='flex items-center gap-2 bg-blue-500 px-8 hover:bg-blue-600'
                onClick={handleSaveChanges}
                disabled={savingChanges}
              >
                {savingChanges ? (
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
            <Button
              className='bg-red-500 px-8 hover:bg-red-600'
              onClick={() => setShowFailure(true)}
              disabled={loading || savingChanges}
            >
              Refuser
            </Button>
            <Button
              className='bg-green-500 px-8 hover:bg-green-600'
              onClick={handleAccept}
              disabled={loading || savingChanges}
            >
              Accepter
            </Button>
          </div>

          {/* ✅ Success Modal */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className='fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className='w-[90%] max-w-lg rounded-xl border border-blue-400 bg-white p-8 text-center shadow-xl'
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <motion.div
                    className='mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100'
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <svg
                      className='size-10 text-green-600'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <motion.path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M5 13l4 4L19 7'
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                      />
                    </svg>
                  </motion.div>
                  <motion.h3
                    className='mb-2 text-xl font-semibold text-gray-900'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Demande acceptée avec succès
                  </motion.h3>
                  <motion.p
                    className='mb-6 text-sm text-gray-600'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Un email a été envoyé à{' '}
                    <span className='font-medium'>{demande.email}</span> pour
                    l&apos;informer.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={handleSuccessClose}
                      className='mx-auto rounded-lg bg-[#1D6BF3] px-6 py-2.5 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg'
                    >
                      OK
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ❌ Failure Modal */}
          <AnimatePresence>
            {showFailure && (
              <motion.div
                className='fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className='w-[90%] max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xl'
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <motion.div
                    className='mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100'
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <svg
                      className='size-10 text-red-600'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <motion.path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M6 18L18 6M6 6l12 12'
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                      />
                    </svg>
                  </motion.div>
                  <motion.h3
                    className='mb-2 text-xl font-semibold text-gray-900'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Refuser cette demande
                  </motion.h3>
                  <motion.p
                    className='mb-4 text-sm text-gray-600'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Un email sera envoyé à{' '}
                    <span className='font-medium'>{demande.email}</span> pour
                    l&apos;informer.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className='mb-6 w-full rounded-md border border-gray-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                      placeholder='Introduire une raison de refus...'
                      rows={3}
                    />
                  </motion.div>
                  <motion.div
                    className='flex justify-center gap-4'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={() => setShowFailure(false)}
                      className='rounded-lg bg-gray-200 px-5 py-2.5 font-medium text-gray-800 transition-all duration-200 hover:bg-gray-300'
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleReject}
                      className='rounded-lg bg-[#1D6BF3] px-5 py-2.5 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg'
                      disabled={loading}
                    >
                      {loading ? (
                        <span className='inline-block size-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent'></span>
                      ) : (
                        'Confirmer'
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
