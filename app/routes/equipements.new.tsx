import { useState } from 'react';
import Layout from '~/components/layout/Layout';
import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import { Upload, Cloud } from 'lucide-react';

interface Upload {
  name: string;
  size: string;
  progress: number; // 0 to 100
  status: 'uploading' | 'completed';
}

export default function AjouterEquipementPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploads, setUploads] = useState<Upload[]>([
    {
      name: 'naelbouk_ya_mahfodi.jpeg',
      size: '845kb',
      progress: 40,
      status: 'uploading',
    },
    {
      name: 'naelbouk_ya_mahfodi.jpeg',
      size: '845kb',
      progress: 100,
      status: 'completed',
    },
  ]);

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-6xl rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
        <h2 className='mb-6 text-center text-xl font-bold text-mpsi'>
          Informations d&apos;équipement
        </h2>

        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          {/* LEFT SIDE — FORM */}
          <div className='space-y-4'>
            <div className='w-full'>
              <label
                htmlFor='nom-equipement'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Nom d&apos;équipement
              </label>
              <Input
                id='nom-equipement'
                defaultValue='RAM 8GB'
                className='w-full'
              />
            </div>

            <div className='w-full'>
              <label
                htmlFor='designation'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Désignation
              </label>
              <Input
                id='designation'
                defaultValue='XMAKZHEKLAZH3'
                className='w-full'
              />
            </div>

            <div className='w-full'>
              <label
                htmlFor='modele'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Model / référence
              </label>
              <select
                id='modele'
                className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mpsi'
              >
                <option>SN351387AE</option>
              </select>
            </div>

            <div className='w-full'>
              <label
                htmlFor='numero-serie'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Numéro de série
              </label>
              <Input id='numero-serie' defaultValue='5AZEAZRJ' />
            </div>

            <div className='w-full'>
              <label
                htmlFor='numero-inventaire'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Numéro d&apos;inventaire
              </label>
              <Input id='numero-inventaire' defaultValue='5AZEAZRJZE' />
            </div>

            <div className='w-full'>
              <label
                htmlFor='description'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Déscription du matériel
              </label>
              <textarea
                id='description'
                rows={3}
                defaultValue='Lwessmou tkhssr..'
                className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='w-full'>
              <label
                htmlFor='service'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Service d&apos;affectation
              </label>
              <select
                id='service'
                className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mpsi'
              >
                <option value=''>Sélectionner un service</option>
                <option value='informatique'>Service Informatique</option>
                <option value='administratif'>Service Administratif</option>
                <option value='pedagogique'>Service Pédagogique</option>
                <option value='technique'>Service Technique</option>
                <option value='reseau'>Service Réseau</option>
              </select>
            </div>
          </div>

          {/* RIGHT SIDE — UPLOAD */}
          <div className='space-y-4'>
            <div>
              <h3 className='text-base font-semibold text-mpsi'>
                Télécharger des images
              </h3>
              <p className='text-sm text-gray-500'>
                Les images seront associées à cet équipement
              </p>
            </div>

            {/* Upload Dropzone */}
            <div className='cursor-pointer rounded-md border-2 border-dashed border-mpsi/30 bg-mpsi/5 px-6 py-10 text-center transition hover:bg-mpsi/10'>
              <div className='mb-3 flex justify-center'>
                <Cloud className='size-12 text-mpsi' />
              </div>
              <p className='text-sm font-medium text-mpsi'>
                Cliquer pour télécharger
              </p>
              <p className='text-xs text-gray-500'>
                ou glisser-déposer (Max: 25 Mo)
              </p>
            </div>

            <p className='mt-4 text-sm font-medium text-gray-700'>
              {uploads.length} fichiers en cours...
            </p>

            {/* Upload Status List */}
            <div className='space-y-4'>
              {uploads.map((file, idx) => (
                <div
                  key={idx}
                  className='flex items-center gap-4 rounded-md border border-gray-200 px-4 py-3 shadow-sm'
                >
                  <div className='flex size-10 items-center justify-center rounded-md bg-mpsi/10'>
                    <img
                      src='/equipement.png'
                      alt='preview'
                      className='size-8 rounded object-cover'
                    />
                  </div>
                  <div className='flex-1 text-sm'>
                    <p className='font-medium'>{file.name}</p>
                    <p className='text-xs text-gray-500'>Taille: {file.size}</p>
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
          </div>
        </div>

        {/* Submit Button */}
        <div className='mt-8 text-center'>
          <Button className='bg-mpsi px-8 py-2.5 text-white hover:bg-mpsi/90'>
            Enregistrer
          </Button>
        </div>
      </div>
    </Layout>
  );
}
