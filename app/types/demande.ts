import { Composant } from './composant';

export interface Intervention {
  id: number;
  composants_utilises: Composant[];
  created_at: string;
  numero_serie: string;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
  panne_trouvee: string;
  status: 'Termine' | 'enCours' | 'Irreparable';
  date_sortie: string | null;
  demande_id: number;
  technicien: number;
}

export interface Demande {
  id: number;
  interventions: Intervention[];
  type_materiel: string;
  marque: string;
  numero_inventaire: string;
  service_affectation: string;
  date_depot: string;
  nom_deposant: string;
  numero_telephone: string;
  email: string;
  status: string;
  panne_declaree: string;
  materiels_installes: Composant[];
  status_demande: 'Nouvelle' | 'Acceptee' | 'Rejetee';
}

export type DemandeStatus =
  | 'Acceptee'
  | 'EnAttente'
  | 'Rejetee'
  | 'Terminee'
  | 'Nouvelle';

export type Priority = 'Haute' | 'Moyenne' | 'Basse' | 'Non définie';

export interface FilterOption {
  label: string;
  value: string;
}

export interface UpdateFields {
  panne_trouvee?: string;
  materiels_installes?: string;
  status_demande?: DemandeStatus;
  rejection_reason?: string | null;
}
