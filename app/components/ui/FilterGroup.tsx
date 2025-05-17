import { Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FilterField {
  id: string;
  value: string | null;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string | null) => void;
}

interface FilterGroupProps {
  filters: FilterField[];
  onReset: () => void;
}

export default function FilterGroup({ filters, onReset }: FilterGroupProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  return (
    <div className='flex flex-1 items-center divide-x divide-blue-200 overflow-visible rounded-md border border-blue-200 text-sm shadow-sm'>
      <div className='flex items-center gap-2 px-6 py-3.5 font-medium text-mpsi'>
        <Filter className='size-5 text-mpsi' />
        Filtrer par
      </div>

      <div className='flex flex-1 divide-x divide-blue-200'>
        {filters.map((filter) => (
          <div key={filter.id} className='relative flex-1'>
            <button
              type='button'
              onClick={() =>
                setOpenFilter(openFilter === filter.id ? null : filter.id)
              }
              className='flex size-full items-center justify-between px-6 py-3.5 text-base text-gray-700 hover:bg-gray-50'
            >
              <span className={filter.value ? '' : 'text-gray-400'}>
                {filter.value
                  ? filter.options.find((opt) => opt.value === filter.value)
                      ?.label
                  : filter.placeholder}
              </span>
              <ChevronDown
                className={`size-5 text-gray-400 transition-transform duration-200 ${
                  openFilter === filter.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openFilter === filter.id && (
              <>
                <button
                  type='button'
                  aria-label='Close filter menu'
                  className='fixed inset-0 z-40 cursor-default'
                  onClick={() => setOpenFilter(null)}
                  onKeyDown={(e) => e.key === 'Escape' && setOpenFilter(null)}
                />
                <div className='absolute inset-x-0 top-[calc(100%+4px)] z-50 rounded-md border border-gray-200 bg-white py-1 shadow-lg'>
                  {filter.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        filter.onChange(opt.value);
                        setOpenFilter(null);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 
                        ${filter.value === opt.value ? 'bg-gray-50 font-medium text-mpsi' : 'text-gray-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className='flex shrink-0 items-center gap-2 px-6 py-3.5 font-medium text-red-500 transition hover:bg-red-50'
      >
        <RotateCcw className='size-5' />
        Reset Filter
      </button>
    </div>
  );
}
