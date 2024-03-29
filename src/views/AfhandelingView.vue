<template>
  <prompt-modal
    :dialog="cancelDialog"
    message="Weet je zeker dat je het contactmoment wilt annuleren? Alle gegevens worden verwijderd."
    cancel-message="Nee"
    confirm-message="Ja"
  />

  <prompt-modal
    :dialog="removeVraagDialog"
    message="Weet je zeker dat je deze vraag wilt verwijderen? Alle gegevens in de vraag worden verwijderd."
    cancel-message="Nee"
    confirm-message="Ja"
  />

  <simple-spinner v-if="saving || gespreksresultaten.loading" />

  <form v-else class="afhandeling" @submit.prevent="submit">
    <utrecht-heading :level="1" modelValue>Afhandeling</utrecht-heading>

    <a @click="$router.back()" href="#">{{ "< Terug" }}</a>

    <application-message
      v-if="errorMessage != ''"
      messageType="error"
      :message="errorMessage"
    />

    <template v-else-if="contactmomentStore.huidigContactmoment">
      <article
        v-for="(vraag, idx) in contactmomentStore.huidigContactmoment.vragen"
        :key="idx"
      >
        <utrecht-heading :level="2">
          <div class="vraag-heading">
            Vraag {{ idx + 1 }}

            <utrecht-button
              v-if="contactmomentStore.huidigContactmoment.vragen.length > 1"
              appearance="subtle-button"
              class="icon icon-after trash icon-only"
              :title="`Vraag ${idx + 1} verwijderen`"
              @click="toggleRemoveVraagDialog(idx)"
            />
          </div>
        </utrecht-heading>
        <section v-if="vraag.klanten.length" class="gerelateerde-resources">
          <utrecht-heading :level="3">{{
            vraag.klanten.length > 1 ? "Klanten" : "Klant"
          }}</utrecht-heading>
          <ul>
            <li v-for="record in vraag.klanten" :key="record.klant.id">
              <label>
                <span
                  v-if="
                    record.klant.voornaam ||
                    record.klant.achternaam ||
                    record.klant.bedrijfsnaam
                  "
                  >{{
                    [
                      record.klant.voornaam,
                      record.klant.voorvoegselAchternaam,
                      record.klant.achternaam,
                    ]
                      .filter((x) => x)
                      .join(" ") || record.klant.bedrijfsnaam
                  }}</span
                >
                <span v-else>{{
                  [
                    record.klant.emails[0]?.email,
                    record.klant.telefoonnummers[0]?.telefoonnummer,
                  ]
                    .filter((x) => x)
                    .join(", ")
                }}</span>
                <input
                  title="Deze klant opslaan bij het contactmoment"
                  type="checkbox"
                  v-model="record.shouldStore"
                />
              </label>
            </li>
          </ul>
        </section>

        <section v-if="vraag.zaken.length" class="gerelateerde-resources">
          <utrecht-heading :level="3">{{
            vraag.zaken.length > 1 ? "Gerelateerde zaken" : "Gerelateerde zaak"
          }}</utrecht-heading>
          <ul>
            <li v-for="record in vraag.zaken" :key="record.zaak.id">
              <label>
                <span
                  >{{ record.zaak.identificatie }}
                  <div>
                    (Zaaktype: {{ record.zaak.zaaktypeOmschrijving }})
                  </div></span
                >
                <input
                  title="Deze zaak opslaan bij het contactmoment"
                  type="checkbox"
                  v-model="record.shouldStore"
                />
              </label>
            </li>
          </ul>
        </section>

        <section v-if="vraag.medewerkers.length" class="gerelateerde-resources">
          <utrecht-heading :level="3">{{
            vraag.medewerkers.length > 1
              ? "Gerelateerde medewerkers"
              : "Gerelateerde medewerker"
          }}</utrecht-heading>
          <ul>
            <li v-for="record in vraag.medewerkers" :key="record.medewerker.id">
              <label>
                <span
                  v-if="
                    record.medewerker.voornaam || record.medewerker.achternaam
                  "
                  >{{
                    [
                      record.medewerker.voornaam,
                      record.medewerker.voorvoegselAchternaam,
                      record.medewerker.achternaam,
                    ]
                      .filter((x) => x)
                      .join(" ")
                  }}
                  <span v-if="record.medewerker.emailadres"
                    >({{ record.medewerker.emailadres }})</span
                  >
                </span>
                <input
                  title="Deze medewerker opslaan bij het contactmoment"
                  type="checkbox"
                  v-model="record.shouldStore"
                />
              </label>
            </li>
          </ul>
        </section>

        <section v-if="vraag.websites.length" class="gerelateerde-resources">
          <utrecht-heading :level="3">{{
            vraag.websites.length > 1
              ? "Gerelateerde websites"
              : "Gerelateerde website"
          }}</utrecht-heading>
          <ul>
            <li v-for="record in vraag.websites" :key="record.website.url">
              <label>
                <a
                  :href="record.website.url"
                  rel="noopener noreferrer"
                  target="_blank"
                  >{{ record.website.title }}</a
                >
                <input
                  title="Deze website opslaan bij het contactmoment"
                  type="checkbox"
                  v-model="record.shouldStore"
                />
              </label>
            </li>
          </ul>
        </section>

        <section
          v-if="vraag.kennisartikelen.length"
          class="gerelateerde-resources"
        >
          <utrecht-heading :level="3">{{
            vraag.kennisartikelen.length > 1
              ? "Gerelateerde kennisartikelen"
              : "Gerelateerde kennisartikel"
          }}</utrecht-heading>
          <ul>
            <li
              v-for="record in vraag.kennisartikelen"
              :key="record.kennisartikel.url"
            >
              <label>
                <span>
                  {{ record.kennisartikel.title }}
                </span>
                <input
                  title="Dit kennisartikel opslaan bij het contactmoment"
                  type="checkbox"
                  v-model="record.shouldStore"
                />
              </label>
            </li>
          </ul>
        </section>

        <section
          v-if="vraag.nieuwsberichten.length"
          class="gerelateerde-resources"
        >
          <utrecht-heading :level="3">{{
            vraag.nieuwsberichten.length > 1
              ? "Gerelateerde nieuwsberichten"
              : "Gerelateerd nieuwsbericht"
          }}</utrecht-heading>
          <ul>
            <li
              v-for="record in vraag.nieuwsberichten"
              :key="record.nieuwsbericht.url"
            >
              <label>
                <span>
                  {{ record.nieuwsbericht.title }}
                </span>
                <input
                  title="Dit nieuwsbericht opslaan bij het contactmoment"
                  type="checkbox"
                  v-model="record.shouldStore"
                />
              </label>
            </li>
          </ul>
        </section>

        <section
          v-if="vraag.werkinstructies.length"
          class="gerelateerde-resources"
        >
          <utrecht-heading :level="3">{{
            vraag.werkinstructies.length > 1
              ? "Gerelateerde werkinstructies"
              : "Gerelateerde werkinstructie"
          }}</utrecht-heading>
          <ul>
            <li
              v-for="record in vraag.werkinstructies"
              :key="record.werkinstructie.url"
            >
              <label>
                <span>
                  {{ record.werkinstructie.title }}
                </span>
                <input
                  title="Deze werkinstructie opslaan bij het contactmoment"
                  type="checkbox"
                  v-model="record.shouldStore"
                />
              </label>
            </li>
          </ul>
        </section>
        <section class="details">
          <utrecht-heading :level="3"> Details </utrecht-heading>
          <fieldset class="utrecht-form-fieldset">
            <label :for="'kanaal' + idx" class="utrecht-form-label required"
              >Kanaal</label
            >
            <select
              :id="'kanaal' + idx"
              v-model="vraag.kanaal"
              class="utrecht-select utrecht-select--html-select"
              @change="setUserChannel"
              required
            >
              <option>telefoon</option>
              <option>e-mail</option>
              <option>contactformulier</option>
              <option>Twitter</option>
              <option>Facebook</option>
              <option>LinkedIn</option>
              <option>live chat</option>
              <option>Instagram</option>
              <option>WhatsApp</option>
            </select>

            <label
              :for="'gespreksresultaat' + idx"
              class="utrecht-form-label required"
            >
              Afhandeling
            </label>
            <select
              :id="'gespreksresultaat' + idx"
              v-model="vraag.resultaat"
              class="utrecht-select utrecht-select--html-select"
              required
              v-if="gespreksresultaten.success"
            >
              <option
                v-for="gespreksresultaat in gespreksresultaten.data"
                :key="gespreksresultaat.id"
              >
                {{ gespreksresultaat.definitie }}
              </option>
            </select>

            <template v-if="vraag.resultaat === 'Contactverzoek gemaakt'">
              <label />

              <div class="contactverzoek-container">
                <div>
                  <label
                    class="utrecht-form-label"
                    :for="'verzoek-medewerker' + idx"
                    >Bevestiging mail versturen naar medewerker</label
                  >
                  <medewerker-search
                    v-model="vraag.contactverzoek.medewerker"
                    :id="'verzoek-medewerker' + idx"
                    class="utrecht-textbox utrecht-textbox--html-input medewerker-search"
                  />
                </div>

                <div>
                  <label
                    class="utrecht-form-label required"
                    :for="'verzoek-notitie' + idx"
                    >Notitie</label
                  >
                  <textarea
                    required
                    rows="5"
                    class="utrecht-textarea"
                    :id="'verzoek-notitie' + idx"
                    v-model="vraag.contactverzoek.notitie"
                  ></textarea>
                </div>
              </div>
            </template>

            <label
              :for="'hoofdvraag' + idx"
              class="utrecht-form-label required"
            >
              Vraag
            </label>
            <select
              v-model="vraag.primaireVraag"
              :id="'hoofdvraag' + idx"
              class="utrecht-select utrecht-select--html-select"
              required
            >
              <option
                v-for="(item, itemIdx) in [
                  ...vraag.websites.map((item) => item.website),
                  ...vraag.kennisartikelen.flatMap((item) => [
                    item.kennisartikel,
                    ...item.kennisartikel.sections.map((section) => ({
                      ...item.kennisartikel,
                      title: [item.kennisartikel.title, section].join(' - '),
                    })),
                  ]),
                  ...vraag.nieuwsberichten.map((item) => item.nieuwsbericht),
                  ...vraag.werkinstructies.map((item) => item.werkinstructie),
                ]"
                :key="itemIdx + '|' + idx"
                :value="item"
              >
                {{ item.title }}
              </option>
              <option :value="undefined">Anders</option>
            </select>

            <label
              :class="[
                'utrecht-form-label',
                { required: !vraag.primaireVraag },
              ]"
              :for="'afwijkendOnderwerp' + idx"
            >
              Specificatie
            </label>
            <input
              :required="!vraag.primaireVraag"
              type="text"
              class="utrecht-textbox utrecht-textbox--html-input"
              :id="'afwijkendOnderwerp' + idx"
              v-model="vraag.afwijkendOnderwerp"
            />
            <br v-if="vraag.resultaat == 'Contactverzoek gemaakt'" />
            <span v-if="vraag.resultaat == 'Contactverzoek gemaakt'">
              Let op! Er wordt een e-mail verstuurd naar de gekozen
              afdeling</span
            >
            <label
              class="utrecht-form-label"
              :class="{ required: vraag.resultaat == 'Contactverzoek gemaakt' }"
              :for="'verzoek-afdeling' + idx"
              >{{
                vraag.resultaat == "Contactverzoek gemaakt"
                  ? "Contactverzoek versturen naar afdeling"
                  : "Afdeling"
              }}</label
            >

            <div v-if="afdelingen.success && afdelingen.data.length">
              <select
                v-model="vraag.contactverzoek.afdeling"
                class="utrecht-select utrecht-select--html-select"
                :id="'verzoek-afdeling' + idx"
                :required="vraag.resultaat == 'Contactverzoek gemaakt'"
              >
                <option
                  v-for="afdeling in afdelingen.data"
                  :key="idx + afdeling.id"
                  :value="afdeling.id"
                  :required="true"
                >
                  {{
                    vraag.resultaat == "Contactverzoek gemaakt"
                      ? `${afdeling.email} | ${afdeling.name}`
                      : afdeling.name
                  }}
                </option>
              </select>
            </div>

            <label class="utrecht-form-label" :for="'notitie' + idx"
              >Notitie</label
            >
            <textarea
              class="utrecht-textarea"
              :id="'notitie' + idx"
              v-model="vraag.notitie"
            ></textarea>
          </fieldset>
        </section>
      </article>
      <menu>
        <li>
          <utrecht-button
            modelValue
            type="button"
            appearance="secondary-action-button"
            @click="cancelDialog.reveal"
          >
            Annuleren
          </utrecht-button>
        </li>
        <li>
          <utrecht-button type="submit" appearance="primary-action-button">
            Opslaan
          </utrecht-button>
        </li>
      </menu>
    </template>
  </form>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  Heading as UtrechtHeading,
  Button as UtrechtButton,
} from "@utrecht/component-library-vue";
import SimpleSpinner from "@/components/SimpleSpinner.vue";
import ApplicationMessage from "@/components/ApplicationMessage.vue";

