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
  shortName: string;
  fullName: string;
  lat: number;
  lng: number;
};

export type { AqiValue, CityResponse, City };
