import type { Config } from "@netlify/functions";
import { createClient } from "@libsql/client";
import type { City } from "~/types/custom";
import { ofetch } from "ofetch";

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

    for (let x = 0; x < cities.length, x++; ) {
      const city = cities[x];
      try {
        const cityData = await ofetch(
          `https://api.waqi.info/feed/geo:${city.lat};${city.lng}/?token=${aqiToken}`,
        );
        console.log(cityData);
        const dbResp = await client.execute({
          sql: "INSERT INTO records (city_id, hour, value) VALUES (?, ?, ?)",
          args: [
            city.id,
            new Date(cityData.data.time.s).getHours(),
            cityData.data.aqi,
          ],
        });
        console.log(dbResp);
      } catch (err) {
        console.log(err);
        throw err;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const config: Config = {
  schedule: "50 * * * *",
};