import { useContactmomentStore, type Vraag } from "@/stores/contactmoment";
import { toast } from "@/stores/toast";

import {
  koppelKlant,
  saveContactmoment,
  koppelObject,
  useGespreksResultaten,
  type Contactmoment,
} from "@/features/contactmoment";

import { useUserStore } from "@/stores/user";
import { useConfirmDialog } from "@vueuse/core";
import PromptModal from "@/components/PromptModal.vue";
import { getFormattedUtcDate } from "@/services";
import { nanoid } from "nanoid";
import MedewerkerSearch from "../features/search/MedewerkerSearch.vue";
import { saveContactverzoek, useAfdelingen } from "@/features/contactverzoek";

const router = useRouter();
const contactmomentStore = useContactmomentStore();
const saving = ref(false);
const errorMessage = ref("");
const gespreksresultaten = useGespreksResultaten();

onMounted(() => {
  if (!contactmomentStore.huidigContactmoment) return;
  for (const vraag of contactmomentStore.huidigContactmoment.vragen) {
    if (vraag.contactverzoek.isActive) {
      vraag.resultaat = "Contactverzoek gemaakt";
    }
    if (!vraag.kanaal) {
      vraag.kanaal = userStore.preferences.kanaal;
    }
  }
});

const zakenToevoegenAanContactmoment = async (
  vraag: Vraag,
  contactmomentId: string
) => {
  for (const { zaak, shouldStore } of vraag.zaken) {
    if (shouldStore) {
      await koppelObject({
        contactmoment: contactmomentId,
        object: zaak.self,
        objectType: "zaak",
      });
    }
  }
};

