export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const query = getQuery(event);
  const airData = await $fetch(
    `http://api.waqi.info/feed/geo:${query.lat};${query.lng}/?token=${config.apiKey}`
  );

  return {
    date: airData.data.time?.iso,
    name: airData.data.city?.name,
    value: airData.data.aqi,
    forecast: airData.data.forecast.daily.pm25.map((d) => ({
      date: d.day,
      value: d.avg,
    })),
    lat: airData.data.city?.geo[0],
    lng: airData.data.city?.geo[1],
  };
});
