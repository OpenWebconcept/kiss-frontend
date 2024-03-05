<template>
  <div>
    <search-combobox
      v-bind="{ ...$attrs, ...props }"
      placeholder="Zoek een medewerker"
      v-model="searchText"
      :result="result"
      :list-items="datalistItems"
      :exact-match="true"
    />
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
import { debouncedRef } from "@vueuse/core";
import { computed } from "vue";
import { useGlobalSearch } from "./service";
import type { SearchResult } from "./types";
import SearchCombobox from "@/components/SearchCombobox.vue";
import { mapServiceData } from "@/services";

type DatalistItem = {
  value: string;
  description: string;
};

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    default: undefined,
  },
  required: {
    type: Boolean,
    default: false,
  },
});

function mapDatalistItem(x: SearchResult): DatalistItem {
  const { contact, department, function: functie, user } = x?.jsonObject ?? {};
  const { voornaam, voorvoegselAchternaam, achternaam } = contact ?? {};
  const naam = [voornaam, voorvoegselAchternaam, achternaam]
    .filter(Boolean)
    .join(" ");
  const werk = [functie, department].filter(Boolean).join(" bij ");
  const description = [naam, werk].filter(Boolean).join(": ");
  return {
    value: user,
    description,
  };
}

const emit = defineEmits(["update:modelValue"]);

const searchText = computed({
  get: () => props.modelValue,
  set(val) {
    emit("update:modelValue", val);
  },
});
const debouncedSearchText = debouncedRef(searchText, 300);

const sources = [
  { name: "Smoelenboek", type: "object_bron" },
  { name: "Kennisartikel", type: "object_bron" },
];

const searchParams = computed(() => {
  const smoelen = sources.find((x) => x.name === "Smoelenboek");
  if (smoelen) {
    return {
      filters: [smoelen],
      search: debouncedSearchText.value,
    };
  }
  return {
    filters: [],
  };
});

const result = useGlobalSearch(searchParams);
const datalistItems = mapServiceData(result, (paginated) =>
  paginated.page.map(mapDatalistItem)
);
</script>

<style lang="scss" scoped>
div {
  position: relative;
}
</style>
