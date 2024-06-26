<template>
  <div class="px-6 flex flex-col">
    <div v-if="cityData">
      <div class="flex flex-col justify-center items-center py-20">
        <p class="capitalize text-base text-jet font-semibold">
          {{ currentCity.fullName }}
        </p>
        <div class="flex gap-4 p-4 rounded-lg">
          <div>
            <p :class="textColour(cityData?.data.aqi || 9)" class="text-9xl font-black">
              {{ cityData?.data.aqi }}
            </p>
          </div>
          <div class="flex flex-col items-end justify-end">
            <div class="flex justify-end mb-2">
              <FlowerIcon v-if="level === 1" class="w-8" />
              <WindIcon v-if="level === 2" class="w-12" />
              <ChimneyIcon v-if="level === 3" class="w-12" />
              <SkullIcon v-if="level === 4" class="w-12" />
            </div>
            <p class="text-xs text-jet mb-4">
              {{ timeOfDay(cityData?.data.time.iso || "") }}
            </p>
          </div>
        </div>
        <p class="text-xs text-jet mt-3">
          {{ cityData?.data.city.name }}
        </p>

        <p class="text-xs text-jet">{{ distanceAway }}</p>
      </div>
    </div>
    <div class="flex-1">
      <div class="flex gap-3 justify-strat md:justify-center max-w-full overflow-x-auto no-scrollbar">
        <div v-for="day in cityData?.data.forecast.daily.pm25"
          class="p-2 rounded-md bg-chiffon text-jet flex flex-col items-center">
          <p :class="textColour(day.avg)" class="font-black">
            {{ day.avg }}
          </p>
          <p class="text-xs whitespace-nowrap">{{ shortDate(day.day) }}</p>
        </div>
      </div>
      <div class="mt-8 flex justify-center">
        <HistoryGraph class="w-96" :records="history" />
      </div>
    </div>
    <div class="flex justify-center">
      <button
        class="fixed bottom-0 right-0 m-6 z-50 bg-chiffon shadow-md p-2 rounded-full w-10 h-10 flex justify-center items-center"
        @click="showLocations = !showLocations">
        <LocationIcon class="w-8 h-8 text-jet" />
      </button>
    </div>
    <Transition enter-from-class="translate-y-full" leave-to-class="translate-y-full" enter-to-class="translate-y-0"
      leave-from-class="translate-y-0">
      <div v-show="showLocations"
        class="fixed left-0 bottom-0 w-screen bg-chiffon transition-transform rounded-tl-lg rounded-tr-lg">
        <div class="flex flex-col justify-center items-start gap-6 my-12 px-8">
          <button v-for="city in myCities" :key="city.shortName" @click="currentCity = city"
            class="px-3 py-2 capitalize w-full font-semibold rounded bg-off-white hover:bg-chiffon text-jet">
            {{ city.shortName }}
          </button>
          <button class="text-sm text-neutral-300 w-full" @click="showLocations = false">
            Cancel
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import type { AqiRecord, City, CityResponse } from "@/types/custom.ts";
import HistoryGraph from "~/components/HistoryGraph.vue";

const showLocations: Ref<boolean> = ref(false);

const myCities: Ref<City[]> = ref([
  {
    idx: 1616,
    shortName: "Taichung",
    fullName: "taichung",
    lat: 24.14062969565697,
    lng: 120.64963085871764,
  },
  {
    idx: 1596,
    shortName: "Taipei",
    fullName: "taipei",
    lat: 25.066590330556494,
    lng: 121.52964750086647,
  },
  {
    idx: 12548,
    shortName: "PMB",
    fullName: "pietermaritzburg",
    lat: -29.56583749935549,
    lng: 30.292692661615582,
  },
  {
    idx: 10100,
    shortName: "Rotherham",
    fullName: "Rotherham",
    lat: 53.440208002649214,
    lng: -1.3607636626552002,
  },
]);

const currentCity: Ref<City> = ref(myCities.value[0]);
const cityData: Ref<null | CityResponse> = ref(null);
const history: Ref<AqiRecord[]> = ref([]);

const fetchHistory = async () => {
  history.value = [];
  if (!currentCity.value.idx || currentCity.value.idx === 999) return;
  const data = await $fetch<AqiRecord[]>(
    `/api/cities/history?idx=${currentCity.value.idx}`,
  );
  history.value = data;
};

watch(
  () => currentCity.value,
  (city: City) => changeCity(city),
);

const { data } = await useFetch<CityResponse>(
  `/api/cities/geo?lat=${currentCity.value.lat}&lng=${currentCity.value.lng}`,
);
cityData.value = data.value;

const changeCity = async (city: City) => {
  fetchHistory();
  cityData.value = null;
  showLocations.value = false;
  const data = await $fetch<CityResponse>(
    `/api/cities/geo?lat=${city.lat}&lng=${city.lng}`,
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

const level: ComputedRef<number> = computed(() => {
  if (!cityData.value) return 0;
  if (cityData.value?.data.aqi <= 50) return 1;
  if (cityData.value?.data.aqi <= 100) return 2;
  if (cityData.value?.data.aqi <= 150) return 3;
  if (cityData.value?.data.aqi > 150) return 4;
});

const textColour = (val: number): string => {
  const key = Math.floor(val / 50);
  const lookup = {
    0: "text-sapphire",
    1: "text-mint",
    2: "text-bee-yellow",
    3: "text-oranja",
    4: "text-coral",
    5: "text-neutral-800",
  };
  return lookup[key] || "text-gray-100";
};

const currentLocation: Ref<GeolocationPosition | null> = ref(null);

const setCurrentLocation = (position: GeolocationPosition) => {
  currentLocation.value = position;
  myCities.value = [
    {
      idx: 9999,
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

const distanceAway: ComputedRef<string> = computed(() => {
  if (!cityData.value || !currentLocation.value) return "";

  return distanceApart(cityData.value, currentLocation.value);
});

const distanceApart = (
  cityData: CityResponse,
  location: GeolocationPosition,
): string => {
  let R = 6371; // Radius of the earth in km
  let dLat = deg2rad(location.coords.latitude - cityData.data.city.geo[0]); // deg2rad below
  let dLon = deg2rad(location.coords.longitude - cityData.data.city.geo[1]);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(cityData.data.city.geo[0])) *
    Math.cos(deg2rad(location.coords.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c; // Distance in km
  const finalDistance = d > 2 ? Math.round(d) : Math.round(d * 100) / 100;
  return `${finalDistance}km away`;
};

const deg2rad = (deg: number): number => deg * (Math.PI / 180);

onMounted(() => {
  navigator.geolocation.getCurrentPosition(
    setCurrentLocation,
    handleLocationError,
  );
  fetchHistory();
});
</script>
