<template>
  <article>
    <simple-spinner v-if="zaak.loading" />

    <application-message
      v-if="zaak.error"
      messageType="error"
      message="Er kon geen zaak gevonden worden"
    ></application-message>

    <zaak-details :zaak="zaak.data" v-if="zaak.success" />
  </article>
</template>

<script setup lang="ts">
import { useZaakById } from "@/features/zaaksysteem/service";
import ApplicationMessage from "@/components/ApplicationMessage.vue";
import ZaakDetails from "@/features/zaaksysteem/ZaakDetails.vue";
import SimpleSpinner from "@/components/SimpleSpinner.vue";
import { computed, watch } from "vue";
import { useContactmomentStore } from "@/stores/contactmoment";

const props = defineProps<{ zaakId: string }>();

const contactmomentStore = useContactmomentStore();
const zaak = useZaakById(computed(() => props.zaakId));

watch(
  () => zaak.success && zaak.data,
  (z) => {
    if (!z || !contactmomentStore.huidigContactmoment) return;
    contactmomentStore.upsertZaak(
      z,
      contactmomentStore.huidigContactmoment.huidigeVraag
    );
  },
  { immediate: true }
);
</script>
