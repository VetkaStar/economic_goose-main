export type RentablePlace = 'warehouse' | 'atelier' | 'market';

export interface CompanyRentState {
  isRented: Record<RentablePlace, boolean>;
  rentCosts: Record<RentablePlace, number>;
  dailyFees: Record<RentablePlace, number>;
}

export interface CompanyLocationState {
  // точки на карте соответствуют схеме CityMap (например, point-7 — дом игрока)
  currentPointId: number; // 1..20, старт 7
  discoveredPoints: number[];
}

export interface CompanyProgress {
  level: number;
  experience: number;
}

export interface CompanyState {
  location: CompanyLocationState;
  rent: CompanyRentState;
  progress: CompanyProgress;
}


