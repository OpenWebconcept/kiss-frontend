<template>
  <SimpleSpinner v-if="afdelingen.loading" />
  <form class="container" @submit.prevent>
    <utrecht-heading :level="2">Contactverzoek maken</utrecht-heading>
    <label
      class="utrecht-form-label"
      v-if="afdelingen.success && afdelingen.data.length"
    >
      <span class="required"> Contactverzoek versturen naar afdeling </span>
      <select
        v-model="afdeling"
        name="afdeling"
        class="utrecht-select utrecht-select--html-select"
        :required="true"
      >
        <option
          v-for="afdeling in afdelingen.data"
          :key="afdeling.id"
          :value="afdeling.id"
          :required="true"
        >
          {{ afdeling.email }} | {{ afdeling.name }}
        </option>
      </select>
    </label>

    <label class="utrecht-form-label">
      <span>Bevestiging mail versturen naar medewerker</span>
      <medewerker-search
        class="utrecht-textbox utrecht-textbox--html-input"
        v-model="medewerker"
      />
    </label>

    <label class="utrecht-form-label notitieveld">
      <span class="required">Notitie bij het contactverzoek</span>
      <textarea
        v-model="notitie"
        class="utrecht-textarea utrecht-textarea--html-textarea"
        rows="10"
      />
    </label>
  </form>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
import { useContactmomentStore, type Vraag } from "@/stores/contactmoment";
import { Heading as UtrechtHeading } from "@utrecht/component-library-vue";
import MedewerkerSearch from "@/features/search/MedewerkerSearch.vue";
import { computed } from "@vue/reactivity";
import { useAfdelingen } from "./service";
import SimpleSpinner from "@/components/SimpleSpinner.vue";
import { useCurrentUser } from "@/features/login/service.ts";

const props = defineProps<{
  huidigeVraag: Vraag;
}>();

const contactmomentStore = useContactmomentStore();

const user = JSON.parse(JSON.stringify(useCurrentUser()));

function medewerkerInit() {
  if (window.sessionStorage.getItem("medewerkerInit" === "true")) return;
  window.sessionStorage.setItem("medewerkerInit", "true");
  contactmomentStore.updateContactverzoek({
    ...props.huidigeVraag.contactverzoek,
    medewerker: user.data.email,
  });
}

const callMedewerkerInit = medewerkerInit();

const medewerker = computed({
  get: () => props.huidigeVraag.contactverzoek.medewerker || user.data.email,
  set(medewerker) {
    if (!medewerker) return;

    contactmomentStore.updateContactverzoek({
      ...props.huidigeVraag.contactverzoek,
      medewerker,
    });
  },
});

const notitie = computed({
  get: () => props.huidigeVraag.contactverzoek.notitie,
  set: (notitie) => {
    if (!notitie) return;

    contactmomentStore.updateContactverzoek({
      ...props.huidigeVraag.contactverzoek,
      notitie,
    });
  },
});

const afdeling = computed({
  get: () => props.huidigeVraag.contactverzoek.afdeling,
  set: (afdeling) => {
    if (!afdeling) return;

    contactmomentStore.updateContactverzoek({
      ...props.huidigeVraag.contactverzoek,
      afdeling,
    });
  },
});

const afdelingen = useAfdelingen();
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-large);
}

textarea {
  resize: none;
}
</style>
