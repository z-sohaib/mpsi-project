import { useState, useCallback } from 'react';
import FilterGroup from './FilterGroup';
import { Link } from '@remix-run/react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  placeholder: string;
  options: FilterOption[];
  type?: 'select' | 'date'; // Add type to support date picker
}

interface FilterState {
  [key: string]: string | null;
}

interface DemandFiltersProps {
  filterConfigs: FilterConfig[];
  onFiltersChange: (filters: FilterState) => void;
  showAddButton?: boolean;
  addButtonLink?: string;
  addButtonText?: string;
}

export function DemandFilters({
  filterConfigs,
  onFiltersChange,
  showAddButton = true,
  addButtonLink = '/demandes/new',
  addButtonText = 'Ajouter une demande',
}: DemandFiltersProps) {
  // Initialize state from filter configs
  const [filters, setFilters] = useState<FilterState>(() => {
    const initialState: FilterState = {};
    filterConfigs.forEach((config) => {
      initialState[config.id] = null;
    });
    return initialState;
  });

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterId: string, value: string | null) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [filterId]: value };
        // Notify parent component of filter changes
        onFiltersChange(newFilters);
        return newFilters;
      });
    },
    [onFiltersChange],
  );

  // Reset all filters
  const handleReset = useCallback(() => {
    const resetFilters: FilterState = {};
    filterConfigs.forEach((config) => {
      resetFilters[config.id] = null;
    });
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  }, [filterConfigs, onFiltersChange]);

  // Convert our state to the format expected by FilterGroup
  const filterGroupProps = filterConfigs.map((config) => ({
    id: config.id,
    placeholder: config.placeholder,
    value: filters[config.id],
    onChange: (value: string | null) => handleFilterChange(config.id, value),
    options: config.options,
    type: config.type || 'select', // Default to select if not specified
  }));

  return (
    <div className='flex w-full flex-wrap items-center justify-between gap-4'>
      <FilterGroup filters={filterGroupProps} onReset={handleReset} />

      {showAddButton && (
        <Link
          to={addButtonLink}
          className='rounded-md bg-[#1D6BF3] px-6 py-3.5 text-base text-white hover:bg-[#155dc2]'
        >
          {addButtonText}
        </Link>
      )}
    </div>
  );
}
