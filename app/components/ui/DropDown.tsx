import { useState } from 'react';

type DropdownProps = {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  label: string;
};

export default function ModernDropdown({
  options,
  selected,
  onChange,
  label,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className='relative'>
      <button
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className='flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm transition duration-300 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-mpsi'
      >
        <span className='mr-2'>{label}: </span>
        {selected}
        <span className='ml-2'>▼</span>
      </button>
      {isOpen && (
        <div className='absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg'>
          {options.map((option) => (
            <div
              key={option}
              role='option'
              tabIndex={0}
              aria-selected={selected === option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onChange(option);
                  setIsOpen(false);
                }
              }}
              className='cursor-pointer px-4 py-2 transition-colors duration-200 hover:bg-mpsi hover:text-white'
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
