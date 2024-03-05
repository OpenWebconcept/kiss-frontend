<template>
  <form @submit.prevent="handleSearch">
    <fieldset class="radio-group">
      <legend>Waar wil je op zoeken?</legend>
      <label v-for="(label, field) in labels" :key="field">
        <input
          type="radio"
          :value="field"
          v-model="state.field"
          required
          :disabled="
            label === 'E-mailadres' ||
            label === 'Telefoonnummer' ||
            label === 'Postcode + Huisnummer'
          "
        />
        <span
          :class="{
            disabled:
              label === 'E-mailadres' ||
              label === 'Telefoonnummer' ||
              label === 'Postcode + Huisnummer',
          }"
          >{{ label }}</span
        >
      </label>
    </fieldset>
    <fieldset class="search-bar">
      <label>
        <span>Zoek naar een bedrijf</span>
        <input
          type="search"
          placeholder="Zoek naar een bedrijf"
          ref="inputRef"
          v-model="state.currentSearch"
          @search="handleSearch"
        />
      </label>
      <button title="Zoeken">
        <span>Zoeken</span>
      </button>
    </fieldset>
  </form>

  <section class="search-section">
    <simple-spinner v-if="bedrijven.loading" />
    <template v-if="bedrijven.success">
      <bedrijven-overzicht :records="bedrijven.data.page">
        <template #caption>
          <SearchResultsCaption :results="bedrijven.data" />
        </template>
      </bedrijven-overzicht>
      <pagination
        class="pagination"
        :pagination="bedrijven.data"
        @navigate="navigate"
      />
    </template>
    <application-message
      v-if="
        (bedrijven.error && bedrijven.error.message === 'Empty Results') ||
        bedrijven.error.message === '404'
      "
      messageType="info"
      message="Geen resultaten gevonden"
    />
    <application-message
      v-if="
        bedrijven.error &&
        bedrijven.error.message !== 'Empty Results' &&
        bedrijven.error.message !== '404'
      "
      messageType="error"
      message="Er is een fout opgetreden"
    />
  </section>
</template>

<script setup lang="ts">
import { parseKvkNummer, parsePostcodeHuisnummer } from "@/helpers/validation";
import { ensureState } from "@/stores/create-store";
import { computed, ref, watch } from "vue";
import { bedrijfQuery, useSearchBedrijven } from "./service";
import SimpleSpinner from "@/components/SimpleSpinner.vue";
import Pagination from "@/nl-design-system/components/Pagination.vue";
import ApplicationMessage from "@/components/ApplicationMessage.vue";
import BedrijvenOverzicht from "./BedrijvenOverzicht.vue";
import type { SearchCategories, BedrijfQuery } from "./types";
import SearchResultsCaption from "@/components/SearchResultsCaption.vue";

const labels: { [key in SearchCategories]: string } = {
  handelsnaam: "Bedrijfsnaam",
  kvkNummer: "KVK-nummer",
  postcodeHuisnummer: "Postcode + Huisnummer",
  emailadres: "E-mailadres",
  telefoonnummer: "Telefoonnummer",
};

const state = ensureState({
  stateId: "BedrijfZoeker",
  stateFactory() {
    return {
      currentSearch: "",
      field: "handelsnaam" as SearchCategories,
      query: undefined as BedrijfQuery | undefined,
      page: 1,
    };
  },
});

const inputRef = ref();

const currentQuery = computed(() => {
  const { currentSearch, field } = state.value;

  if (field === "postcodeHuisnummer") {
    const parsed = parsePostcodeHuisnummer(currentSearch);
    return parsed instanceof Error
      ? parsed
      : bedrijfQuery({
          field,
          value: parsed,
        });
  }

  if (field === "kvkNummer") {
    const parsed = parseKvkNummer(currentSearch);
    return parsed instanceof Error
      ? parsed
      : bedrijfQuery({
          field,
          value: parsed,
        });
  }

  return bedrijfQuery({
    field,
    value: currentSearch,
  });
});

watch(
  [currentQuery, inputRef],
  ([query, input]) => {
    if (!(input instanceof HTMLInputElement)) return;
    input.setCustomValidity(query instanceof Error ? query.message : "");
  },
  { immediate: true }
);

const handleSearch = () => {
  if (!(currentQuery.value instanceof Error)) {
    state.value.query = currentQuery.value;
  }
  state.value.page = 1;
};

const bedrijven = useSearchBedrijven(() => ({
  query: state.value.query,
  page: state.value.page,
}));

const navigate = (val: number) => {
  state.value.page = val;
};
</script>

<style scoped lang="scss">
input[type="search"] {
  width: var(--section-width);
}
.search-bar {
  margin-bottom: var(--spacing-large);
  width: min(100%, 20rem);
}

.disabled {
  opacity: 0.5;
}

.pagination {
  margin-inline: auto;
}

.search-section {
  display: grid;
  gap: var(--spacing-small);
}

input[type="radio"] {
  accent-color: var(--color-primary);
  margin: 0;
}

.radio-group {
  display: grid;
  grid-template-columns: repeat(3, auto);
  justify-content: flex-start;
  column-gap: var(--spacing-default);
  row-gap: var(--spacing-extrasmall);

  > legend {
    font-size: 0;
  }

  label {
    display: flex;
    gap: var(--spacing-small);
    align-items: center;
  }
}
</style>