const koppelKlanten = async (vraag: Vraag, contactmomentId: string) => {
  if (!vraag.klanten.length) {
    await koppelKlant({ contactmomentId, klantId: "" });

    return;
  }
  for (const { klant } of vraag.klanten) {
    await koppelKlant({ contactmomentId, klantId: klant.id });
  }
};

const koppelContactverzoek = (
  contacmomentId: string,
  contactverzoekUrl: string
) =>
  koppelObject({
    contactmoment: contacmomentId,
    object: contactverzoekUrl,
    objectType: "contactmomentobject",
  });

const saveVraag = async (vraag: Vraag, gespreksId?: string) => {
  const contactmoment: Contactmoment = {
    gespreksId,
    vorigContactmoment: undefined,
    voorkeurskanaal: "",
    voorkeurstaal: "",
    tekst: vraag.notitie,
    onderwerpLinks: [],
    initiatiefnemer: "klant", //enum "gemeente" of "klant"
    medewerker: "",
    medewerkerIdentificatie: undefined,
    resultaat: vraag.resultaat,
    kanaal: vraag.kanaal,
    bronorganisatie:
      Array.isArray(window.organisatieIds) && window.organisatieIds[0]
        ? window.organisatieIds[0]
        : "",
    registratiedatum: getFormattedUtcDate(),
    startdatum: vraag.startdatum,
    einddatum: getFormattedUtcDate(),
    primaireVraag: vraag.primaireVraag?.url,
    primaireVraagWeergave: vraag.primaireVraag?.title,
    afwijkendOnderwerp: vraag.afwijkendOnderwerp || undefined,
    afdeling: vraag.contactverzoek.afdeling,
  };

  addKennisartikelenToContactmoment(contactmoment, vraag);
  addWebsitesToContactmoment(contactmoment, vraag);
  addMedewerkersToContactmoment(contactmoment, vraag);
  addNieuwsberichtToContactmoment(contactmoment, vraag);
  addWerkinstructiesToContactmoment(contactmoment, vraag);

  let contactverzoekUrl: string | undefined;

  if (vraag.resultaat === "Contactverzoek gemaakt") {
    const contactverzoek = await saveContactverzoek({
      bronorganisatie: window.organisatieIds[0],
      todo: {
        name: "contactverzoek",
        description: vraag.contactverzoek.notitie,
        attendees: [vraag.contactverzoek.medewerker].filter(Boolean),
      },
      primaireVraagWeergave: vraag.primaireVraag?.title,
      afwijkendOnderwerp: vraag.afwijkendOnderwerp || undefined,
      afdeling: vraag.contactverzoek.afdeling,
    });

    await koppelKlanten(vraag, contactverzoek.id);

    contactverzoekUrl = contactverzoek.url;
  }

  const savedContactmoment = await saveContactmoment(contactmoment);
  await zakenToevoegenAanContactmoment(vraag, savedContactmoment.id);
  await koppelKlanten(vraag, savedContactmoment.id);

  if (contactverzoekUrl) {
    await koppelContactverzoek(savedContactmoment.id, contactverzoekUrl);
  }

  return savedContactmoment;
};

