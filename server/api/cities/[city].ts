export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const airData = await $fetch(
    `http://api.waqi.info/feed/${event.context.params.city}/?token=${config.apiKey}`
  );

  return {
    date: airData.data.time?.iso,
    name: airData.data.city?.name,
    value: airData.data.aqi,
    forecast: airData.data.forecast.daily.pm25.map((d) => ({
      date: d.day,
      value: d.avg,
    })),
  };
});
