<template>
  <div class="">
    <div class="flex justify-center scale-x-90">
      <div v-for="record in normalisedRecords" :key="record.id" class="rounded-md h-20 w-[1vw]"
        :class="valColour(record.value)" :style="`transform: scaleY(${record.scale})`"></div>
    </div>
    <p class="text-center text-neutral-300 text-xs mt-2" v-show="records.length">
      Average of {{ Math.round(avg) }} over last {{ records.length }} hours
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { AqiRecord } from "~/types/custom";

type propTypes = {
  records: AqiRecord[];
};

type NormalisedRecord = {
  id: number;
  value: number;
  scale: number;
  timestamp: number;
  colour: string;
};
const props = defineProps<propTypes>();

const max: ComputedRef<number> = computed(() =>
  Math.max(...props.records.map((r) => r.value)),
);

const avg: ComputedRef<number> = computed(
  () =>
    props.records.reduce((total, record) => total + record.value, 0) /
    props.records.length,
);

const valColour = (val: number): string => {
  if (val < 50) return "bg-sapphire";
  if (val < 100) return "bg-mint";
  if (val < 150) return "bg-oranja";
  return "bg-coral";
};

const normalisedRecords: ComputedRef<NormalisedRecord[]> = computed(() =>
  props.records
    .map((r) => ({
      id: r.id,
      value: r.value,
      scale: r.value / max.value,
      timestamp: r.created_at,
      colour: valColour(r.value),
    }))
    .sort((a, b) => a.timestamp - b.timestamp),
);
</script>
