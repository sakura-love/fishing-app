export interface CatchRecord {
  id: string;
  fishSpeciesId: string;
  fishName: string;
  photoUri?: string;
  length?: number;
  weight?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  caughtAt: string;
  notes?: string;
  identifiedBy: 'manual' | 'ai';
}

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  textDay: string;
  iconDay: string;
  windSpeed: number;
  humidity: number;
  precip: number;
  waterTemp: number;
}

export interface IdentifyResult {
  name: string;
  speciesId: string;
  confidence: number;
  description: string;
}
