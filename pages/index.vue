<template>
  <div class="px-6 flex flex-col">
    <div class="flex flex-col justify-center items-center py-20">
      <p class="capitalize text-base text-neutral-300">
        {{ currentCity.fullName }}
      </p>
      <p :class="textColour(cityData?.value)" class="text-9xl font-black">
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
      <div class="pt-20 flex justify-center">
        <MountainsIcon v-if="level === 1" class="w-32" />
        <WindIcon v-if="level === 2" class="w-32" />
        <ChimneyIcon v-if="level === 3" class="w-32 ml-20" />
        <SkullIcon v-if="level === 4" class="w-32" />
      </div>
    </div>
    <div class="flex justify-center items-center gap-6 my-12">
      <button
        v-for="city in myCities"
        :key="city.shortName"
        @click="currentCity = city"
        class="border border-nuetral-200 px-3 py-1 text-xs uppercase rounded bg-neutral-700 hover:bg-black text-slate-200"
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
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
};

const level: number = computed(() => {
  if (!cityData.value) return 0;
  if (cityData.value?.value <= 50) return 1;
  if (cityData.value?.value <= 100) return 2;
  if (cityData.value?.value <= 150) return 3;
  if (cityData.value?.value > 150) return 4;
});

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
