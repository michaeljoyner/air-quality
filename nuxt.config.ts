// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    apiKey: "AQI-KEY",
  },
  modules: ["@nuxtjs/tailwindcss"],
});
