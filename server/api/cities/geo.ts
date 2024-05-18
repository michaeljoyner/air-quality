import type { CityResponse } from "~/types/custom";
import { CityResponseSchema } from "~/types/custom";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const query = getQuery(event);
  const airData = await $fetch(
    `http://api.waqi.info/feed/geo:${query.lat};${query.lng}/?token=${config.apiKey}`,
  );

  if (CityResponseSchema.safeParse(airData)) {
    return CityResponseSchema.parse(airData);
  }

  throw new Error("bad response");
});
