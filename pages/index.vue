<template>
  <div class="px-6 h-full flex flex-col">
    <div class="flex flex-col justify-center items-center py-20">
      <p :class="textColour(cityData?.value)" class="text-8xl font-black">
        {{ cityData?.value }}
      </p>
      <p class="text-xs text-neutral-300 mt-3">{{ cityData?.name }}</p>
      <p class="text-xs text-neutral-300 mt-3">
        {{ timeOfDay(cityData?.date) }}
      </p>
    </div>
    <div class="flex-1">
      <div
        class="flex gap-3 justify-strat md:justify-center max-w-full overflow-x-auto"
      >
        <div
          v-for="day in cityData?.forecast"
          class="p-4 rounded-md bg-neutral-700 flex flex-col items-center"
        >
          <p :class="textColour(day.value)" class="font-black text-xl">
            {{ day.value }}
          </p>
          <p class="text-xs whitespace-nowrap">{{ shortDate(day.date) }}</p>
        </div>
      </div>
    </div>
    <div class="flex justify-center items-center gap-6 my-12">
      <button
        v-for="city in myCities"
        :key="city.shortName"
        @click="currentCity = city"
        class="border border-emerald-500 px-3 py-1 text-xs uppercase rounded bg-neutral-700 text-emerald-300"
      >
        {{ city.shortName }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { City, CityResponse } from "@/types/custom.ts";

const myCities: City[] = [
  { shortName: "Taichung", fullName: "taichung" },
  { shortName: "Taipei", fullName: "taipei" },
  { shortName: "PMB", fullName: "pietermaritzburg" },
];

const currentCity: Ref<City> = ref({
  shortName: "Taichung",
  fullName: "taichung",
});
const cityData: Ref<null | CityResponse> = ref(null);

watch(
  () => currentCity.value,
  (city: City) => changeCity(city.fullName)
);

const { data } = await useFetch<CityResponse>("/api/cities/taichung");
cityData.value = data.value;

const changeCity = async (city: string) => {
  const data = await $fetch<CityResponse>(`/api/cities/${city}`);
  cityData.value = data;
};

const shortDate = (date: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
};

const timeOfDay = (date: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const textColour = (val: number): string => {
  const key = Math.floor(val / 50);
  const lookup = {
    0: "text-blue-400",
    1: "text-emerald-400",
    2: "text-yellow-400",
    3: "text-orange-400",
    4: "text-red-400",
    5: "text-white",
  };
  return lookup[key] || "text-gray-100";
};
</script>
