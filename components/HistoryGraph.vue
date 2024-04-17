<template>
  <svg viewBox="0 0 200 66">
    <rect v-for="(record, index) in normalisedRecords" :key="record.id" width="2" :height="record.value"
      :x="200 - (index + 1) * 2" :y="66 - record.value" :class="record.colour" />
  </svg>
</template>

<script lang="ts" setup>
import type { AqiRecord } from "~/types/custom";

type propTypes = {
  records: AqiRecord[];
};

type NormalisedRecord = {
  id: number;
  value: number;
  timestamp: number;
  colour: string;
};
const props = defineProps<propTypes>();

const max: ComputedRef<number> = computed(() =>
  Math.max(...props.records.map((r) => r.value)),
);
const min: ComputedRef<number> = computed(() =>
  Math.min(...props.records.map((r) => r.value)),
);

const valColour = (val: number): string => {
  if (val < 50) return "fill-blue-500";
  if (val < 100) return "fill-green-500";
  if (val < 150) return "fill-orange-500";
  return "fill-red-500";
};

const normalisedRecords: ComputedRef<NormalisedRecord[]> = computed(() =>
  props.records
    .map((r) => ({
      id: r.id,
      value: (r.value / max.value) * 66,
      timestamp: r.created_at,
      colour: valColour(r.value),
    }))
    .sort((a, b) => a.timestamp - b.timestamp),
);
</script>