const navigateToPersonen = () => router.push({ name: "personen" });

async function submit() {
  try {
    saving.value = true;
    errorMessage.value = "";
    if (!contactmomentStore.huidigContactmoment) return;

    const { vragen } = contactmomentStore.huidigContactmoment;
    const firstVraag = vragen[0];
    const otherVragen = vragen.slice(1);

    let { gespreksId } = await saveVraag(firstVraag);
    if (!gespreksId) {
      gespreksId = nanoid();
    }

    for (const vraag of otherVragen) {
      await saveVraag(vraag, gespreksId);
    }

    //klaar
    contactmomentStore.stop();
    toast({ text: "Het contactmoment is opgeslagen" });
    navigateToPersonen();
  } catch (error) {
    errorMessage.value =
      "Er is een fout opgetreden bij opslaan van het contactmoment";
  } finally {
    saving.value = false;
  }
}
const addKennisartikelenToContactmoment = (
  contactmoment: Contactmoment,
  vraag: Vraag
) => {
  if (!vraag.kennisartikelen) return;

  vraag.kennisartikelen.forEach((kennisartikel) => {
    if (!kennisartikel.shouldStore) return;

    contactmoment.onderwerpLinks.push(kennisartikel.kennisartikel.url);
  });
};

const addWebsitesToContactmoment = (
  contactmoment: Contactmoment,
  vraag: Vraag
) => {
  if (!vraag.websites) return;

  vraag.websites.forEach((website) => {
    if (!website.shouldStore) return;

    contactmoment.onderwerpLinks.push(website.website.url);
  });
};

