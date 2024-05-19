import type { Config } from "@netlify/functions";
import { createClient } from "@libsql/client";
import type { City } from "~/types/custom";
import { ofetch } from "ofetch";

import type { CityResponse } from "~/types/custom";
import { CityResponseSchema } from "~/types/custom";

type TursoCreds = {
  url: string;
  authToken: string;
};

export default async (req: Request) => {
  try {
    const creds: TursoCreds = {
      url: process.env.TURSO_DATABASE_URL || "",
      authToken: process.env.TURSO_AUTH_TOKEN || "",
    };

    const aqiToken = process.env.AQI_TOKEN;

    const client = createClient(creds);

    const resp = await client.execute("SELECT * FROM cities");

    const cities: City[] = resp.rows.map((row) => ({ ...row }));

    for (let x = 0; x < cities.length; x++) {
      const city = cities[x];
      const url = `https://api.waqi.info/feed/geo:${city.lat};${city.lng}/?token=${aqiToken}`;
      try {
        const cityData = await ofetch(url);
        const cityResponse: CityResponse = CityResponseSchema.parse(cityData);
        const dbResp = await client.execute({
          sql: "INSERT INTO records (city_id, hour, value) VALUES (?, ?, ?)",
          args: [
            city.id,
            new Date(cityResponse.data.time.iso).getHours(),
            cityResponse.data.aqi,
          ],
        });
      } catch (err) {
        throw err;
      }
    }
  } catch (err) {}
};

export const config: Config = {
  schedule: "0 * * * *",
};
