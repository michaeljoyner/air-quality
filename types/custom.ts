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
};

type City = {
  shortName: string;
  fullName: string;
};

export type { AqiValue, CityResponse, City };
