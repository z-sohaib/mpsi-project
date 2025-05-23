import { useState } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import { ActionFunctionArgs, json } from '@remix-run/node';
import Layout from '~/components/layout/Layout';
import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import { requireUserId } from '~/session.server';
import { createEquipement } from '~/models/equipements.server';

// Type for the action data returned to the client
type ActionData = {
  errors?: {
    model_reference?: string;
    numero_serie?: string;
    designation?: string;
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
    const model_reference = formData.get('model_reference') as string;
    const numero_serie = formData.get('numero_serie') as string;
    const designation = formData.get('designation') as string;
    const observation = formData.get('observation') as string;
    const numero_inventaire = formData.get('numero_inventaire') as string;

    // Validate required fields
    const errors: ActionData['errors'] = {};
    if (!model_reference)
      errors.model_reference = 'Le modèle/référence est requis';
    if (!numero_serie) errors.numero_serie = 'Le numéro de série est requis';
    if (!designation) errors.designation = 'La désignation est requise';

    // Return errors if validation fails
    if (Object.keys(errors).length > 0) {
      return json({ errors, success: false }, { status: 400 });
    }

    // Create the payload for the API
    const equipementPayload = {
      model_reference,
      numero_serie,
      designation,
      observation,
      numero_inventaire,
    };

    // Use the server function to create the equipement
    await createEquipement(session.access, equipementPayload);

    return json({ success: true });
  } catch (error) {
    console.error('Error submitting equipement:', error);
    return json(
      {
        errors: {
          form:
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de la création de l'équipement",
        },
        success: false,
      },
      { status: 500 },
    );
  }
}

export default function AjouterEquipementPage() {
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
      <div className='mx-auto my-8 max-w-3xl rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
        <h2 className='mb-6 text-center text-xl font-bold text-mpsi'>
          Informations d&apos;équipement
        </h2>

        {/* Display form-level errors */}
        {fetcher.data?.errors?.form && (
          <div className='mb-6 rounded-md bg-red-50 p-4 text-red-600'>
            <p>{fetcher.data.errors.form}</p>
          </div>
        )}

        <fetcher.Form method='post' className='space-y-4'>
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
              placeholder='Ex: DELL-PowerEdge-R740'
              className={`w-full ${fetcher.data?.errors?.model_reference ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
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
              placeholder='Ex: DELL-SRV-010'
              className={`w-full ${fetcher.data?.errors?.numero_serie ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
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
              placeholder='Ex: Dell PowerEdge R740 - Réformé pour dommages irréparables'
              className={`w-full ${fetcher.data?.errors?.designation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
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
              placeholder='Ex: INV-2023-010'
              className='w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            />
          </div>

          <div className='w-full'>
            <label
              htmlFor='observation'
              className='mb-1 block text-sm font-medium text-gray-700'
            >
              Observations
            </label>
            <textarea
              id='observation'
              name='observation'
              rows={3}
              placeholder='Ex: Multiple disques durs endommagés, carte mère défectueuse...'
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* Submit Button */}
          <div className='mt-8 text-center'>
            <Button
              type='submit'
              className='bg-mpsi px-8 py-2.5 text-white hover:bg-mpsi/90 disabled:opacity-70'
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
                Équipement enregistré avec succès
              </h3>
              <p className='mb-6 text-sm text-gray-600'>
                L&apos;équipement a bien été ajouté à l&apos;inventaire.
              </p>
              <Button
                onClick={() => navigate('/equipements')}
                className='mx-auto rounded-md bg-mpsi font-medium text-white hover:bg-mpsi/90'
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