const addMedewerkersToContactmoment = (
  contactmoment: Contactmoment,
  vraag: Vraag
) => {
  if (!vraag.medewerkers) return;

  vraag.medewerkers.forEach((medewerker) => {
    if (!medewerker.shouldStore || !medewerker.medewerker.url) return;

    contactmoment.onderwerpLinks.push(medewerker.medewerker.url);
  });
};

const addNieuwsberichtToContactmoment = (
  contactmoment: Contactmoment,
  vraag: Vraag
) => {
  if (!vraag.nieuwsberichten) return;

  vraag.nieuwsberichten.forEach((nieuwsbericht) => {
    if (!nieuwsbericht.shouldStore) return;

    contactmoment.onderwerpLinks.push(nieuwsbericht.nieuwsbericht.url);
  });
};

const addWerkinstructiesToContactmoment = (
  contactmoment: Contactmoment,
  vraag: Vraag
) => {
  if (!vraag.werkinstructies) return;

  vraag.werkinstructies.forEach((werkinstructie) => {
    if (!werkinstructie.shouldStore) return;

    contactmoment.onderwerpLinks.push(werkinstructie.werkinstructie.url);
  });
};

const userStore = useUserStore();

function setUserChannel(e: Event) {
  if (!(e.target instanceof HTMLSelectElement)) return;
  userStore.setKanaal(e.target.value);
}

