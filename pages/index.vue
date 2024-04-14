<template>
  <div class="px-6 flex flex-col">
    <div class="flex flex-col justify-center items-center py-20">
      <p class="capitalize text-base text-neutral-300 font-semibold">
        {{ currentCity.fullName }}
      </p>
      <p :class="textColour(cityData?.value)" class="text-9xl font-black">
        {{ cityData?.value }}
      </p>
      <p class="text-xs text-neutral-300 mt-3">
        {{ timeOfDay(cityData?.date) }}
      </p>
      <p class="text-xs text-neutral-300 mt-3">{{ cityData?.name }}</p>

      <p class="text-xs text-neutral-300">{{ distanceAway }}</p>
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
    <div class="flex justify-center">
      <button
        class="bg-neutral-900 px-12 pt-4 pb-2 rounded-t-full border border-rose-500 border-b-0"
        @click="showLocations = !showLocations"
      >
        <LocationIcon class="w-12 h-12 text-rose-500" />
      </button>
    </div>
    <Transition
      enter-from-class="translate-y-full"
      leave-to-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-from-class="translate-y-0"
    >
      <div
        v-show="showLocations"
        class="fixed left-0 bottom-0 w-screen bg-neutral-700 transition-transform rounded-tl-lg rounded-tr-lg"
      >
        <div class="flex flex-col justify-center items-start gap-6 my-12 px-8">
          <button
            v-for="city in myCities"
            :key="city.shortName"
            @click="currentCity = city"
            class="border border-rose-600 px-3 py-2 capitalize w-full font-semibold rounded bg-neutral-800 hover:bg-black text-slate-200"
          >
            {{ city.shortName }}
          </button>
          <button
            class="text-sm text-neutral-300 w-full"
            @click="showLocations = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import type { City, CityResponse } from "@/types/custom.ts";

const showLocations: Ref<boolean> = ref(false);

const myCities: Ref<City[]> = ref([
  {
    shortName: "Taichung",
    fullName: "taichung",
    lat: 24.14062969565697,
    lng: 120.64963085871764,
  },
  {
    shortName: "Taipei",
    fullName: "taipei",
    lat: 25.066590330556494,
    lng: 121.52964750086647,
  },
  {
    shortName: "PMB",
    fullName: "pietermaritzburg",
    lat: -29.56583749935549,
    lng: 30.292692661615582,
  },
  {
    shortName: "Rotherham",
    fullName: "Rotherham",
    lat: 53.440208002649214,
    lng: -1.3607636626552002,
  },
]);

const currentCity: Ref<City> = ref(myCities.value[0]);
const cityData: Ref<null | CityResponse> = ref(null);

watch(
  () => currentCity.value,
  (city: City) => changeCity(city)
);

const { data } = await useFetch<CityResponse>(
  `/api/cities/geo?lat=${currentCity.value.lat}&lng=${currentCity.value.lng}`
);
cityData.value = data.value;

const changeCity = async (city: City) => {
  showLocations.value = false;
  const data = await $fetch<CityResponse>(
    `/api/cities/geo?lat=${city.lat}&lng=${city.lng}`
  );
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

const currentLocation: Ref<GeolocationPosition | null> = ref(null);

const setCurrentLocation = (position: GeolocationPosition) => {
  currentLocation.value = position;
  myCities.value = [
    {
      shortName: "My Location",
      fullName: "My Location",
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    },
    ...myCities.value,
  ];
};
const handleLocationError = (err: GeolocationPositionError) => {
  console.error(err.message);
};

const distanceAway: string = computed(() => {
  if (!cityData.value || !currentLocation.value) return "";

  return distanceApart(cityData.value, currentLocation.value);
});

const distanceApart = (
  cityData: CityResponse,
  location: GeolocationPosition
): string => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(location.coords.latitude - cityData.lat); // deg2rad below
  var dLon = deg2rad(location.coords.longitude - cityData.lng);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(cityData.lat)) *
      Math.cos(deg2rad(location.coords.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return `${Math.round(d * 100) / 100}km away`;
};

const deg2rad = (deg: number): number => deg * (Math.PI / 180);

onMounted(() => {
  navigator.geolocation.getCurrentPosition(
    setCurrentLocation,
    handleLocationError
  );
});
</script>
