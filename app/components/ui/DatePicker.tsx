import { X } from 'lucide-react';

interface DatePickerProps {
  id: string;
  name: string;
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  placeholder?: string;
}

export function DatePicker({
  id,
  name,
  value,
  onChange,
  className = '',
  placeholder = 'Sélectionner une date',
}: DatePickerProps) {
  return (
    <div className='relative'>
      <input
        id={id}
        name={name}
        type='date'
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={`h-10 w-full appearance-none rounded-md border bg-transparent px-4 py-2 text-sm focus:border-mpsi focus:outline-none focus:ring-1 focus:ring-mpsi ${className} ${value ? '' : 'text-gray-400'}`}
        placeholder={placeholder}
      />
      {value && (
        <button
          type='button'
          className='absolute right-8 top-1/2 -translate-y-1/2'
          onClick={() => onChange(null)}
        >
          <X size={16} className='text-gray-400 hover:text-gray-600' />
        </button>
      )}
    </div>
  );
}
