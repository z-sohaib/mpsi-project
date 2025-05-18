import { Pencil } from 'lucide-react';

type PhotoProfileProps = {
  firstName: string;
  lastName: string;
  email: string;
  imageSrc: string;
  onEditClick: () => void;
};

export default function PhotoProfile({
  firstName,
  lastName,
  email,
  imageSrc,
  onEditClick,
}: PhotoProfileProps) {
  return (
    <div className='w-full rounded-2xl border border-mpsi p-4 text-center shadow-sm'>
      <div className='relative mx-auto size-40 overflow-hidden rounded-full'>
        <img
          src={imageSrc}
          alt={`${firstName} ${lastName}`}
          className='size-full object-cover'
        />
        <button
          onClick={onEditClick}
          className='absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-full bg-blue-500 transition hover:bg-blue-600'
        >
          <Pencil size={14} color='white' />
        </button>
      </div>
      <div className='mt-4'>
        <h2 className='text-lg font-bold'>
          {firstName.toUpperCase()} {lastName}
        </h2>
        <p className='text-sm text-gray-700'>{email}</p>
      </div>
    </div>
  );
}
