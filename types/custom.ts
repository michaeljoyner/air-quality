import { z } from "zod";
type AqiValue = number;

const CityResponseSchema = z.object({
  data: z.object({
    time: z.object({
      iso: z.string(),
    }),
    city: z.object({
      name: z.string(),
      geo: z.number().array(),
    }),
    aqi: z.number(),
    forecast: z.object({
      daily: z.object({
        pm25: z
          .object({
            day: z.string(),
            avg: z.number(),
          })
          .array(),
      }),
    }),
  }),
});

type ForecastDay = {
  date: string;
  value: AqiValue;
};

type CityResponse = z.infer<typeof CityResponseSchema>;

type City = {
  idx: number;
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
};

export type { AqiValue, CityResponse, City, AqiRecord };
export { CityResponseSchema };
