export interface ModelPricing {
  input: number;
  output: number;
  unit: string;
}

export interface Station {
  name: string;
  slug: string;
  url: string;
  description: string;
  models: string[];
  pricing: Record<string, ModelPricing>;
  features: string[];
  rating: number;
  paymentMethods: string[];
  docUrl?: string;
  updatedAt: string;
}

export type SortKey = 'price-asc' | 'price-desc' | 'rating-desc' | 'updated-desc';

export type ReportStatus = 'pending' | 'approved' | 'rejected';

export interface Report {
  id: string;
  name: string;
  url: string;
  description: string;
  models: string[];
  status: ReportStatus;
  createdAt: string;
}
