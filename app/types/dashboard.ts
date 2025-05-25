export type Total = {
  name: string;
  value: number;
  'pourcentage diff': number;
};

export type MonthlyData = {
  month: string;
  value: number;
};

export type YearlyData = {
  year: number;
  months: MonthlyData[];
};

export type YearTotal = {
  year: number;
  total: number;
};

export type DemandeStats = {
  year: number;
  total: number;
  'total rejetee': number;
  'total acceptee': number;
  demande_years: YearTotal[];
};

export type InterventionsStats = {
  year: number;
  total: number;
  'total irreparable': number;
  'total completed': number;
  'total encours': number;
  intervention_years: YearTotal[];
};

export type ComposantStats = {
  year: number;
  total: number;
  'total ancien': number;
  'total nouveau': number;
  composant_years: YearTotal[];
};

export type EquipementStats = {
  year: number;
  total: number;
};

export type DashboardData = {
  totals: Total[];
  demandes: YearlyData[];
  demandestats: DemandeStats;
  interventionsstats: InterventionsStats;
  composantstats: ComposantStats;
  equipementstats: EquipementStats[];
};
