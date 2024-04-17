type AqiValue = number;

type ForecastDay = {
  date: string;
  value: AqiValue;
};

type CityResponse = {
  name: string;
  date: string;
  value: AqiValue;
  forecast: ForecastDay[];
  lat: number;
  lng: number;
};

type City = {
  idx: number,
  shortName: string;
  fullName: string;
  lat: number;
  lng: number;
};

type AqiRecord = {
  id: number;
  hour: number;
  value: number;
  created_at: number;
}

export type { AqiValue, CityResponse, City, AqiRecord };
