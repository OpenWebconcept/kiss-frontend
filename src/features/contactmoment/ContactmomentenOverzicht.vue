<template>
  <!-- TODO this is semantically weird: a list pretending to be a table -->
  <!-- Unless the user group has a very good reason, I would rather just make it a list of <dl>s with no fake header row -->
  <section>
    <template v-if="contactmomenten.length">
      <ul>
        <li class="header-row">
          <span id="datum-header">Datum</span>
          <span id="medewerker-header">Medewerker</span>
          <span id="kanaal-header">Kanaal</span>
          <span id="gespreksresultaat-header">Gespreksresultaat</span>
        </li>
        <li v-for="contactmoment in contactmomenten" :key="contactmoment.id">
          <details @click="toggleDetails">
            <summary>
              <span aria-describedby="datum-header" class="first-column">{{
                formatDateOnly(contactmoment.registratiedatum)
              }}</span>
              <span aria-describedby="medewerker-header">{{
                contactmoment["_self"].owner.name
              }}</span>
              <span aria-describedby="kanaal-header">{{
                contactmoment.kanaal
              }}</span>
              <span aria-describedby="gespreksresultaat-header">{{
                contactmoment.resultaat
              }}</span>
            </summary>
            <dl>
              <dt>Starttijd</dt>
              <dd>{{ formatTimeOnly(contactmoment.registratiedatum) }}</dd>
              <template v-if="contactmoment.primaireVraagWeergave">
                <dt>Vraag</dt>
                <dd>{{ contactmoment.primaireVraagWeergave }}</dd>
              </template>
              <template v-if="contactmoment.afwijkendOnderwerp">
                <dt>Specificatie</dt>
                <dd>{{ contactmoment.afwijkendOnderwerp }}</dd>
              </template>
              <template
                v-for="zaak in contactmoment.zaken"
                :key="zaak.zaaknummer"
              >
                <dt>Zaaknummer</dt>
                <dd>{{ zaak.zaaknummer }}</dd>
                <dt>Zaaktype</dt>
                <dd>{{ zaak.zaaktype }}</dd>
                <dt>Status</dt>
                <dd>
                  <span v-if="zaak.status">{{ zaak.status }}</span>
                  <span v-else>Geen status</span>
                </dd>
              </template>
              <dt>Notitie</dt>
              <dd class="tekst">
                <span v-if="contactmoment.tekst">{{
                  contactmoment.tekst
                }}</span>
                <span v-else>Geen notitie</span>
              </dd>

              <dt>Afdeling</dt>
              <dd>
                <span v-if="contactmoment.afdeling">{{
                  contactmoment.afdeling
                }}</span>
                <span v-else>Geen afdeling</span>
              </dd>
            </dl>
            <p
              v-for="(
                { medewerker, completed }, i
              ) in contactmoment.contactverzoeken"
              :key="i"
            >
              Contactverzoek verstuurd aan {{ medewerker }}. Dit verzoek
              {{ completed ? "is afgerond" : "staat open" }}.
            </p>
          </details>
        </li>
      </ul>
    </template>

    <span v-else>Geen contactmomenten gevonden.</span>
  </section>
</template>

<script lang="ts" setup>
import { formatDateOnly, formatTimeOnly } from "@/helpers/date";
import type { ContactmomentViewModel } from "../shared/types";

defineProps<{
  contactmomenten: ContactmomentViewModel[];
}>();

// toggle <details> open status on click anywhere within <details>, not only on <summary>
const toggleDetails = (e: Event) => {
  e.preventDefault();
  if (e.currentTarget instanceof HTMLDetailsElement) {
    e.currentTarget.open = !e.currentTarget.open;
  }
};
</script>

<style lang="scss" scoped>
.pagination {
  justify-self: center;
}

ul {
  --column-width: 25ch;
  --gap: var(--spacing-default);

  display: grid;
  list-style: none;
  padding: 0;
}

.header-row {
  background: var(--color-tertiary);
  color: var(--color-white);
}

summary,
ul {
  list-style: none;
}

li:not(:first-child):not(:last-child) {
  border-bottom: 2px solid var(--color-tertiary);
}

dt {
  font-weight: bold;
}

.header-row,
summary {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 2fr 1rem;
  gap: var(--gap);
}

.header-row,
details > * {
  padding-inline: var(--gap);
}

dl {
  padding-inline-start: var(--spacing-default);
  display: grid;
  column-gap: var(--gap);
  row-gap: 1rem;
  grid-template-columns: var(--column-width) 1fr;
  padding-block: var(--spacing-large);
}

.tekst {
  max-width: 90ch;
  white-space: pre-wrap;
}

.headers {
  margin-bottom: var(--gap);
}

details {
  display: grid;
  gap: var(--spacing-default);
  background: var(--color-white);

  summary {
    padding-block-start: var(--spacing-default);
    padding-block-end: var(--spacing-default);
  }
}

.header-row {
  padding-block-start: var(--spacing-default);
  padding-block-end: var(--spacing-default);
}

details[open],
details:hover {
  background-color: var(--color-secondary);
}
</style>
