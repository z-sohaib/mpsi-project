// Fixed ProfileDetails.tsx
import { useState } from 'react';
interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
  permanentAddress: string;
  country: string;
}

interface ProfileDetailsProps {
  initialData: ProfileFormData;
}

export default function ProfileDetails({ initialData }: ProfileDetailsProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className='mx-auto max-w-4xl rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
      <h1 className='mb-8 text-3xl font-bold text-mpsi'>Détails du profil</h1>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div>
            <label htmlFor='name' className='mb-2 block text-gray-700'>
              Votre nom
            </label>
            <input
              id='name'
              type='text'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label htmlFor='username' className='mb-2 block text-gray-700'>
              Nom d&apos;utilisateur
            </label>
            <input
              id='username'
              type='text'
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className='w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label htmlFor='email' className='mb-2 block text-gray-700'>
              Email
            </label>
            <input
              id='email'
              type='email'
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className='w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label htmlFor='password' className='mb-2 block text-gray-700'>
              Mot de passe
            </label>
            <input
              id='password'
              type='password'
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className='w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <div>
          <label htmlFor='dateOfBirth' className='mb-2 block text-gray-700'>
            Date de naissance
          </label>
          <input
            id='dateOfBirth'
            type='text'
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
            className='w-full rounded-lg border border-gray-300 p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label
            htmlFor='permanentAddress'
            className='mb-2 block text-gray-700'
          >
            Adresse permanente
          </label>
          <input
            id='permanentAddress'
            type='text'
            value={formData.permanentAddress}
            onChange={(e) =>
              setFormData({ ...formData, permanentAddress: e.target.value })
            }
            className='w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label htmlFor='country' className='mb-2 block text-gray-700'>
            Pays
          </label>
          <input
            id='country'
            type='text'
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            className='w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div className='flex justify-center pt-8'>
          <button
            type='submit'
            className='w-64 rounded-lg bg-mpsi py-4 text-lg font-medium text-white shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
