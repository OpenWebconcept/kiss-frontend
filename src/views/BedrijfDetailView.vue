<template>
  <section>
    <utrecht-heading :level="1">Bedrijfsinformatie</utrecht-heading>
    <nav>
      <ul>
        <li>
          <router-link :to="{ name: 'bedrijven' }">{{
            "< Bedrijven zoeken"
          }}</router-link>
        </li>
      </ul>
    </nav>
    <simple-spinner v-if="klant.loading" />
    <bedrijf-details v-else-if="klant.success" :klant="klant.data" />
    <application-message
      v-if="
        (klant.error && klant.error.message === 'Empty Results') ||
        klant.error.message === '404'
      "
      message="Geen klant gevonden."
      messageType="info"
    />

    <application-message
      v-if="
        klant.error &&
        klant.error.message !== `Empty Results` &&
        klant.error.message !== `404`
      "
      message="Er ging iets mis bij het ophalen van de klant. Probeer het later nog eens."
      messageType="error"
    />

    <simple-spinner v-if="bedrijf.loading" />
    <handelsregister-gegevens
      v-if="bedrijf.success && bedrijf.data"
      :bedrijven="bedrijf.data"
    />
    <application-message
      v-if="
        (bedrijf.error && bedrijf.error.message === 'Empty Results') ||
        bedrijf.error.message === '404'
      "
      message="Geen bedrijf gevonden."
      messageType="info"
    />

    <application-message
      v-if="
        bedrijf.error &&
        bedrijf.error.message !== `Empty Results` &&
        bedrijf.error.message !== `404`
      "
      message="Er ging iets mis bij het ophalen van de Handelsregister gegevens. Probeer het later nog eens."
      messageType="error"
    />

    <simple-spinner v-if="contactverzoeken.loading" />
    <application-message
      v-if="
        (contactverzoeken.error &&
          contactverzoeken.error.message === 'Empty Results') ||
        contactverzoeken.error.message === '404'
      "
      message="Geen contactverzoeken gevonden."
      messageType="info"
    />

    <application-message
      v-if="
        contactverzoeken.error &&
        contactverzoeken.error.message !== `Empty Results` &&
        contactverzoeken.error.message !== `404`
      "
      message="Er ging iets mis bij het ophalen van de contactverzoeken. Probeer het later nog eens."
      messageType="error"
    />
    <template
      v-if="contactverzoeken.success && contactverzoeken.data.page.length"
    >
      <utrecht-heading :level="2">Contactverzoeken</utrecht-heading>

      <contactverzoeken-overzicht
        :contactverzoeken="contactverzoeken.data.page"
      />
    </template>

    <!-- Zaken -->

    <simple-spinner v-if="zaken.loading" />

    <application-message
      v-if="
        (zaken.error && zaken.error.message === 'Empty Results') ||
        zaken.error.message === '404'
      "
      message="Geen zaken gevonden."
      messageType="info"
    />

    <application-message
      v-if="
        zaken.error &&
        zaken.error.message !== `Empty Results` &&
        zaken.error.message !== `404`
      "
      message="Er ging iets mis bij het ophalen van de zaken. Probeer het later nog eens."
      messageType="error"
    />

    <template v-if="zaken.success && zaken.data.page.length">
      <utrecht-heading :level="2"> Zaken </utrecht-heading>

      <zaken-overzicht
        :zaken="zaken.data.page"
        :vraag="contactmomentStore.huidigContactmoment?.huidigeVraag"
      />
    </template>

    <!-- Contactmomenten -->

    <simple-spinner v-if="contactmomenten.loading" />

    <application-message
      v-if="
        (contactmomenten.error &&
          contactmomenten.error.message === 'Empty Results') ||
        contactmomenten.error.message === '404'
      "
      message="Geen contactmomenten gevonden."
      messageType="info"
    />

    <application-message
      v-if="
        contactmomenten.error &&
        contactmomenten.error.message !== `Empty Results` &&
        contactmomenten.error.message !== `404`
      "
      message="Er ging iets mis bij het ophalen van de contactmomenten. Probeer het later nog eens."
      messageType="error"
    />

    <template
      v-if="contactmomenten.success && contactmomenten.data.page.length"
    >
      <utrecht-heading :level="2"> Contactmomenten </utrecht-heading>

      <contactmomenten-overzicht :contactmomenten="contactmomenten.data.page" />

      <pagination
        class="pagination"
        :pagination="contactmomenten.data"
        @navigate="onContactmomentenNavigate"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Heading as UtrechtHeading } from "@utrecht/component-library-vue";
import { useContactmomentStore } from "@/stores/contactmoment";
import {
  ContactmomentenOverzicht,
  useContactverzoekenByKlantId,
} from "@/features/contactmoment";
import {
  useBedrijfByVestigingsnummer,
  HandelsregisterGegevens,
  BedrijfDetails,
  useKlantById,
} from "@/features/klant";
import ApplicationMessage from "@/components/ApplicationMessage.vue";
import SimpleSpinner from "@/components/SimpleSpinner.vue";
import ContactverzoekenOverzicht from "@/features/contactmoment/ContactverzoekenOverzicht.vue";
import Pagination from "@/nl-design-system/components/Pagination.vue";
import { useContactmomentenByKlantId } from "@/features/shared/get-contactmomenten-service";
import {
  useZakenByVestigingsnummer,
  ZakenOverzicht,
} from "@/features/zaaksysteem";

const props = defineProps<{ bedrijfId: string }>();
const klantId = computed(() => props.bedrijfId);
const contactmomentStore = useContactmomentStore();
const klant = useKlantById(klantId);

watch(
  () => klant.success && klant.data,
  (k) => {
    if (!k) return;
    contactmomentStore.setKlant({
      ...k,
      hasContactInformation: !k.emails.length || !k.telefoonnummers.length,
    });
  },
  { immediate: true }
);

const contactverzoekenPage = ref(1);
const contactverzoeken = useContactverzoekenByKlantId(
  klantId,
  contactverzoekenPage
);

const contactmomentenPage = ref(1);
const contactmomenten = useContactmomentenByKlantId(
  klantId,
  contactmomentenPage
);

const onContactmomentenNavigate = (page: number) => {
  contactmomentenPage.value = page;
};

const getVestigingsnummer = () =>
  !klant.success || !klant.data.vestigingsnummer
    ? ""
    : klant.data.vestigingsnummer;
const klantVestigingsnummer = computed(getVestigingsnummer);

const zaken = useZakenByVestigingsnummer(klantVestigingsnummer);

const bedrijf = useBedrijfByVestigingsnummer(getVestigingsnummer);

watch(
  () => bedrijf.success && bedrijf.data,
  (bedrijf) => {
    if (!bedrijf || (!bedrijf.telefoonnummer && !bedrijf.email)) return;
    if (!klant.success || !klant.data) return;

    contactmomentStore.setKlantHasContactgegevens(klant.data.id);
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
nav {
  list-style: none;
}

section > * {
  margin-block-end: var(--spacing-large);
}

utrecht-heading {
  margin-block-end: 0;
}
</style>
