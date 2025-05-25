// Equipment interface that can be shared between client and server
export interface Equipement {
  id?: number;
  model_reference: string;
  numero_serie: string;
  designation: string;
  observation: string;
  numero_inventaire: string;
  created_at: string;
  modified_at?: string;
  status?: string;
}

// Filter option type for dropdowns
export interface FilterOption {
  label: string;
  value: string;
}
