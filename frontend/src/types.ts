export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface Location {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  part_count: number;
}

export interface Part {
  id: number;
  name: string;
  manufacturer: string | null;
  mpn: string | null;
  description: string | null;
  value: string | null;
  package: string | null;
  quantity: number;
  unit: string;
  quantity_threshold: number;
  image_url: string | null;
  datasheet_url: string | null;
  tags: string | null;
  category_id: number | null;
  location_id: number | null;
  ai_confidence: number | null;
  ai_identified: boolean;
  created_at: string;
  updated_at: string;
  category: Category | null;
  location: Location | null;
}

export interface BOMItem {
  id: number;
  part_id: number;
  quantity_required: number;
  part: Part;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  bom_items: BOMItem[];
}

export interface ScanCandidate {
  name: string;
  manufacturer: string | null;
  mpn: string | null;
  category: string | null;
  value: string | null;
  package: string | null;
  description: string | null;
  confidence: number;
  matched_part_id: number | null;
}

export interface ScanResult {
  image_url: string;
  provider: string;
  candidates: ScanCandidate[];
  scan_log_id: number;
}

export interface LowStockAlert {
  part: Part;
  shortfall: number;
}

export interface AppSettings {
  ai_provider: string;
  ai_configured: boolean;
  mouser_configured: boolean;
  capture_key_is_default: boolean;
}
