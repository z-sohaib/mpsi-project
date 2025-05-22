import { useState } from 'react';
import Layout from '~/components/layout/Layout';
import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';

interface EquipementFormData {
  model_reference: string;
  numero_serie: string;
  designation: string;
  observation: string;
  numero_inventaire: string;
}

export default function AjouterEquipementPage() {
  const [formData, setFormData] = useState<EquipementFormData>({
    model_reference: '',
    numero_serie: '',
    designation: '',
    observation: '',
    numero_inventaire: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        model_reference: formData.model_reference,
        numero_serie: formData.numero_serie,
        designation: formData.designation,
        observation: formData.observation,
        numero_inventaire: formData.numero_inventaire,
      };

      // Replace with your actual API endpoint
      const response = await fetch(
        'https://itms-mpsi.onrender.com/api/equipements/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        alert('Équipement ajouté avec succès !');
        // Optionally reset form or redirect
      } else {
        console.error(
          'Failed to submit equipement:',
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error('Error submitting equipement:', error);
    }
  };

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-3xl rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
        <h2 className='mb-6 text-center text-xl font-bold text-mpsi'>
          Informations d&apos;équipement
        </h2>

        <form
          id='equipement-form'
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          <div className='w-full'>
            <label
              htmlFor='model_reference'
              className='mb-1 block text-sm font-medium text-gray-700'
            >
              Modèle / Référence
            </label>
            <Input
              id='model_reference'
              value={formData.model_reference}
              onChange={handleInputChange}
              placeholder='Ex: DELL-PowerEdge-R740'
              className='w-full'
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
              value={formData.numero_serie}
              onChange={handleInputChange}
              placeholder='Ex: DELL-SRV-010'
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
              value={formData.designation}
              onChange={handleInputChange}
              placeholder='Ex: Dell PowerEdge R740 - Réformé pour dommages irréparables'
              className='w-full'
            />
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
              value={formData.numero_inventaire}
              onChange={handleInputChange}
              placeholder='Ex: INV-2023-010'
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
              rows={3}
              value={formData.observation}
              onChange={handleInputChange}
              placeholder='Ex: Multiple disques durs endommagés, carte mère défectueuse...'
              className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* Submit Button */}
          <div className='mt-8 text-center'>
            <Button
              type='submit'
              className='bg-mpsi px-8 py-2.5 text-white hover:bg-mpsi/90'
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