const cancelDialog = useConfirmDialog();
cancelDialog.onConfirm(() => {
  contactmomentStore.stop();
  navigateToPersonen();
});

const removeVraagDialog = useConfirmDialog();

const toggleRemoveVraagDialog = async (vraagId: number) => {
  await removeVraagDialog.reveal().then((res) => {
    if (res.isCanceled) return;

    contactmomentStore.removeVraag(vraagId);
  });
};

const afdelingen = useAfdelingen();
</script>

<style scoped lang="scss">
.afhandeling {
  max-width: var(--section-width-large);
  //content stacked
  display: flex;
  flex-direction: column;
}

:deep(.notitie) {
  min-height: 10rem;
  width: 100%;
  padding: var(--spacing-default);
  box-sizing: border-box;
  margin-top: var(--spacing-default);
}

.vraag-heading {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
}

.gerelateerde-resources {
  ul {
    margin-top: var(--spacing-small);
  }
  li {
    padding: var(--spacing-small);
    border: 1px solid var(--color-tertiary);

    &:not(:first-of-type) {
      border-top: none;
    }

    > label {
      display: flex;
      gap: var(--spacing-default);
      justify-content: space-between;
    }
  }

  input[type="checkbox"] {
    margin: 0.25rem;
    scale: 1.5;
  }
}

fieldset {
  display: grid;
  grid-template-columns: 15rem auto;
  gap: var(--spacing-default);
}

article {
  padding-block: var(--spacing-large);

  section {
    padding-block: var(--spacing-default);
  }
}

menu {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-large);
}

input,
select {
  accent-color: var(--color-primary);
}

.contactverzoek-container {
  padding-inline-start: var(--utrecht-form-input-padding-inline-start);
  padding-inline-end: var(--utrecht-form-input-padding-inline-end);
  padding-block: var(--spacing-default);
  border: 1px solid var(--color-primary);

  & > :not(:last-child) {
    margin-block-end: var(--spacing-default);
    padding-block-end: var(--spacing-default);
    border-bottom: var(--spacing-small) solid var(--color-primary);
  }

  span {
    display: block;
    font-weight: 600;
    color: var(--utrecht-form-label-color);
  }
}
.warning {
  padding: var(--spacing-default);
  margin-block-end: var(--spacing-default);
}
</style>
