import { useState, useEffect } from 'react';
import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigate } from '@remix-run/react';
import Layout from '~/components/layout/Layout';
import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import { Cloud } from 'lucide-react';
import { requireUserId } from '~/session.server';

// Define the form data interface matching the API structure
interface ComposantFormData {
  type_composant: 'Nouveau' | 'Ancien';
  model_reference: string;
  numero_serie: string;
  designation: string;
  observation: string;
  numero_serie_eq_source: string;
  numero_inventaire_eq_source: string;
  quantity: number;
  disponible: boolean;
}

// Define interface for file uploads
interface Upload {
  name: string;
  size: string;
  progress: number; // 0 to 100
  status: 'uploading' | 'completed';
  preview: string; // URL for image preview
}

// Define the categories for the dropdown
const categories = [
  { id: 1, designation: 'Processeurs' },
  { id: 2, designation: 'Mémoires RAM' },
  { id: 3, designation: 'Disques durs' },
  { id: 4, designation: 'Cartes graphiques' },
  { id: 5, designation: 'Cartes mères' },
  { id: 6, designation: 'Alimentations' },
];

// Action function to handle form submission
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Check if user is authenticated
    const session = await requireUserId(request);

    // Parse form data
    const formData = await request.formData();
    const composantData = {
      type_composant: formData.get('type_composant') as 'Nouveau' | 'Ancien',
      model_reference: formData.get('model_reference') as string,
      numero_serie: formData.get('numero_serie') as string,
      designation: formData.get('designation') as string,
      observation: formData.get('observation') as string,
      categorie_details: formData.get('categorie')
        ? {
            id_categorie: parseInt(formData.get('categorie') as string),
            designation:
              categories.find(
                (cat) =>
                  cat.id === parseInt(formData.get('categorie') as string),
              )?.designation || '',
          }
        : null,
      numero_serie_eq_source: formData.get('numero_serie_eq_source') as string,
      numero_inventaire_eq_source: formData.get(
        'numero_inventaire_eq_source',
      ) as string,
      quantity: parseInt(formData.get('quantity') as string) || 1,
      disponible: formData.get('disponible') === 'true',
    };

    // Validation
    const errors: Record<string, string> = {};
    if (!composantData.type_composant)
      errors.type_composant = 'Le type de composant est requis';
    if (!composantData.numero_serie)
      errors.numero_serie = 'Le numéro de série est requis';
    if (!composantData.designation)
      errors.designation = 'La désignation est requise';
    if (composantData.quantity <= 0)
      errors.quantity = 'La quantité doit être positive';

    if (Object.keys(errors).length > 0) {
      return json({ errors, success: false });
    }

    // Send data to the API
    try {
      const response = await fetch(
        'https://itms-mpsi.onrender.com/api/composants/',
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${session.access}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(composantData),
        },
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      // Return success response
      return redirect('/composants');
    } catch (error) {
      console.error('Failed to create composant:', error);
      return json({
        errors: {
          form: 'Une erreur est survenue lors de la création du composant',
        },
        success: false,
      });
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

export default function AjouterComposantPage() {
  const actionData = useActionData<{
    errors?: Record<string, string>;
    success?: boolean;
  }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ComposantFormData>({
    type_composant: 'Nouveau',
    model_reference: '',
    numero_serie: '',
    designation: '',
    observation: '',
    numero_serie_eq_source: '',
    numero_inventaire_eq_source: '',
    quantity: 1,
    disponible: true,
  });

  // State for file uploads
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'quantity') {
      setFormData((prev) => ({ ...prev, [name]: value ? parseInt(value) : 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Process uploaded files
  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      // Simulate upload progress
      const fileSize = (file.size / 1024).toFixed(0) + 'KB';

      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);

      const newUpload: Upload = {
        name: file.name,
        size: fileSize,
        progress: 0,
        status: 'uploading',
        preview: previewUrl,
      };

      setUploads((prev) => [...prev, newUpload]);

      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress <= 100) {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.name === file.name
                ? {
                    ...upload,
                    progress,
                    status: progress === 100 ? 'completed' : 'uploading',
                  }
                : upload,
            ),
          );
        } else {
          clearInterval(interval);
        }
      }, 300);
    });
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all object URLs to avoid memory leaks
      uploads.forEach((upload) => {
        if (upload.preview) {
          URL.revokeObjectURL(upload.preview);
        }
      });
    };
  }, [uploads]);

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-4xl rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
        <h2 className='mb-6 text-center text-xl font-bold text-mpsi'>
          Ajouter un nouveau composant
        </h2>

        {actionData?.errors?.form && (
          <div className='mb-6 rounded-md bg-red-50 p-4 text-red-600'>
            {actionData.errors.form}
          </div>
        )}

        <Form
          method='post'
          className='grid grid-cols-1 gap-6 md:grid-cols-2'
          encType='multipart/form-data'
        >
          {/* Left side - Form fields */}
          <div className='space-y-4'>
            {/* Type de composant */}
            <div className='w-full'>
              <label
                htmlFor='type_composant'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Type de composant*
              </label>
              <select
                id='type_composant'
                name='type_composant'
                value={formData.type_composant}
                onChange={handleInputChange}
                className='w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mpsi'
              >
                <option value='Nouveau'>Nouveau</option>
                <option value='Ancien'>Ancien</option>
              </select>
              {actionData?.errors?.type_composant && (
                <p className='mt-1 text-sm text-red-500'>
                  {actionData.errors.type_composant}
                </p>
              )}
            </div>

            {/* Modèle / Référence */}
            <div className='w-full'>
              <label
                htmlFor='model_reference'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Modèle / Référence
              </label>
              <Input
                id='model_reference'
                name='model_reference'
                value={formData.model_reference}
                onChange={handleInputChange}
                placeholder='Ex: RAM-DDR4-16GB'
                className='w-full'
              />
            </div>

            {/* Numéro de série */}
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
                value={formData.numero_serie}
                onChange={handleInputChange}
                placeholder='Ex: SN12345678'
                className='w-full'
              />
              {actionData?.errors?.numero_serie && (
                <p className='mt-1 text-sm text-red-500'>
                  {actionData.errors.numero_serie}
                </p>
              )}
            </div>

            {/* Désignation */}
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
                value={formData.designation}
                onChange={handleInputChange}
                placeholder='Ex: Mémoire RAM DDR4 16GB'
                className='w-full'
              />
              {actionData?.errors?.designation && (
                <p className='mt-1 text-sm text-red-500'>
                  {actionData.errors.designation}
                </p>
              )}
            </div>

            {/* Catégorie */}
            <div className='w-full'>
              <label
                htmlFor='categorie'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Catégorie
              </label>
              <select
                id='categorie'
                name='categorie'
                className='w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mpsi'
              >
                <option value=''>Sélectionnez une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.designation}
                  </option>
                ))}
              </select>
            </div>

            {/* Observation */}
            <div className='w-full'>
              <label
                htmlFor='observation'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Observation
              </label>
              <textarea
                id='observation'
                name='observation'
                rows={3}
                value={formData.observation}
                onChange={handleInputChange}
                placeholder='Ex: Composant en bon état'
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Right side - More fields + Upload */}
          <div className='space-y-4'>
            {/* Fields for "Ancien" type components */}
            {formData.type_composant === 'Ancien' && (
              <>
                {/* Numéro de série équipement source */}
                <div className='w-full'>
                  <label
                    htmlFor='numero_serie_eq_source'
                    className='mb-1 block text-sm font-medium text-gray-700'
                  >
                    N° série équipement source
                  </label>
                  <Input
                    id='numero_serie_eq_source'
                    name='numero_serie_eq_source'
                    value={formData.numero_serie_eq_source}
                    onChange={handleInputChange}
                    placeholder='Ex: SRC-123456'
                    className='w-full'
                  />
                </div>

                {/* Numéro d'inventaire équipement source */}
                <div className='w-full'>
                  <label
                    htmlFor='numero_inventaire_eq_source'
                    className='mb-1 block text-sm font-medium text-gray-700'
                  >
                    N° inventaire équipement source
                  </label>
                  <Input
                    id='numero_inventaire_eq_source'
                    name='numero_inventaire_eq_source'
                    value={formData.numero_inventaire_eq_source}
                    onChange={handleInputChange}
                    placeholder='Ex: INV-2023-001'
                    className='w-full'
                  />
                </div>
              </>
            )}

            {/* Fields for "Nouveau" type components */}
            {formData.type_composant === 'Nouveau' && (
              <>
                {/* Quantité */}
                <div className='w-full'>
                  <label
                    htmlFor='quantity'
                    className='mb-1 block text-sm font-medium text-gray-700'
                  >
                    Quantité*
                  </label>
                  <Input
                    id='quantity'
                    name='quantity'
                    type='number'
                    min='1'
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className='w-full'
                  />
                  {actionData?.errors?.quantity && (
                    <p className='mt-1 text-sm text-red-500'>
                      {actionData.errors.quantity}
                    </p>
                  )}
                </div>

                {/* Disponibilité */}
                <div className='flex w-full items-center'>
                  <div className='flex items-center space-x-2'>
                    <input
                      id='disponible'
                      name='disponible'
                      type='checkbox'
                      className='size-4 rounded border-gray-300 text-mpsi focus:ring-mpsi'
                      checked={formData.disponible}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          disponible: e.target.checked,
                        }))
                      }
                    />
                    <label
                      htmlFor='disponible'
                      className='text-sm font-medium text-gray-700'
                    >
                      Composant disponible
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Image upload section */}
            <div className='mt-2 space-y-2'>
              <div>
                <h3 className='text-base font-semibold text-mpsi'>
                  Image du composant
                </h3>
                <p className='text-sm text-gray-500'>
                  Ajoutez une image pour identifier ce composant
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                role='button'
                tabIndex={0}
                className={`cursor-pointer rounded-md border-2 border-dashed ${
                  dragActive
                    ? 'border-mpsi bg-mpsi/10'
                    : 'border-mpsi/30 bg-mpsi/5'
                } px-6 py-8 text-center transition hover:bg-mpsi/10`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload')?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    document.getElementById('image-upload')?.click();
                  }
                }}
              >
                <input
                  type='file'
                  id='image-upload'
                  name='image'
                  accept='image/*'
                  onChange={handleFileChange}
                  className='hidden'
                />
                <div className='mb-3 flex justify-center'>
                  <Cloud className='size-12 text-mpsi' />
                </div>
                <p className='text-sm font-medium text-mpsi'>
                  Cliquer pour télécharger
                </p>
                <p className='text-xs text-gray-500'>
                  ou glisser-déposer (Max: 5 Mo)
                </p>
              </div>

              {/* Display uploaded files */}
              {uploads.length > 0 && (
                <>
                  <p className='mt-4 text-sm font-medium text-gray-700'>
                    {uploads.length} fichier{uploads.length > 1 ? 's' : ''} en
                    cours...
                  </p>

                  <div className='space-y-3'>
                    {uploads.map((file, idx) => (
                      <div
                        key={idx}
                        className='flex items-center gap-4 rounded-md border border-gray-200 px-4 py-3 shadow-sm'
                      >
                        <div className='flex size-10 items-center justify-center rounded-md bg-mpsi/10'>
                          <img
                            src={file.preview || '/equipement.png'}
                            alt={file.name}
                            className='size-8 rounded object-cover'
                            onError={(e) => {
                              e.currentTarget.src = '/equipement.png';
                            }}
                          />
                        </div>
                        <div className='flex-1 text-sm'>
                          <p className='font-medium'>{file.name}</p>
                          <p className='text-xs text-gray-500'>
                            Taille: {file.size}
                          </p>
                          <div className='mt-2 h-2 rounded bg-gray-100'>
                            <div
                              className={`h-2 rounded transition-all duration-500 ${
                                file.status === 'completed'
                                  ? 'bg-green-500'
                                  : 'bg-mpsi'
                              }`}
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        {file.status === 'completed' ? (
                          <span className='text-xs font-medium text-green-500'>
                            Téléchargé
                          </span>
                        ) : (
                          <span className='text-xs font-medium text-mpsi'>
                            {file.progress}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className='col-span-full mt-8 flex justify-center space-x-4'>
            <Button
              type='button'
              variant='outline'
              className='border-gray-300 px-4 py-2 text-gray-700'
              onClick={() => navigate('/composants')}
            >
              Annuler
            </Button>
            <Button
              type='submit'
              className='bg-mpsi px-4 py-2 text-white hover:bg-mpsi/90'
            >
              Enregistrer
            </Button>
          </div>
        </Form>
      </div>
    </Layout>
  );
}
