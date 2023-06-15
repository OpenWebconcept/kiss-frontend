<template>
  <section class="container">
    <utrecht-heading :level="1">Contactmomenten historie</utrecht-heading>

    <section>
      <simple-spinner v-if="contactmomenten.loading" />

      <application-message
        v-if="contactmomenten.error"
        message="Er ging iets mis bij het ophalen van de contactmomenten. Probeer het later nog eens."
        messageType="error"
      />

      <utrecht-heading
        v-if="contactmomenten.success && !contactmomenten.data.page.length"
        :level="3"
        >Geen contactmomenten gevonden</utrecht-heading
      >

      <template
        v-if="contactmomenten.success && contactmomenten.data.page.length"
      >
        <utrecht-heading :level="2"> Contactmomenten </utrecht-heading>

        <contactmomenten-overzicht
          :contactmomenten="contactmomenten.data.page"
        />

        <pagination
          class="pagination"
          :pagination="contactmomenten.data"
          @navigate="onContactmomentenNavigate"
        />
      </template>
    </section>

    <section>
      <simple-spinner v-if="contactverzoeken.loading" />

      <application-message
        v-if="contactverzoeken.error"
        message="Er ging iets mis bij het ophalen van de contactverzoeken. Probeer het later nog eens."
        messageType="error"
      />

      <utrecht-heading
        v-if="contactverzoeken.success && !contactverzoeken.data.page.length"
        :level="3"
        >Geen contactverzoeken gevonden</utrecht-heading
      >

      <template
        v-if="contactverzoeken.success && contactverzoeken.data.page.length"
      >
        <utrecht-heading :level="2">Contactverzoeken </utrecht-heading>

        <contactverzoeken-overzicht
          :contactverzoeken="contactverzoeken.data.page"
        />

        <pagination
          class="pagination"
          :pagination="contactverzoeken.data"
          @navigate="onContactverzoekenNavigate"
        />
      </template>
    </section>
  </section>
</template>

<script lang="ts" setup>
import SimpleSpinner from "@/components/SimpleSpinner.vue";
import ApplicationMessage from "@/components/ApplicationMessage.vue";
import Pagination from "@/nl-design-system/components/Pagination.vue";
import {
  ContactmomentenOverzicht,
  getAnonymousUserId,
} from "@/features/contactmoment";
import { Heading as UtrechtHeading } from "@utrecht/component-library-vue";
import Cookies from "js-cookie";
import { ref } from "vue";
import { useContactmomentenByUserId } from "@/features/shared/get-contactmomenten-service";
import ContactverzoekenOverzicht from "@/features/contactmoment/ContactverzoekenOverzicht.vue";
import { useContactverzoekenByUserId } from "@/features/contactmoment";

getAnonymousUserId();

const userId = ref(Cookies.get("userId") as string);

const contactmomentenPage = ref(1);
const contactmomenten = useContactmomentenByUserId(userId, contactmomentenPage);
const onContactmomentenNavigate = (page: number) => {
  contactmomentenPage.value = page;
};

const contactverzoekenPage = ref(1);
const contactverzoeken = useContactverzoekenByUserId(
  userId,
  contactverzoekenPage
);
const onContactverzoekenNavigate = (page: number) => {
  contactverzoekenPage.value = page;
};
</script>

<style lang="scss" scoped>
.container > *:not(:last-child) {
  margin-block-end: var(--spacing-large);
}
</style>
